const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Successfully connected to database!');
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

testConnection();
