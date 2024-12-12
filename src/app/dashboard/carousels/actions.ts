'use server';

import { revalidatePath } from 'next/cache';
import { getS3Client, getS3Kv } from '@/connect';
import { getDb } from '@/db';
import { carousel, carouselGroup } from '@/db/schema';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function uploadImage(formData: FormData) {
  const file = formData.get('file') as File;
  const key = uuidv4();
  const s3Kv = await getS3Kv();
  const S3 = await getS3Client();

  const command = new PutObjectCommand({
    Bucket: s3Kv.bucket,
    Key: key,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  });

  await S3.send(command);
  return `${s3Kv.public_url}/${key}`;
}

export async function createCarouselGroup({ name }: { name: string }) {
  try {
    const db = await getDb();
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
  const db = await getDb();
  const rows = await db.select().from(carousel).where(eq(carousel.groupId, id));
  const s3Kv = await getS3Kv();
  const S3 = await getS3Client();

  await Promise.all([
    ...rows.map((row) =>
      S3.send(new DeleteObjectCommand({ Bucket: s3Kv.bucket, Key: row.mobileImageUrl.split(`${s3Kv.public_url}/`)[1] }))
    ),
    ...rows.map((row) =>
      S3.send(
        new DeleteObjectCommand({ Bucket: s3Kv.bucket, Key: row.desktopImageUrl.split(`${s3Kv.public_url}/`)[1] })
      )
    ),
  ]);

  await db.delete(carousel).where(eq(carousel.groupId, id));
  await db.delete(carouselGroup).where(eq(carouselGroup.id, id));
  revalidatePath('/', 'layout');
}

export async function updateGroup(id: number, { name }: { name: string }) {
  const db = await getDb();
  await db.update(carouselGroup).set({ name }).where(eq(carouselGroup.id, id));
  revalidatePath('/', 'layout');
}

export async function createCarousel(data: typeof carousel.$inferInsert) {
  const db = await getDb();
  await db.insert(carousel).values(data);
  revalidatePath('/', 'layout');
}

export async function updateCarousel(id: number, data: Partial<typeof carousel.$inferSelect>) {
  const db = await getDb();
  await db.update(carousel).set(data).where(eq(carousel.id, id));
  revalidatePath('/', 'layout');
}

export async function deleteCarousel(id: number) {
  const db = await getDb();
  const s3Kv = await getS3Kv();
  const S3 = await getS3Client();
  const [row] = await db.select().from(carousel).where(eq(carousel.id, id));

  if (!row) {
    revalidatePath('/', 'layout');
    return;
  }

  await Promise.all([
    S3.send(
      new DeleteObjectCommand({
        Bucket: s3Kv.bucket,
        Key: row.mobileImageUrl.split(`${s3Kv.public_url}/`)[1],
      })
    ),
    S3.send(
      new DeleteObjectCommand({
        Bucket: s3Kv.bucket,
        Key: row.desktopImageUrl.split(`${s3Kv.public_url}/`)[1],
      })
    ),
  ]);

  await db.delete(carousel).where(eq(carousel.id, id));
  revalidatePath('/', 'layout');
}
