import { NextResponse } from 'next/server';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Pool } from 'pg';

const secretsClient = new SecretsManagerClient({ region: 'ap-southeast-2' });

type DatabaseCredentials = {
  username: string;
  password: string;
  engine: string;
  host: string;
  port: string;
  dbInstanceIdentifier: string;
  dbname: string;
};

let cachedCredentials: DatabaseCredentials | null = null;

async function getDatabaseCredentials(): Promise<DatabaseCredentials> {
  if (cachedCredentials !== null) {
    return cachedCredentials;
  }

  const command = new GetSecretValueCommand({ SecretId: 'rds/proxy/well-db-user' });
  const response = await secretsClient.send(command);

  if (!response.SecretString) {
    throw new Error('No secret string found in Secrets Manager');
  }

  cachedCredentials = JSON.parse(response.SecretString) as DatabaseCredentials;
  return cachedCredentials;
}

export async function GET() {
  try {
    const dbCredentials = await getDatabaseCredentials();

    const pool = new Pool({
      host: dbCredentials.host,
      port: parseInt(dbCredentials.port, 10),
      user: dbCredentials.username,
      password: dbCredentials.password,
      database: dbCredentials.dbname,
      ssl: { rejectUnauthorized: false },
    });

    const result = await pool.query('SELECT NOW() AS now');
    await pool.end();

    return NextResponse.json({ success: true, now: result.rows[0].now });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('DB Connection Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
