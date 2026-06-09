import { getMysqlKv } from '@/connect';
import { lazyAsyncSingleton } from '@/helper/singleton';

import 'dotenv/config';

import { drizzle } from 'drizzle-orm/mysql2';

const getDb = lazyAsyncSingleton(async () => {
  if (process.env.DATABASE_URL) {
    return drizzle(process.env.DATABASE_URL);
  }

  const kv = await getMysqlKv();
  return drizzle(`mysql://${kv.host}/${kv.dbname}?user=${kv.account}&password=${kv.password}`, {
    logger: process.env.NODE_ENV === 'development',
  });
});

export { getDb };
