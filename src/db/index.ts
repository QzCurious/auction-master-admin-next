import { lazyAsyncSingleton } from '@/helper/singleton';

import 'dotenv/config';

import { drizzle } from 'drizzle-orm/mysql2';

const getDb = lazyAsyncSingleton(async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set');
  }

  return drizzle(databaseUrl, {
    logger: process.env.NODE_ENV === 'development',
  });
});

export { getDb };
