import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@sgm-sparcc.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

  // 1. Upsert the default tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'sgm-demo' },
    update: {
      name: 'SGM Demo',
      tier: 'PRODUCTION',
      status: 'ACTIVE',
      features: { maxDocuments: 1000, maxUsers: 50, aiEnabled: true },
      settings: { branding: { name: 'SGM Demo' }, industry: 'technology' },
    },
    create: {
      name: 'SGM Demo',
      slug: 'sgm-demo',
      tier: 'PRODUCTION',
      status: 'ACTIVE',
      features: { maxDocuments: 1000, maxUsers: 50, aiEnabled: true },
      settings: { branding: { name: 'SGM Demo' }, industry: 'technology' },
    },
  });

  console.log(`Tenant upserted: "${tenant.name}" (id: ${tenant.id}, slug: ${tenant.slug})`);

  // 2. Hash the admin password
  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  // 3. Upsert the admin user
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      tenantId: tenant.id,
    },
    create: {
      email: adminEmail,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      isActive: true,
      tenantId: tenant.id,
    },
  });

  console.log(`Admin user upserted: "${adminUser.email}" (id: ${adminUser.id}, role: ${adminUser.role})`);
  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
