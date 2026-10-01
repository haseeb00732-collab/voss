import { Pool } from 'pg';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

export interface QueryResult<T> { rows: T[] }
export interface DatabaseClient { query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<QueryResult<T>> }
export interface Database extends DatabaseClient { transaction<T>(fn: (client: DatabaseClient) => Promise<T>): Promise<T>; close?(): Promise<void> }
const state = globalThis as typeof globalThis & { vossDatabase?: Promise<Database> };

export function databaseConfigured() {
  return !!process.env.DATABASE_URL || (process.env.NODE_ENV !== 'production' && process.env.VOSS_LOCAL_DATABASE === '1');
}

export function database(): Promise<Database> {
  if (!databaseConfigured()) throw new Error('VOSS_DATABASE_NOT_CONFIGURED');
  return state.vossDatabase ??= connect().catch(error => { state.vossDatabase = undefined; throw error; });
}

async function connect(): Promise<Database> {
  if (process.env.DATABASE_URL) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 3, connectionTimeoutMillis: 8000, idleTimeoutMillis: 20000 });
    return {
      close: () => pool.end(),
      async query<T>(sql: string, params?: unknown[]) { const result = await pool.query(sql, params); return { rows: result.rows as T[] }; },
      async transaction<T>(fn: (client: DatabaseClient) => Promise<T>) {
        const client = await pool.connect();
        try { await client.query('BEGIN'); const result = await fn(client); await client.query('COMMIT'); return result; }
        catch (error) { await client.query('ROLLBACK'); throw error; }
        finally { client.release(); }
      },
    };
  }
  // A real, persistent local Postgres-compatible database for development only.
  // Never use a filesystem database on Vercel's ephemeral filesystem.
  if (process.env.NODE_ENV === 'production') throw new Error('A managed PostgreSQL connection is required in production.');
  const { PGlite } = await import('@electric-sql/pglite');
  // Keep live PostgreSQL files out of OneDrive: sync can replace files while
  // the embedded database is writing them. This path is development-only.
  const folder = process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'VOSS', 'development-databases')
    : path.join(process.cwd(), '.data');
  await mkdir(folder, { recursive: true });
  const name = process.env.VOSS_LOCAL_DATABASE_NAME || 'voss';
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error('Invalid local database name');
  // Close the development database after each operation so a Next hot reload
  // cannot leave an open Postgres filesystem lock behind.
  let queue: Promise<unknown> = Promise.resolve();
  function run<T>(fn: (local: InstanceType<typeof PGlite>) => Promise<T>) {
    const result = queue.then(async () => {
      const local = new PGlite(path.join(/* turbopackIgnore: true */ folder, name));
      await local.waitReady;
      try { return await fn(local); } finally { await local.close(); }
    });
    queue = result.then(() => undefined, () => undefined);
    return result;
  }
  return {
    query: <T>(sql: string, params?: unknown[]) => run(local => local.query<T>(sql, params)),
    transaction: <T>(fn: (client: DatabaseClient) => Promise<T>) => run(local => local.transaction(tx => fn(tx as DatabaseClient))),
  };
}
