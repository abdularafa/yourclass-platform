import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Starting database seed...');

  const subscriptionPlans = await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { id: 'starter' },
      update: {},
      create: {
        id: 'starter',
        name: 'Starter',
        price_monthly: 499,
        price_yearly: 4990,
        commission_rate: 0.15,
        max_students: 100,
        max_storage_gb: 5,
        max_courses: 10,
        features: { live_classes: true, certificates: false, custom_domain: false },
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { id: 'growth' },
      update: {},
      create: {
        id: 'growth',
        name: 'Growth',
        price_monthly: 1499,
        price_yearly: 14990,
        commission_rate: 0.12,
        max_students: 500,
        max_storage_gb: 25,
        max_courses: 50,
        features: { live_classes: true, certificates: true, custom_domain: false },
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { id: 'pro' },
      update: {},
      create: {
        id: 'pro',
        name: 'Pro',
        price_monthly: 4999,
        price_yearly: 49990,
        commission_rate: 0.1,
        max_students: 2000,
        max_storage_gb: 100,
        max_courses: 200,
        features: { live_classes: true, certificates: true, custom_domain: true },
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { id: 'enterprise' },
      update: {},
      create: {
        id: 'enterprise',
        name: 'Enterprise',
        price_monthly: 9999,
        price_yearly: 99990,
        commission_rate: 0.08,
        max_students: -1,
        max_storage_gb: -1,
        max_courses: -1,
        features: {
          live_classes: true,
          certificates: true,
          custom_domain: true,
          dedicated_support: true,
        },
      },
    }),
  ]);

  console.log('[Seed] Created subscription plans:', subscriptionPlans.length);

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { tenant_id_slug: { tenant_id: 'demo', slug: 'physics' } },
      update: {},
      create: {
        tenant_id: 'demo',
        name: 'Physics',
        color: '#7B5CF0',
        icon: 'science',
        sort_order: 1,
      },
    }),
    prisma.category.upsert({
      where: { tenant_id_slug: { tenant_id: 'demo', slug: 'chemistry' } },
      update: {},
      create: {
        tenant_id: 'demo',
        name: 'Chemistry',
        color: '#00D4A8',
        icon: 'biotech',
        sort_order: 2,
      },
    }),
    prisma.category.upsert({
      where: { tenant_id_slug: { tenant_id: 'demo', slug: 'mathematics' } },
      update: {},
      create: {
        tenant_id: 'demo',
        name: 'Mathematics',
        color: '#E8A020',
        icon: 'calculate',
        sort_order: 3,
      },
    }),
  ]);

  console.log('[Seed] Created categories:', categories.length);

  console.log('[Seed] Database seed completed successfully!');
}

main()
  .catch(e => {
    console.error('[Seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
