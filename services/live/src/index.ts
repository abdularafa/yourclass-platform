import express from 'express';
import { z } from 'zod';
import { prisma } from '@yourclass/database';
import { v4 as uuidv4 } from 'uuid';

const createSessionSchema = z.object({
  tenant_id: z.string().uuid(),
  teacher_id: z.string().uuid(),
  course_id: z.string().uuid(),
  batch_id: z.string().uuid().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  scheduled_at: z.string(),
  duration_minutes: z.number().int().positive().default(60),
  max_viewers: z.number().int().positive().default(300),
});

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'live' }));

app.post('/api/v1/live-sessions', async (req, res) => {
  try {
    const data = createSessionSchema.parse(req.body);
    const agoraChannel = `live-${uuidv4().slice(0, 8)}`;
    const session = await prisma.liveSession.create({
      data: {
        id: uuidv4(),
        ...data,
        scheduled_at: new Date(data.scheduled_at),
        agora_channel: agoraChannel,
        status: 'scheduled',
      },
    });
    res.status(201).json({ success: true, data: { ...session, agora_channel: agoraChannel } });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Live] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/live-sessions', async (req, res) => {
  try {
    const { tenant_id, course_id, batch_id, status, page = '1', limit = '20' } = req.query;
    const where: Record<string, unknown> = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (course_id) where.course_id = course_id;
    if (batch_id) where.batch_id = batch_id;
    if (status) where.status = status;

    const [sessions, total] = await Promise.all([
      prisma.liveSession.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { scheduled_at: 'asc' },
        include: { teacher: { include: { user: true } }, course: true, batch: true },
      }),
      prisma.liveSession.count({ where }),
    ]);

    res.json({
      success: true,
      data: sessions,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('[Live] List error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/live-sessions/upcoming', async (req, res) => {
  try {
    const { tenant_id } = req.query;
    const sessions = await prisma.liveSession.findMany({
      where: {
        tenant_id: String(tenant_id),
        status: 'scheduled',
        scheduled_at: { gte: new Date() },
      },
      orderBy: { scheduled_at: 'asc' },
      take: 10,
      include: { teacher: { include: { user: true } }, course: true },
    });
    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('[Live] Upcoming error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/live-sessions/:id', async (req, res) => {
  try {
    const session = await prisma.liveSession.findUnique({
      where: { id: req.params.id },
      include: { teacher: { include: { user: true } }, course: true, batch: true },
    });
    if (!session) return res.status(404).json({ success: false, error: 'not_found' });
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('[Live] Get error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.patch('/api/v1/live-sessions/:id', async (req, res) => {
  try {
    const { title, description, scheduled_at, status, recording_url } = req.body;
    const session = await prisma.liveSession.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(scheduled_at && { scheduled_at: new Date(scheduled_at) }),
        ...(status && { status }),
        ...(recording_url && { recording_url }),
      },
    });
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('[Live] Update error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/live-sessions/:id/start', async (req, res) => {
  try {
    const session = await prisma.liveSession.update({
      where: { id: req.params.id },
      data: { status: 'live', actual_start_at: new Date() },
    });
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('[Live] Start error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/live-sessions/:id/end', async (req, res) => {
  try {
    const { recording_url } = req.body;
    const session = await prisma.liveSession.update({
      where: { id: req.params.id },
      data: { status: 'ended', actual_end_at: new Date(), recording_url },
    });
    res.json({ success: true, data: session });
  } catch (error) {
    console.error('[Live] End error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => console.log(`[Live Service] Running on port ${PORT}`));

export default app;
