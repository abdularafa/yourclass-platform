import { NextResponse } from 'next/server';
import { prisma } from '@yourclass/database';

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo_url: true,
        primary_color: true,
        app_description: true,
        custom_domain: true,
        status: true,
      },
    });

    if (!tenant) {
      return NextResponse.json({ success: false, error: 'not_found' }, { status: 404 });
    }

    if (tenant.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'tenant_inactive', message: 'This app is currently unavailable' },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: tenant });
  } catch (error) {
    console.error('Tenant lookup error:', error);
    return NextResponse.json({ success: false, error: 'internal_error' }, { status: 500 });
  }
}
