import express from 'express';
import { z } from 'zod';
import { prisma } from '@yourclass/database';
import { v4 as uuidv4 } from 'uuid';

const createVideoSchema = z.object({
  tenant_id: z.string().uuid(),
  uploader_id: z.string().uuid(),
  title: z.string().min(1),
  s3_key: z.string().min(1),
  file_size: z.number().optional(),
});

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'video' }));

app.post('/api/v1/videos', async (req, res) => {
  try {
    const data = createVideoSchema.parse(req.body);
    const video = await prisma.video.create({
      data: { ...data, id: uuidv4(), transcode_status: 'pending' },
    });
    res.status(201).json({ success: true, data: video });
  } catch (error) {
    if (error instanceof z.ZodError)
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    console.error('[Video] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/videos', async (req, res) => {
  try {
    const { tenant_id, uploader_id, transcode_status, page = '1', limit = '20' } = req.query;
    const where: Record<string, unknown> = {};
    if (tenant_id) where.tenant_id = tenant_id;
    if (uploader_id) where.uploader_id = uploader_id;
    if (transcode_status) where.transcode_status = transcode_status;

    const [videos, total] = await Promise.all([
      prisma.video.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { created_at: 'desc' },
      }),
      prisma.video.count({ where }),
    ]);

    res.json({
      success: true,
      data: videos,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error('[Video] List error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/videos/:id', async (req, res) => {
  try {
    const video = await prisma.video.findUnique({ where: { id: req.params.id } });
    if (!video) return res.status(404).json({ success: false, error: 'not_found' });
    res.json({ success: true, data: video });
  } catch (error) {
    console.error('[Video] Get error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.patch('/api/v1/videos/:id', async (req, res) => {
  try {
    const { hls_master_url, thumbnail_url, transcode_status, duration, resolution_variants } =
      req.body;
    const video = await prisma.video.update({
      where: { id: req.params.id },
      data: { hls_master_url, thumbnail_url, transcode_status, duration, resolution_variants },
    });
    res.json({ success: true, data: video });
  } catch (error) {
    console.error('[Video] Update error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.post('/api/v1/videos/:id/progress', async (req, res) => {
  try {
    const { user_id, position_seconds, duration_seconds, completed } = req.body;
    const video = await prisma.video.findUnique({ where: { id: req.params.id } });
    if (!video) return res.status(404).json({ success: false, error: 'not_found' });

    const progress = await prisma.watchProgress.upsert({
      where: { user_id_video_id: { user_id, video_id: req.params.id } },
      update: { position_seconds, duration_seconds, completed, last_watched_at: new Date() },
      create: {
        user_id,
        video_id: req.params.id,
        tenant_id: video.tenant_id,
        position_seconds,
        duration_seconds,
        completed,
      },
    });

    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('[Video] Progress error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/videos/:id/progress/:userId', async (req, res) => {
  try {
    const progress = await prisma.watchProgress.findUnique({
      where: { user_id_video_id: { user_id: req.params.userId, video_id: req.params.id } },
    });
    res.json({ success: true, data: progress });
  } catch (error) {
    console.error('[Video] Get progress error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`[Video Service] Running on port ${PORT}`));

export default app;
