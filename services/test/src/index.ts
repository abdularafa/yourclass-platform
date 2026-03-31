import express from 'express';
import { z } from 'zod';
import { prisma } from '@yourclass/database';
import { v4 as uuidv4 } from 'uuid';

const createTestSchema = z.object({
  tenant_id: z.string().uuid(),
  course_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  title: z.string().min(1),
  instructions: z.string().optional(),
  time_limit_seconds: z.number().int().positive().optional(),
  marks_per_question: z.number().positive().default(1),
  negative_marking_pct: z.number().min(0).max(100).default(0),
  passing_score_pct: z.number().min(0).max(100).default(35),
  max_attempts: z.number().int().positive().default(1),
  shuffle_questions: z.boolean().default(false),
  shuffle_options: z.boolean().default(false),
  result_visibility: z.enum(['immediate', 'delayed', 'manual']).default('immediate'),
  is_published: z.boolean().default(false),
});

const createQuestionSchema = z.object({
  test_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  question_text: z.string().min(1),
  question_image_url: z.string().url().optional(),
  question_type: z.enum(['mcq', 'msq', 'true_false', 'fill_blank', 'subjective']).default('mcq'),
  section: z.string().optional(),
  marks: z.number().positive().default(1),
  negative_marks: z.number().min(0).default(0),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  explanation: z.string().optional(),
  explanation_video_url: z.string().url().optional(),
  sequence: z.number().int().positive(),
  options: z
    .array(
      z.object({
        option_text: z.string(),
        option_image_url: z.string().url().optional(),
        is_correct: z.boolean(),
        sequence: z.number().int().positive(),
      })
    )
    .optional(),
});

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'test' }));

app.post('/api/v1/tests', async (req, res) => {
  try {
    const data = createTestSchema.parse(req.body);
    const test = await prisma.test.create({ data: { ...data, id: uuidv4() } });
    res.status(201).json({ success: true, data: test });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Test] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/tests', async (req, res) => {
  try {
    const { tenant_id, course_id, teacher_id, is_published, page = '1', limit = '20' } = req.query;
    const where: Record<string, unknown> = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (course_id) where.course_id = course_id;
    if (teacher_id) where.teacher_id = teacher_id;
    if (is_published !== undefined) where.is_published = is_published === 'true';

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { created_at: 'desc' },
        include: { course: true, _count: { select: { questions: true, attempts: true } } },
      }),
      prisma.test.count({ where }),
    ]);

    res.json({
      success: true,
      data: tests,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('[Test] List error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/tests/:id', async (req, res) => {
  try {
    const test = await prisma.test.findUnique({
      where: { id: req.params.id },
      include: {
        questions: { include: { options: true }, orderBy: { sequence: 'asc' } },
        course: true,
        teacher: { include: { user: true } },
      },
    });
    if (!test) return res.status(404).json({ success: false, error: 'not_found' });
    res.json({ success: true, data: test });
  } catch (error) {
    console.error('[Test] Get error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/questions', async (req, res) => {
  try {
    const data = createQuestionSchema.parse(req.body);
    const question = await prisma.question.create({
      data: { ...data, id: uuidv4() },
      include: { options: true },
    });

    if (data.options && data.options.length > 0) {
      for (const opt of data.options) {
        await prisma.option.create({ data: { id: uuidv4(), question_id: question.id, ...opt } });
      }
    }

    res.status(201).json({ success: true, data: question });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Question] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/test-attempts/start', async (req, res) => {
  try {
    const { test_id, user_id, lesson_id } = req.body;
    const test = await prisma.test.findUnique({ where: { id: test_id } });
    if (!test) return res.status(404).json({ success: false, error: 'test_not_found' });

    const existingAttempts = await prisma.testAttempt.count({
      where: { test_id, user_id, status: 'completed' },
    });
    if (existingAttempts >= test.max_attempts)
      return res.status(400).json({ success: false, error: 'max_attempts_reached' });

    const questions = await prisma.question.findMany({
      where: { test_id },
      orderBy: { sequence: 'asc' },
    });
    let questionOrder = questions.map(q => q.id);
    if (test.shuffle_questions) questionOrder = questionOrder.sort(() => Math.random() - 0.5);

    const attempt = await prisma.testAttempt.create({
      data: {
        id: uuidv4(),
        test_id,
        user_id,
        lesson_id,
        status: 'in_progress',
        question_order: questionOrder,
      },
    });

    res
      .status(201)
      .json({
        success: true,
        data: {
          attempt_id: attempt.id,
          question_order: questionOrder,
          time_limit_seconds: test.time_limit_seconds,
        },
      });
  } catch (error) {
    console.error('[TestAttempt] Start error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/test-attempts/:id/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: req.params.id },
      include: { test: true },
    });
    if (!attempt) return res.status(404).json({ success: false, error: 'attempt_not_found' });
    if (attempt.status !== 'in_progress')
      return res.status(400).json({ success: false, error: 'attempt_already_submitted' });

    let totalMarks = 0;
    let correctAnswers = 0;

    for (const answer of answers) {
      const question = await prisma.question.findUnique({
        where: { id: answer.question_id },
        include: { options: true },
      });
      if (!question) continue;

      const correctOptions = question.options.filter(o => o.is_correct).map(o => o.id);
      const selectedCorrect =
        answer.selected_option_ids.every(id => correctOptions.includes(id)) &&
        answer.selected_option_ids.length === correctOptions.length;

      let marks = 0;
      if (selectedCorrect) {
        marks = question.marks;
        correctAnswers++;
      } else if (question.negative_marks > 0) {
        marks = -((question.marks * question.negative_marks) / 100);
      }
      totalMarks += marks;

      await prisma.testAnswer.create({
        data: {
          id: uuidv4(),
          attempt_id: attempt.id,
          question_id: answer.question_id,
          selected_option_ids: answer.selected_option_ids,
          is_correct: selectedCorrect,
          marks_awarded: marks,
          time_spent_seconds: answer.time_spent_seconds,
        },
      });
    }

    const percentage =
      (totalMarks /
        (attempt.test.marks_per_question *
          (await prisma.question.count({ where: { test_id: attempt.test_id } })))) *
      100;
    const passed = percentage >= attempt.test.passing_score_pct;

    await prisma.testAttempt.update({
      where: { id: req.params.id },
      data: {
        status: 'completed',
        submitted_at: new Date(),
        score: totalMarks,
        total_marks:
          attempt.test.marks_per_question *
          (await prisma.question.count({ where: { test_id: attempt.test_id } })),
        percentage,
        is_flagged: req.body.is_flagged,
      },
    });

    res.json({
      success: true,
      data: {
        score: totalMarks,
        percentage,
        passed,
        correct_answers: correctAnswers,
        total_questions: answers.length,
      },
    });
  } catch (error) {
    console.error('[TestAttempt] Submit error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/test-attempts/:id', async (req, res) => {
  try {
    const attempt = await prisma.testAttempt.findUnique({
      where: { id: req.params.id },
      include: {
        test: { include: { questions: { include: { options: true } } } },
        answers: { include: { question: true } },
        user: true,
      },
    });
    if (!attempt) return res.status(404).json({ success: false, error: 'not_found' });
    res.json({ success: true, data: attempt });
  } catch (error) {
    console.error('[TestAttempt] Get error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`[Test Service] Running on port ${PORT}`));

export default app;
