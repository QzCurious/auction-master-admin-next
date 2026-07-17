import { S3Client } from '@aws-sdk/client-s3';

import { lazySingleton } from './helper/singleton';

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set`);
  }

  return value;
}

export const getS3Kv = lazySingleton(async () => ({
  access_key_id: requireEnv('S3_ACCESS_KEY_ID'),
  secret_access_key: requireEnv('S3_SECRET_ACCESS_KEY'),
  region: requireEnv('S3_REGION'),
  endpoint_version: process.env.S3_ENDPOINT_VERSION ?? '',
  endpoint: requireEnv('S3_ENDPOINT'),
  public_url: requireEnv('S3_PUBLIC_URL').replace(/\/$/, ''),
  acl: process.env.S3_ACL ?? '',
  bucket: requireEnv('S3_BUCKET'),
}));

export const getSystemKv = lazySingleton(async () => ({
  site: requireEnv('S3_SITE').replace(/^\/+|\/+$/g, ''),
}));

export const getS3Client = lazySingleton(async () => {
  const s3Kv = await getS3Kv();

  return new S3Client({
    region: s3Kv.region,
    endpoint: s3Kv.endpoint,
    credentials: {
      accessKeyId: s3Kv.access_key_id,
      secretAccessKey: s3Kv.secret_access_key,
    },
  });
});
