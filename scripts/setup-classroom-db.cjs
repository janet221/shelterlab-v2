const { loadEnvConfig } = require('@next/env');
const { PrismaClient } = require('@prisma/client');
const { readFileSync } = require('node:fs');
const { createHash } = require('node:crypto');
loadEnvConfig(process.cwd());
const prisma = new PrismaClient();
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  const sql = readFileSync('prisma/migrations/20260922000100_authenticated_classroom/migration.sql', 'utf8');
  if (/^(DROP|DELETE|TRUNCATE)\s/im.test(sql)) throw new Error('Expected additive SQL only');
  const checksum = createHash('sha256').update(sql).digest('hex');
  await prisma.$transaction(async tx => {
    await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(22092026)');
    await tx.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS "_ShelterLabClassroomMigrations" ("id" TEXT PRIMARY KEY, "checksum" TEXT NOT NULL, "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT now())');
    const rows = await tx.$queryRaw`SELECT "checksum" FROM "_ShelterLabClassroomMigrations" WHERE "id" = '20260922000100_authenticated_classroom'`;
    if (rows.length) { if (rows[0].checksum !== checksum) throw new Error('Migration checksum changed'); return; }
    for (const statement of sql.split(';').map(s => s.trim()).filter(Boolean)) await tx.$executeRawUnsafe(statement);
    await tx.$executeRaw`INSERT INTO "_ShelterLabClassroomMigrations" ("id", "checksum") VALUES ('20260922000100_authenticated_classroom', ${checksum})`;
  }, { timeout: 30000 });
  console.log('Classroom tables ready. Existing application tables and records preserved.');
}
main().catch(error => { console.error('Classroom setup failed:', error.code || error.name, 'Check DATABASE_URL and database availability; no credentials are printed.'); process.exitCode = 1; }).finally(() => prisma.$disconnect());
