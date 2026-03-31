import express from 'express';
import { z } from 'zod';
import { prisma } from '@yourclass/database';

const createCourseSchema = z.object({
  tenant_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  title: z.string().min(3),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  category_id: z.string().uuid().optional(),
  language: z.string().default('en'),
  pricing_model: z.enum(['free', 'one_time', 'subscription', 'installment']),
  price: z.number().min(0),
  discount_price: z.number().min(0).optional(),
  validity_days: z.number().positive().optional(),
  enrollment_limit: z.number().positive().optional(),
  certificate_enabled: z.boolean().default(false),
  prerequisites: z.array(z.string().uuid()).default([]),
  visibility: z.enum(['draft', 'published', 'unlisted', 'archived']).default('draft'),
  drip_content: z.boolean().default(false),
});

const createModuleSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  sequence: z.number().int().positive(),
  is_free_preview: z.boolean().default(false),
});

const createLessonSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(1),
  lesson_type: z.enum(['video', 'pdf', 'text', 'audio', 'quiz', 'live', 'external_link']),
  sequence: z.number().int().positive(),
  video_id: z.string().uuid().optional(),
  content: z.string().optional(),
  test_id: z.string().uuid().optional(),
  external_url: z.string().url().optional(),
  duration_seconds: z.number().int().positive().optional(),
  is_published: z.boolean().default(false),
  is_free_preview: z.boolean().default(false),
  drip_days: z.number().int().positive().optional(),
});

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'course' }));

app.post('/api/v1/courses', async (req, res) => {
  try {
    const data = createCourseSchema.parse(req.body);
    const course = await prisma.course.create({ data });
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Course] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/courses', async (req, res) => {
  try {
    const {
      tenant_id,
      teacher_id,
      visibility,
      category_id,
      search,
      page = '1',
      limit = '20',
    } = req.query;
    const where: Record<string, unknown> = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (teacher_id) where.teacher_id = teacher_id;
    if (visibility) where.visibility = visibility;
    if (category_id) where.category_id = category_id;
    if (search) where.title = { contains: String(search), mode: 'insensitive' };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { created_at: 'desc' },
        include: {
          teacher: { include: { user: true } },
          category: true,
          _count: { select: { enrollments: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    res.json({
      success: true,
      data: courses,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('[Course] List error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/courses/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        teacher: { include: { user: true } },
        category: true,
        modules: {
          where: { is_published: true },
          include: { lessons: { where: { is_published: true } } },
          orderBy: { sequence: 'asc' },
        },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) return res.status(404).json({ success: false, error: 'not_found' });
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('[Course] Get error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.patch('/api/v1/courses/:id', async (req, res) => {
  try {
    const data = createCourseSchema.partial().parse(req.body);
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: { ...data, ...(data.visibility === 'published' && { published_at: new Date() }) },
    });
    res.json({ success: true, data: course });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Course] Update error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.delete('/api/v1/courses/:id', async (req, res) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    console.error('[Course] Delete error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/modules', async (req, res) => {
  try {
    const data = createModuleSchema.parse(req.body);
    const module = await prisma.module.create({ data });
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Module] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/modules/:id', async (req, res) => {
  try {
    const module = await prisma.module.findUnique({
      where: { id: req.params.id },
      include: { lessons: { orderBy: { sequence: 'asc' } }, course: true },
    });
    if (!module) return res.status(404).json({ success: false, error: 'not_found' });
    res.json({ success: true, data: module });
  } catch (error) {
    console.error('[Module] Get error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.patch('/api/v1/modules/:id', async (req, res) => {
  try {
    const data = createModuleSchema.partial().parse(req.body);
    const module = await prisma.module.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: module });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Module] Update error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.delete('/api/v1/modules/:id', async (req, res) => {
  try {
    await prisma.module.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Module deleted' });
  } catch (error) {
    console.error('[Module] Delete error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/lessons', async (req, res) => {
  try {
    const data = createLessonSchema.parse(req.body);
    const course = await prisma.course.findUnique({
      where: { id: (await prisma.module.findUnique({ where: { id: data.module_id } }))?.course_id },
      select: { tenant_id: true },
    });
    if (course) {
      (data as { tenant_id: string }).tenant_id = course.tenant_id;
    }
    const lesson = await prisma.lesson.create({ data });
    res.status(201).json({ success: true, data: lesson });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Lesson] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/lessons/:id', async (req, res) => {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: req.params.id },
      include: { video: true, test: true, module: true },
    });
    if (!lesson) return res.status(404).json({ success: false, error: 'not_found' });
    res.json({ success: true, data: lesson });
  } catch (error) {
    console.error('[Lesson] Get error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.patch('/api/v1/lessons/:id', async (req, res) => {
  try {
    const data = createLessonSchema.partial().parse(req.body);
    const lesson = await prisma.lesson.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: lesson });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Lesson] Update error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.delete('/api/v1/lessons/:id', async (req, res) => {
  try {
    await prisma.lesson.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    console.error('[Lesson] Delete error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/categories', async (req, res) => {
  try {
    const { tenant_id } = req.query;
    const categories = await prisma.category.findMany({
      where: tenant_id ? { tenant_id: String(tenant_id) } : undefined,
      orderBy: { sort_order: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('[Category] List error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/categories', async (req, res) => {
  try {
    const { tenant_id, name, color, icon } = req.body;
    const category = await prisma.category.create({
      data: {
        tenant_id,
        name,
        color,
        icon,
        sort_order: (await prisma.category.count({ where: { tenant_id } })) + 1,
      },
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('[Category] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`[Course Service] Running on port ${PORT}`));

export default app;
