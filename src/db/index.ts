import { getMysqlKv } from '@/connect';
import { lazyAsyncSingleton } from '@/helper/singleton';

import 'dotenv/config';

import { drizzle } from 'drizzle-orm/mysql2';

const getDb = lazyAsyncSingleton(async () => {
  const kv = await getMysqlKv();
  if (process.env.NODE_ENV === 'development') {
    return drizzle(`${process.env.DATABASE_URL}/${kv.dbname}`);
  }

  return drizzle(`mysql://${kv.host}/${kv.dbname}?user=${kv.account}&password=${kv.password}`);
});

export { getDb };
