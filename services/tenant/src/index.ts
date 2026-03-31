import express from 'express';
import { z } from 'zod';
import { prisma } from '@yourclass/database';
import { v4 as uuidv4 } from 'uuid';

const createTenantSchema = z.object({
  name: z.string().min(2),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/),
  subdomain: z
    .string()
    .min(3)
    .regex(/^[a-z0-9]+$/),
  app_name: z.string().min(2),
  primary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
  user_id: z.string().uuid(),
});

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'tenant' });
});

app.post('/api/v1/tenants', async (req, res) => {
  try {
    const data = createTenantSchema.parse(req.body);

    const existingSlug = await prisma.tenant.findUnique({ where: { slug: data.slug } });
    if (existingSlug) {
      return res
        .status(409)
        .json({ success: false, error: 'slug_exists', message: 'Slug already taken' });
    }

    const existingSubdomain = await prisma.tenant.findUnique({
      where: { subdomain: data.subdomain },
    });
    if (existingSubdomain) {
      return res
        .status(409)
        .json({ success: false, error: 'subdomain_exists', message: 'Subdomain already taken' });
    }

    const tenant = await prisma.tenant.create({
      data: {
        id: uuidv4(),
        name: data.name,
        slug: data.slug,
        subdomain: data.subdomain,
        primary_color: data.primary_color || '#7B5CF0',
        status: 'active',
      },
    });

    await prisma.teacherProfile.create({
      data: {
        user_id: data.user_id,
        tenant_id: tenant.id,
      },
    });

    res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(422)
        .json({ success: false, error: 'validation_error', details: error.errors });
    }
    console.error('[Tenant] Create error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/tenants/:id', async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.params.id },
      include: { teacher_profiles: { include: { user: true } } },
    });

    if (!tenant) {
      return res.status(404).json({ success: false, error: 'not_found' });
    }

    res.json({ success: true, data: tenant });
  } catch (error) {
    console.error('[Tenant] Get error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.patch('/api/v1/tenants/:id', async (req, res) => {
  try {
    const { name, primary_color, logo_url, app_description, custom_domain } = req.body;

    const tenant = await prisma.tenant.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(primary_color && { primary_color }),
        ...(logo_url && { logo_url }),
        ...(app_description && { app_description }),
        ...(custom_domain && { custom_domain }),
      },
    });

    res.json({ success: true, data: tenant });
  } catch (error) {
    console.error('[Tenant] Update error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/tenants/slug/:slug', async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: req.params.slug },
      select: {
        id: true,
        name: true,
        subdomain: true,
        logo_url: true,
        primary_color: true,
        app_description: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({ success: false, error: 'not_found' });
    }

    res.json({ success: true, data: tenant });
  } catch (error) {
    console.error('[Tenant] Get by slug error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

app.get('/api/v1/tenants/subdomain/:subdomain', async (req, res) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { subdomain: req.params.subdomain },
      select: {
        id: true,
        name: true,
        subdomain: true,
        logo_url: true,
        primary_color: true,
        app_description: true,
        status: true,
      },
    });

    if (!tenant) {
      return res.status(404).json({ success: false, error: 'not_found' });
    }

    if (tenant.status !== 'active') {
      return res
        .status(403)
        .json({
          success: false,
          error: 'tenant_inactive',
          message: 'This app is currently unavailable',
        });
    }

    res.json({ success: true, data: tenant });
  } catch (error) {
    console.error('[Tenant] Get by subdomain error:', error);
    res.status(500).json({ success: false, error: 'internal_error' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`[Tenant Service] Running on port ${PORT}`));

export default app;
