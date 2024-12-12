'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/db';
import { carousel, carouselGroup } from '@/db/schema';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

if (!process.env.CONSUL_URL) {
  throw new Error('CONSUL_URL is not set');
}
console.log('Fetching Consol Data...');
const url = `${process.env.CONSUL_URL}/v1/kv/storage/aws-s3/auction-master`;
const res = await fetch(url).finally(() => console.log('Consol Data Fetched'));
if (!res.ok) {
  throw new Error('Cannot get consol data');
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

const S3 = new S3Client({
  region: kv.region,
  endpoint: kv.endpoint,
  credentials: {
    accessKeyId: kv.access_key_id,
    secretAccessKey: kv.secret_access_key,
  },
});

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  const key = uuidv4();

  const command = new PutObjectCommand({
    Bucket: kv.bucket,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  });

  await S3.send(command);
  return `${kv.public_url}/${key}`;
}

export async function createCarouselGroup({ name }: { name: string }) {
  try {
    const [{ id }] = await db.insert(carouselGroup).values({ name }).$returningId();
    revalidatePath('/', 'layout');
    return { id };
  } catch (err) {
    if (!err || typeof err !== 'object' || !('code' in err)) {
      throw err;
    }

    if (err.code === 'ER_DUP_ENTRY') {
      return { error: '名稱重複' } as const;
    }

    throw err;
  }
}

export async function deleteCarouselGroup(id: number) {
  const rows = await db.select().from(carousel).where(eq(carousel.groupId, id));
  await Promise.all([
    ...rows.map((row) =>
      S3.send(new DeleteObjectCommand({ Bucket: kv.bucket, Key: row.mobileImageUrl.split(`${kv.public_url}/`)[1] }))
    ),
    ...rows.map((row) =>
      S3.send(new DeleteObjectCommand({ Bucket: kv.bucket, Key: row.desktopImageUrl.split(`${kv.public_url}/`)[1] }))
    ),
  ]);

  await db.delete(carousel).where(eq(carousel.groupId, id));
  await db.delete(carouselGroup).where(eq(carouselGroup.id, id));
  revalidatePath('/', 'layout');
}

export async function updateGroup(id: number, { name }: { name: string }) {
  await db.update(carouselGroup).set({ name }).where(eq(carouselGroup.id, id));
  revalidatePath('/', 'layout');
}

export async function createCarousel(data: typeof carousel.$inferInsert) {
  await db.insert(carousel).values(data);
  revalidatePath('/', 'layout');
}

export async function updateCarousel(id: number, data: Partial<typeof carousel.$inferSelect>) {
  await db.update(carousel).set(data).where(eq(carousel.id, id));
  revalidatePath('/', 'layout');
}

export async function deleteCarousel(id: number) {
  const [row] = await db.select().from(carousel).where(eq(carousel.id, id));

  if (!row) {
    revalidatePath('/', 'layout');
    return;
  }

  await Promise.all([
    S3.send(
      new DeleteObjectCommand({
        Bucket: kv.bucket,
        Key: row.mobileImageUrl.split(`${kv.public_url}/`)[1],
      })
    ),
    S3.send(
      new DeleteObjectCommand({
        Bucket: kv.bucket,
        Key: row.desktopImageUrl.split(`${kv.public_url}/`)[1],
      })
    ),
  ]);

  await db.delete(carousel).where(eq(carousel.id, id));
  revalidatePath('/', 'layout');
}
