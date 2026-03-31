# YourClass - Next-Generation Ed-Tech Platform

A scalable, multi-tenant ed-tech platform built with the architecture specified for 100,000+ concurrent users.

## Project Structure

```
yourclass/
├── apps/
│   ├── student-app/         # React/Next.js student mobile-first app
│   ├── teacher-app/        # Teacher dashboard (to be built)
│   ├── admin-panel/        # Admin control panel (to be built)
│   └── api-gateway/        # API Gateway service
├── services/              # Backend microservices
│   ├── auth/              # Authentication service
│   ├── tenant/            # Multi-tenancy management
│   ├── course/            # Course management
│   ├── video/             # Video upload & streaming
│   ├── live/               # Live class service
│   ├── test/               # Assessment system
│   ├── payment/            # Payment processing
│   ├── notification/      # Push notifications
│   └── analytics/          # Analytics & reporting
├── packages/               # Shared packages
│   ├── api-config/        # Zod schemas & API types
│   ├── auth/               # JWT, OTP, rate limiting
│   ├── database/          # Prisma schema & client
│   ├── ui/                # Design system components
│   └── shared-utils/      # Utility functions
└── infrastructure/         # IaC & deployment configs
    ├── terraform/          # AWS infrastructure
    └── kubernetes/         # K8s manifests
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 14+
- Redis 7+

### Setup

1. Clone and install:
```bash
git clone <repo>
cd yourclass
pnpm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your credentials
```

3. Set up database:
```bash
cd packages/database
pnpm db:generate
pnpm db:push
```

4. Generate JWT keys:
```bash
node -e "const {generateKeyPair} = require('@yourclass/auth/jwt'); console.log(generateKeyPair())"
# Add keys to .env
```

5. Start services:
```bash
# Terminal 1: Auth service
cd services/auth
pnpm dev

# Terminal 2: Student app
cd apps/student-app
pnpm dev
```

## Design System

The UI follows the **Structured Dark Precision** design language:

- **Colors**: Dark backgrounds (#0D0D0F base), violet accent (#7B5CF0), teal for live indicators (#00D4A8)
- **Typography**: Syne (headings), DM Sans (body), JetBrains Mono (data)
- **Components**: Cards, Buttons, Inputs, Badges defined in `@yourclass/ui`

See `packages/ui/src/tokens.css` for the complete design token system.

## Architecture Highlights

### Multi-Tenancy
- Shared database with `tenant_id` on every table
- Subdomain-based tenant resolution (`{tenant}.yourclass.com`)
- Tenant-scoped data isolation at the query level

### Video Pipeline
- S3 pre-signed URLs for direct upload (no bandwidth through API)
- AWS MediaConvert for HLS transcoding
- CloudFront CDN with signed URLs
- Canvas watermark overlay on client

### Live Classes
- Agora RTC for WebRTC transport
- Auto-switch to CDN streaming at 300+ viewers
- Socket.io for real-time chat

### Security
- RS256 JWT with short-lived access tokens
- Refresh token rotation with family invalidation
- Rate limiting via Redis (sliding window)
- All payments verified server-side with webhook signatures

## Scripts

```bash
pnpm dev          # Start all apps in dev mode
pnpm build        # Build all packages and apps
pnpm lint         # Run ESLint
pnpm typecheck    # Run TypeScript check
pnpm test         # Run tests
```

## Deployment

See `.github/workflows/ci.yml` for the CI/CD pipeline.

Production deployment uses:
- EKS (Kubernetes) on AWS
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis
- S3 + CloudFront for media
- AWS MediaConvert for transcoding

## Contributing

1. Create feature branch from `develop`
2. Make changes with tests
3. Ensure lint/typecheck passes
4. Submit PR to `develop`

## License

Private - All rights reserved
