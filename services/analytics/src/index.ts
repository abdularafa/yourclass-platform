import express from 'express';
import { prisma } from '@yourclass/database';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'analytics' }));

app.post('/api/v1/analytics/events', async (req, res) => {
  try {
    const { user_id, tenant_id, session_id, event_type, entity_type, entity_id, metadata } =
      req.body;
    const event = await prisma.analyticsEvent.create({
      data: { user_id, tenant_id, session_id, event_type, entity_type, entity_id, metadata },
    });
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('[Analytics] Event error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/analytics/dashboard', async (req, res) => {
  try {
    const { tenant_id, period = '7d' } = req.query;
    const now = new Date();
    let startDate = new Date();
    if (period === '24h') startDate.setHours(now.getHours() - 24);
    else if (period === '7d') startDate.setDate(now.getDate() - 7);
    else if (period === '30d') startDate.setDate(now.getDate() - 30);
    else if (period === '90d') startDate.setDate(now.getDate() - 90);

    const [
      totalStudents,
      totalRevenue,
      totalCourses,
      totalEnrollments,
      activeStudents,
      revenueByDay,
      topCourses,
      recentEvents,
    ] = await Promise.all([
      prisma.user.count({ where: { tenant_id: String(tenant_id), role: 'student' } }),
      prisma.payment.aggregate({
        where: { tenant_id: String(tenant_id), status: 'captured', created_at: { gte: startDate } },
        _sum: { amount: true },
      }),
      prisma.course.count({ where: { tenant_id: String(tenant_id), visibility: 'published' } }),
      prisma.enrollment.count({
        where: { tenant_id: String(tenant_id), enrolled_at: { gte: startDate } },
      }),
      prisma.user.count({
        where: {
          tenant_id: String(tenant_id),
          last_active_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.$queryRaw`SELECT DATE(created_at) as date, SUM(amount) as revenue FROM "Payment" WHERE tenant_id = ${String(tenant_id)} AND status = 'captured' AND created_at >= ${startDate} GROUP BY DATE(created_at) ORDER BY date`,
      prisma.course.findMany({
        where: { tenant_id: String(tenant_id) },
        orderBy: { total_enrolled: 'desc' },
        take: 5,
        select: { id: true, title: true, total_enrolled: true, total_rating: true },
      }),
      prisma.analyticsEvent.findMany({
        where: { tenant_id: String(tenant_id), created_at: { gte: startDate } },
        orderBy: { created_at: 'desc' },
        take: 50,
      }),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          total_students: totalStudents,
          total_revenue: totalRevenue._sum.amount || 0,
          total_courses: totalCourses,
          total_enrollments: totalEnrollments,
          active_students: activeStudents,
        },
        revenue_by_day: revenueByDay,
        top_courses: topCourses,
        recent_events: recentEvents,
      },
    });
  } catch (error) {
    console.error('[Analytics] Dashboard error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/analytics/revenue', async (req, res) => {
  try {
    const { tenant_id, teacher_id, period = '30d' } = req.query;
    const now = new Date();
    let startDate = new Date();
    if (period === '7d') startDate.setDate(now.getDate() - 7);
    else if (period === '30d') startDate.setDate(now.getDate() - 30);
    else if (period === '90d') startDate.setDate(now.getDate() - 90);
    else if (period === '1y') startDate.setFullYear(now.getFullYear() - 1);

    const where: Record<string, unknown> = { status: 'captured', created_at: { gte: startDate } };
    if (tenant_id) where.tenant_id = String(tenant_id);
    if (teacher_id) where.course = { teacher_id: String(teacher_id) };

    const revenue = await prisma.payment.aggregate({
      where,
      _sum: { amount: true, platform_fee: true, teacher_earning: true },
      _count: true,
    });
    const byCourse = await prisma.payment.groupBy({
      by: ['course_id'],
      where,
      _sum: { amount: true },
      _count: true,
    });

    res.json({
      success: true,
      data: {
        total_revenue: revenue._sum.amount || 0,
        total_platform_fee: revenue._sum.platform_fee || 0,
        total_teacher_earning: revenue._sum.teacher_earning || 0,
        transaction_count: revenue._count,
        by_course: byCourse,
      },
    });
  } catch (error) {
    console.error('[Analytics] Revenue error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/analytics/students', async (req, res) => {
  try {
    const { tenant_id, page = '1', limit = '20' } = req.query;
    const students = await prisma.user.findMany({
      where: { tenant_id: String(tenant_id), role: 'student' },
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
      select: {
        id: true,
        name: true,
        phone: true,
        last_active_at: true,
        created_at: true,
        _count: { select: { enrollments: true } },
      },
    });
    const total = await prisma.user.count({
      where: { tenant_id: String(tenant_id), role: 'student' },
    });
    res.json({
      success: true,
      data: students,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('[Analytics] Students error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/analytics/content', async (req, res) => {
  try {
    const { tenant_id, course_id } = req.query;
    const where: Record<string, unknown> = { tenant_id: String(tenant_id) };
    if (course_id) where.course_id = String(course_id);

    const videoStats = await prisma.video.aggregate({
      where,
      _sum: { duration: true },
      _count: true,
    });
    const watchStats = await prisma.watchProgress.aggregate({
      where: { video: where },
      _avg: { position_seconds: true },
      _count: true,
    });
    const completedVideos = await prisma.watchProgress.count({
      where: { video: where, completed: true },
    });

    res.json({
      success: true,
      data: {
        total_videos: videoStats._count,
        total_watch_time_seconds: videoStats._sum.duration || 0,
        avg_progress: watchStats._avg.position_seconds || 0,
        completed_videos: completedVideos,
        total_watch_sessions: watchStats._count,
      },
    });
  } catch (error) {
    console.error('[Analytics] Content error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

const PORT = process.env.PORT || 3010;
app.listen(PORT, () => console.log(`[Analytics Service] Running on port ${PORT}`));

export default app;
