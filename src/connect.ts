import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

import { lazySingleton } from './helper/singleton';

if (!process.env.CONSUL_URL) {
  throw new Error('CONSUL_URL is not set');
}

export const getS3Kv = lazySingleton(async () => {
  const url = `${process.env.CONSUL_URL}/v1/kv/storage/aws-s3/auction-master`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Cannot get consol s3 data');
  }

  const [x] = (await res.json()) as Array<{
    LockIndex: number;
    Key: string;
    Flags: number;
    Value: string;
    CreateIndex: number;
    ModifyIndex: number;
  }>;

  const kv = dotenv.parse(Buffer.from(x.Value, 'base64')) as {
    access_key_id: string;
    secret_access_key: string;
    region: string;
    endpoint_version: string;
    endpoint: string;
    public_url: string;
    acl: string;
    bucket: string;
  };

  return kv;
});

export const getMysqlKv = lazySingleton(async () => {
  const url = `${process.env.CONSUL_URL}/v1/kv/storage/mysql/master/auction-master`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Cannot get consol mysql data');
  }

  const [x] = (await res.json()) as Array<{
    LockIndex: number;
    Key: string;
    Flags: number;
    Value: string;
    CreateIndex: number;
    ModifyIndex: number;
  }>;

  const kv = dotenv.parse(Buffer.from(x.Value, 'base64')) as {
    host: string;
    account: string;
    password: string;
    dbname: string;
    // tls: string;
    // max_open_conns: string;
    // max_idle_conns: string;
    // max_conn_lifetime: string;
  };

  return kv;
});

export const getSystemKv = lazySingleton(async () => {
  const url = `${process.env.CONSUL_URL}/v1/kv/system`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Cannot get consol system data');
  }

  const [x] = (await res.json()) as Array<{
    LockIndex: number;
    Key: string;
    Flags: number;
    Value: string;
    CreateIndex: number;
    ModifyIndex: number;
  }>;

  const kv = dotenv.parse(Buffer.from(x.Value, 'base64')) as {
    site: string;
  };

  return kv;
});

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
