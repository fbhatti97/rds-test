import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  // 👇 Move pool creation inside GET() function
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const result = await pool.query('SELECT NOW() AS now');
    return NextResponse.json({ success: true, result: result.rows[0] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('DB Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  } finally {
    await pool.end(); // 👈 Properly close the connection
  }
}
