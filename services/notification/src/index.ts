import express from 'express';
import { z } from 'zod';
import { prisma } from '@yourclass/database';
import { v4 as uuidv4 } from 'uuid';

const createNotificationSchema = z.object({
  user_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  title: z.string().min(1),
  body: z.string().min(1),
  type: z.enum([
    'enrollment',
    'payment',
    'live_reminder',
    'test_result',
    'broadcast',
    'certificate',
    'system',
  ]),
  action_url: z.string().url().optional(),
});

const broadcastSchema = z.object({
  tenant_id: z.string().uuid(),
  type: z.enum(['all', 'batch', 'course']),
  batch_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
});

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification' }));

app.post('/api/v1/notifications', async (req, res) => {
  try {
    const data = createNotificationSchema.parse(req.body);
    const notification = await prisma.notification.create({ data: { ...data, id: uuidv4() } });
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Notification] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/notifications', async (req, res) => {
  try {
    const { user_id, tenant_id, unread_only, page = '1', limit = '20' } = req.query;
    const where: Record<string, unknown> = {};
    if (user_id) where.user_id = user_id;
    if (tenant_id) where.tenant_id = tenant_id;
    if (unread_only === 'true') where.read_at = null;

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { created_at: 'desc' },
      }),
      prisma.notification.count({ where }),
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('[Notification] List error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.patch('/api/v1/notifications/:id/read', async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read_at: new Date() },
    });
    res.json({ success: true, data: notification });
  } catch (error) {
    console.error('[Notification] Mark read error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/notifications/broadcast', async (req, res) => {
  try {
    const data = broadcastSchema.parse(req.body);
    let userIds: string[] = [];

    if (data.type === 'all') {
      const users = await prisma.user.findMany({
        where: { tenant_id: data.tenant_id },
        select: { id: true },
      });
      userIds = users.map(u => u.id);
    } else if (data.type === 'batch' && data.batch_id) {
      const enrollments = await prisma.enrollment.findMany({
        where: { batch_id: data.batch_id },
        select: { user_id: true },
      });
      userIds = enrollments.map(e => e.user_id);
    } else if (data.type === 'course' && data.course_id) {
      const enrollments = await prisma.enrollment.findMany({
        where: { course_id: data.course_id },
        select: { user_id: true },
      });
      userIds = enrollments.map(e => e.user_id);
    }

    const notifications = await Promise.all(
      userIds.map(userId =>
        prisma.notification.create({
          data: {
            id: uuidv4(),
            user_id: userId,
            tenant_id: data.tenant_id,
            title: data.title,
            body: data.body,
            type: 'broadcast',
          },
        })
      )
    );

    res.status(201).json({ success: true, data: { sent_count: notifications.length } });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Notification] Broadcast error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/notifications/unread-count', async (req, res) => {
  try {
    const { user_id } = req.query;
    const count = await prisma.notification.count({
      where: { user_id: String(user_id), read_at: null },
    });
    res.json({ success: true, data: { count } });
  } catch (error) {
    console.error('[Notification] Unread count error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`[Notification Service] Running on port ${PORT}`));

export default app;
