import { loadEnvConfig } from '@next/env';
import { readFile } from 'node:fs/promises';
import { database } from '../src/lib/server/database';
async function main() {
  loadEnvConfig(process.cwd());
  const db=await database();
  const schema=await readFile('database/schema.sql','utf8');
  await db.transaction(async client=>{for(const sql of schema.replace(/--[^\n]*/g,'').split(';').filter(s=>s.trim()))await client.query(sql);});
  await db.close?.();console.log('Schema updated. Existing orders, catalogue and offer usage preserved.');
}
main().catch(()=>{console.error('Schema update failed. Check the database connection.');process.exitCode=1;});
