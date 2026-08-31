import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = postgres(dbUrl);

  try {
    console.log('Updating document_headers default font_family to Arial...');
    await sql`
      UPDATE document_headers
      SET font_family = 'Arial'
      WHERE font_family IS NULL OR font_family = 'Times New Roman';
    `;
    console.log('Update completed successfully!');
  } catch (error) {
    console.error('Error updating default font:', error);
  } finally {
    await sql.end();
  }
}

main();
