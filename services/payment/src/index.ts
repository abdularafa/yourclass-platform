import express from 'express';
import { z } from 'zod';
import { prisma } from '@yourclass/database';
import { v4 as uuidv4 } from 'uuid';

const createPaymentSchema = z.object({
  user_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  course_id: z.string().uuid().optional(),
  batch_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  coupon_code: z.string().optional(),
});

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'payment' }));

app.post('/api/v1/payments/create-order', async (req, res) => {
  try {
    const { user_id, tenant_id, course_id, batch_id, amount, currency, coupon_code } =
      createPaymentSchema.parse(req.body);

    let finalAmount = amount;
    let discountAmount = 0;

    if (coupon_code) {
      const coupon = await prisma.coupon.findFirst({
        where: { code: coupon_code.toUpperCase(), tenant_id, is_active: true },
      });
      if (coupon && (!coupon.expires_at || coupon.expires_at > new Date())) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = (amount * coupon.discount_value) / 100;
          if (coupon.max_discount_amount)
            discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
        } else {
          discountAmount = coupon.discount_value;
        }
        finalAmount = Math.max(0, amount - discountAmount);
      }
    }

    const tenant = await prisma.tenant.findUnique({ where: { id: tenant_id } });
    const platformFee = finalAmount * (tenant?.commission_rate || 0.15);
    const teacherEarning = finalAmount - platformFee;

    const payment = await prisma.payment.create({
      data: {
        id: uuidv4(),
        user_id,
        tenant_id,
        course_id,
        batch_id,
        amount: finalAmount,
        currency,
        status: 'pending',
        platform_fee: platformFee,
        teacher_earning: teacherEarning,
        coupon_code,
        coupon_discount: discountAmount,
      },
    });

    res
      .status(201)
      .json({
        success: true,
        data: {
          id: payment.id,
          amount: finalAmount,
          currency,
          platform_fee: platformFee,
          teacher_earning: teacherEarning,
        },
      });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Payment] Create order error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/payments/webhook', async (req, res) => {
  try {
    const { payment_id, status, gateway_payment_id, gateway_order_id } = req.body;

    const payment = await prisma.payment.update({
      where: { id: payment_id },
      data: {
        status: status === 'captured' ? 'captured' : 'failed',
        gateway_payment_id,
        gateway_order_id,
      },
    });

    if (status === 'captured') {
      if (payment.course_id) {
        await prisma.enrollment.create({
          data: {
            user_id: payment.user_id,
            course_id: payment.course_id,
            tenant_id: payment.tenant_id,
            payment_id: payment.id,
            access_type: 'purchased',
          },
        });
      }
      if (payment.batch_id) {
        const batch = await prisma.batch.findUnique({ where: { id: payment.batch_id } });
        if (batch) {
          await prisma.enrollment.create({
            data: {
              user_id: payment.user_id,
              batch_id: payment.batch_id,
              tenant_id: payment.tenant_id,
              payment_id: payment.id,
              access_type: 'purchased',
            },
          });
          await prisma.batch.update({
            where: { id: payment.batch_id },
            data: { enrolled_count: { increment: 1 } },
          });
        }
      }
    }

    await prisma.paymentEvent.create({
      data: { id: uuidv4(), payment_id, event_type: status, payload: req.body },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('[Payment] Webhook error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/payments', async (req, res) => {
  try {
    const { tenant_id, user_id, status, page = '1', limit = '20' } = req.query;
    const where: Record<string, unknown> = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (user_id) where.user_id = user_id;
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { created_at: 'desc' },
        include: { user: true, course: true },
      }),
      prisma.payment.count({ where }),
    ]);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('[Payment] List error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/coupons', async (req, res) => {
  try {
    const {
      tenant_id,
      code,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      max_uses,
      per_user_limit,
      course_id,
      expires_at,
    } = req.body;
    const coupon = await prisma.coupon.create({
      data: {
        tenant_id,
        code: code.toUpperCase(),
        discount_type,
        discount_value,
        min_order_amount,
        max_discount_amount,
        max_uses,
        per_user_limit,
        course_id,
        expires_at: expires_at ? new Date(expires_at) : null,
      },
    });
    res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    console.error('[Coupon] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/coupons/validate', async (req, res) => {
  try {
    const { code, tenant_id, amount } = req.query;
    const coupon = await prisma.coupon.findFirst({
      where: { code: String(code).toUpperCase(), tenant_id: String(tenant_id), is_active: true },
    });

    if (!coupon) return res.status(404).json({ success: false, error: 'coupon_not_found' });
    if (coupon.expires_at && coupon.expires_at < new Date())
      return res.status(400).json({ success: false, error: 'coupon_expired' });
    if (coupon.max_uses && coupon.used_count >= coupon.max_uses)
      return res.status(400).json({ success: false, error: 'coupon_limit_reached' });
    if (coupon.min_order_amount && amount && Number(amount) < coupon.min_order_amount)
      return res
        .status(400)
        .json({ success: false, error: 'min_order_not_met', min_amount: coupon.min_order_amount });

    let discount = coupon.discount_value;
    if (coupon.discount_type === 'percentage' && amount) {
      discount = (Number(amount) * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) discount = Math.min(discount, coupon.max_discount_amount);
    }

    res.json({
      success: true,
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discount,
      },
    });
  } catch (error) {
    console.error('[Coupon] Validate error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/payouts', async (req, res) => {
  try {
    const {
      tenant_id,
      teacher_id,
      amount,
      payout_type,
      payout_account,
      payout_bank_name,
      payout_ifsc,
    } = req.body;
    const teacher = await prisma.teacherProfile.findFirst({ where: { id: teacher_id, tenant_id } });
    if (!teacher) return res.status(404).json({ success: false, error: 'teacher_not_found' });
    if (teacher.available_balance < amount)
      return res.status(400).json({ success: false, error: 'insufficient_balance' });

    const payout = await prisma.payout.create({
      data: {
        id: uuidv4(),
        tenant_id,
        teacher_id,
        amount,
        status: 'pending',
        payout_type,
        payout_account,
        payout_bank_name,
        payout_ifsc,
      },
    });

    await prisma.teacherProfile.update({
      where: { id: teacher_id },
      data: { available_balance: { decrement: amount } },
    });

    res.status(201).json({ success: true, data: payout });
  } catch (error) {
    console.error('[Payout] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`[Payment Service] Running on port ${PORT}`));

export default app;
