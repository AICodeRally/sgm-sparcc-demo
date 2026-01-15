# Multi-Tenancy & Authentication Setup Guide

This guide walks you through setting up SGM with multi-tenancy and authentication support.

## What Was Added

### 1. Database Schema (`prisma/schema.prisma`)
- ✅ **Tenant** model with tier (DEMO/BETA/PRODUCTION) and status (ACTIVE/SUSPENDED/TRIAL/EXPIRED)
- ✅ **User** model with role (SUPER_ADMIN/ADMIN/MANAGER/USER/VIEWER)
- ✅ **Account**, **Session**, **VerificationToken** models for NextAuth
- ✅ **Committee** and **Case** models for governance
- ✅ Tenant relations added to all existing models (Policy, Document, Territory, Approval, AuditLog)

### 2. Authentication (`lib/auth/`)
- ✅ NextAuth configuration with Google OAuth (primary) and GitHub OAuth (optional)
- ✅ Automatic tenant assignment based on email domain
- ✅ Role-based access control (RBAC)
- ✅ JWT sessions with tenant context
- ✅ Sign-in, sign-out, and error pages

### 3. Tenant Management (`app/admin/tenants/`)
- ✅ Tenant list page with stats
- ✅ Create new tenant form
- ✅ Tenant API endpoints (GET, POST, PATCH, DELETE)
- ✅ SUPER_ADMIN-only access control

### 4. Middleware (`middleware.ts`)
- ✅ Authentication enforcement on protected routes
- ✅ Tenant context injection into request headers
- ✅ Admin route protection
- ✅ Redirect to sign-in for unauthenticated users

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd <REPO_ROOT>
npm install next-auth@latest @next-auth/prisma-adapter
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env`:

```bash
# Generate a secure NextAuth secret
# Run: openssl rand -base64 32
NEXTAUTH_SECRET=<your-generated-secret>

# Google OAuth (https://console.cloud.google.com/apis/credentials)
GOOGLE_CLIENT_ID=<your-google-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-google-client-secret>

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sgm_production?schema=sgm_summit_demo
```

### Step 3: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Create **OAuth 2.0 Client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3003/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
5. Copy Client ID and Client Secret to `.env`

### Step 4: Run Database Migrations

```bash
# Generate Prisma client with new schema
npm run db:generate

# Create migration
npm run db:migrate -- --name add_multi_tenancy_and_auth

# Or if already in production, use:
npm run db:migrate:deploy
```

This will create:
- `tenants` table
- `users`, `accounts`, `sessions`, `verification_tokens` tables
- `committees`, `cases` tables
- Add `tenant` relation columns to existing tables

### Step 5: Seed Initial Tenants

Create `prisma/seed-tenants.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create Demo Tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo',
      tier: 'DEMO',
      status: 'ACTIVE',
      features: {
        maxDocuments: 100,
        maxUsers: 10,
        aiEnabled: true,
        auditRetentionDays: 365,
        customBranding: false,
      },
      settings: {
        industry: 'Demo',
      },
    },
  });

  // Create Demo Client Tenant
  const sampleClientTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-client' },
    update: {},
    create: {
      name: 'Demo Client, Inc.',
      slug: 'demo-client',
      tier: 'BETA',
      status: 'ACTIVE',
      features: {
        maxDocuments: 500,
        maxUsers: 50,
        aiEnabled: true,
        auditRetentionDays: 2555, // 7 years
        customBranding: true,
      },
      settings: {
        logo: '/logos/demo-client.png',
        primaryColor: '#005EB8',
        industry: 'Healthcare Distribution',
        employeeCount: 21000,
      },
    },
  });

  // Create BHG Tenant
  const bhgTenant = await prisma.tenant.upsert({
    where: { slug: 'bhg' },
    update: {},
    create: {
      name: 'Blue Horizons Group',
      slug: 'bhg',
      tier: 'PRODUCTION',
      status: 'ACTIVE',
      features: {
        maxDocuments: 1000,
        maxUsers: 100,
        aiEnabled: true,
        auditRetentionDays: 2555,
        customBranding: true,
      },
      settings: {
        industry: 'Consulting',
      },
    },
  });

  console.log('✅ Tenants seeded:', {
    demo: demoTenant.id,
    demo-client: sampleClientTenant.id,
    bhg: bhgTenant.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run the seed:

```bash
npx tsx prisma/seed-tenants.ts
```

### Step 6: Update App Layout

Update `app/layout.tsx` to include the SessionProvider:

```typescript
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Step 7: Test Authentication

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3003`

3. You should be redirected to `/auth/signin`

4. Sign in with Google

5. Your user will be created and assigned to a tenant based on email domain:
   - `@demo-client.com` → Demo Client tenant
   - `@bluehorizonsgroup.com` → BHG tenant
   - Others → Demo tenant

### Step 8: Create First Super Admin

After signing in once, manually update your user role in the database:

```sql
UPDATE users
SET role = 'SUPER_ADMIN'
WHERE email = 'your-email@example.com';
```

Or use Prisma Studio:

```bash
npm run db:studio
```

### Step 9: Access Tenant Management

1. Sign in as SUPER_ADMIN
2. Navigate to `http://localhost:3003/admin/tenants`
3. You can now:
   - View all tenants
   - Create new tenants
   - Edit tenant settings
   - Manage users

## Email Domain → Tenant Mapping

The system automatically assigns users to tenants based on their email domain:

| Email Domain | Tenant | Tier |
|--------------|--------|------|
| @demo-client.com | Demo Client | BETA |
| @bluehorizonsgroup.com | BHG | PRODUCTION |
| Others | Demo | DEMO |

To add more mappings, edit `lib/auth/auth.config.ts`:

```typescript
// Map email domains to tenants
if (emailDomain === 'demo-client.com') {
  tenantSlug = 'demo-client';
} else if (emailDomain.includes('bluehorizonsgroup')) {
  tenantSlug = 'bhg';
} else if (emailDomain === 'yourclient.com') {
  tenantSlug = 'yourclient';
}
```

## Using Tenant Context in API Routes

```typescript
import { getTenantContextFromRequest } from '@/lib/auth/tenant-context';

export async function GET(request: NextRequest) {
  const context = getTenantContextFromRequest(request);

  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use context.tenantId to filter data
  const documents = await prisma.document.findMany({
    where: { tenantId: context.tenantId },
  });

  return NextResponse.json(documents);
}
```

## Using Session in Client Components

```typescript
'use client';

import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <p>Tenant: {session.user.tenantName}</p>
      <p>Role: {session.user.role}</p>
    </div>
  );
}
```

## Role-Based Access Control

### Roles

- **SUPER_ADMIN**: Platform administrator (cross-tenant access)
- **ADMIN**: Tenant administrator
- **MANAGER**: Committee member, can approve
- **USER**: Standard user
- **VIEWER**: Read-only access

### Protecting Routes

In middleware:

```typescript
// middleware.ts already protects /admin/* routes for SUPER_ADMIN
```

In API routes:

```typescript
import { requireRole } from '@/lib/auth/tenant-context';

export async function POST(request: NextRequest) {
  const context = await requireTenantContext();

  // Require ADMIN or MANAGER role
  requireRole(context, 'ADMIN', 'MANAGER');

  // Proceed with operation
}
```

## Next Steps

1. **Import Demo Client Documents**:
   ```bash
   npx tsx scripts/import-demo-client-docs.ts
   ```

2. **Switch to Live Binding Mode**:
   ```bash
   # .env
   BINDING_MODE=live
   BINDING_MODE_DOCUMENT=live
   BINDING_MODE_POLICY=live
   # ... all other bindings
   ```

3. **Update Existing API Routes** to use tenant context

4. **Deploy to Production**:
   - Set up production database
   - Configure production OAuth URLs
   - Set `NODE_ENV=production`
   - Deploy to Vercel or your hosting platform

## Troubleshooting

### "Tenant context not found" error

- Ensure middleware is running
- Check that user is authenticated
- Verify headers are being set in middleware

### "Invalid session" error

- Regenerate `NEXTAUTH_SECRET`
- Clear browser cookies
- Restart dev server

### Database connection errors

- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check schema name matches (`?schema=sgm_summit_demo`)

### OAuth errors

- Verify redirect URIs in Google Console
- Check `NEXTAUTH_URL` matches your domain
- Ensure OAuth credentials are correct

## Security Considerations

1. **Never commit `.env` file** - use `.env.example` as template
2. **Rotate NEXTAUTH_SECRET** periodically
3. **Use HTTPS in production**
4. **Implement rate limiting** on auth endpoints
5. **Enable 2FA** for SUPER_ADMIN users
6. **Audit tenant access** regularly
7. **Backup database** before migrations

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Multi-Schema](https://www.prisma.io/docs/concepts/components/prisma-schema/multi-schema)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Vercel Deployment](https://vercel.com/docs)
