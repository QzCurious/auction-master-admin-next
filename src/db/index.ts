import { getMysqlKv } from '@/connect';

import 'dotenv/config';

import { drizzle } from 'drizzle-orm/mysql2';

async function getDb() {
  const kv = await getMysqlKv();
  getDb.__instance = drizzle(`mysql://${kv.host}/${kv.dbname}?user=${kv.account}&password=${kv.password}`);
  return getDb.__instance;
}
getDb.__instance = null as ReturnType<typeof drizzle> | null;

export { getDb };
