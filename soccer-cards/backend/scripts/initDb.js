import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  const client = await pool.connect();

  try {
    console.log('🔧 Initializing database...');

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    await client.query(schema);

    console.log('✅ Database schema created successfully!');
    console.log('📝 Tables created:');
    console.log('   - users');
    console.log('   - cards');
    console.log('   - user_cards');
    console.log('   - packs');
    console.log('   - store_cards');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initializeDatabase();
