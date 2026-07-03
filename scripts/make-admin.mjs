// Promote a user to ADMIN by email.
// Run:  node scripts/make-admin.mjs someone@example.com
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node scripts/make-admin.mjs <email>');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const rows = await sql`UPDATE "User" SET role = 'ADMIN' WHERE email = ${email} RETURNING id, email, role`;

if (rows.length === 0) {
  console.error(`No user found with email: ${email}. Sign in once first, then re-run.`);
  process.exit(1);
}
console.log('Promoted:', rows[0]);
