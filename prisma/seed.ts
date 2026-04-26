import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';

const url = process.env['DATABASE_URL'];
if (!url) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

const parsed = new URL(url);
const adapter = new PrismaMariaDb({
  host: parsed.hostname,
  port: parsed.port ? parseInt(parsed.port, 10) : 3306,
  user: parsed.username,
  password: parsed.password,
  database: parsed.pathname.replace(/^\//, ''),
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding initial data...');

  // --- Languages ---
  const es = await prisma.language.upsert({
    where: { iso_code: 'es' },
    update: {},
    create: {
      iso_code: 'es',
      name: 'Espanol',
      is_active: true,
    },
  });

  const en = await prisma.language.upsert({
    where: { iso_code: 'en' },
    update: {},
    create: {
      iso_code: 'en',
      name: 'English',
      is_active: true,
    },
  });

  console.log('Languages seeded:', { es: es.iso_code, en: en.iso_code });

  // --- Sample Product (C-GO Platform) ---
  const product = await prisma.product.create({
    data: {
      name: JSON.stringify({ es: 'Plataforma C-GO', en: 'C-GO Platform' }),
      description: JSON.stringify({ es: 'Gestion centralizada de satelites y protocolos', en: 'Centralized management of satellites and protocols' }),
      icon: 'hub',
      is_active: true,
    },
  });

  console.log('Sample Product seeded:', product.id);

  // --- Sample Module (Monitoring) ---
  const module = await prisma.module.create({
    data: {
      product_id: product.id,
      name: JSON.stringify({ es: 'Monitoreo', en: 'Monitoring' }),
      description: JSON.stringify({ es: 'Seguimiento en tiempo real', en: 'Real-time tracking' }),
      icon: 'radar',
      is_active: true,
    },
  });

  // --- Sample Feature (Fleet Tracking) ---
  const feature = await prisma.feature.create({
    data: {
      module_id: module.id,
      name: JSON.stringify({ es: 'Seguimiento de Flotas', en: 'Fleet Tracking' }),
      description: JSON.stringify({ es: 'Visualizacion de unidades en mapa', en: 'Visualization of units on map' }),
      icon: 'local_shipping',
      is_active: true,
      allowed_roles: JSON.stringify(['Admin', 'Manager', 'Operator']),
    },
  });

  // --- Sample Action (Export History) ---
  await prisma.action.create({
    data: {
      feature_id: feature.id,
      name: JSON.stringify({ es: 'Exportar Historial', en: 'Export History' }),
      description: JSON.stringify({ es: 'Permite descargar Excel con trayectos', en: 'Allows downloading Excel with routes' }),
      is_active: true,
      allowed_roles: JSON.stringify(['Admin', 'Manager']),
    },
  });

  console.log('Hierarchy (Module/Feature/Action) seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
