import { basename } from 'node:path';

import { NextResponse, type NextRequest } from 'next/server';
import { GetItemAndDetails } from '@/api/backend/items/GetItemAndDetails';
import AdmZip from 'adm-zip';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const itemId = params.id;
  if (!itemId) return NextResponse.json({ error: 'id is required' });

  const res = await GetItemAndDetails(Number(itemId));
  if (res.error) return NextResponse.json(res.error);

  const zip = new AdmZip();

  const stream = new ReadableStream({
    async start(controller) {
      // start the stream immediately
      controller.enqueue('');

      await Promise.all(
        res.data.photos.map(async (photo) => {
          const res = await fetch(photo.photo);
          const extension = res.headers.has('content-type') ? res.headers.get('content-type')?.split('/').pop() : '';
          zip.addFile(basename(`${photo.photo}.${extension}`), Buffer.from(await res.arrayBuffer()));
        })
      );

      const zipBuffer = zip.toBuffer();
      controller.enqueue(zipBuffer);
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${encodeURI(res.data.name)}.zip"`,
    },
  });
}
