import { type Metadata } from 'next';

import { config } from '@/config';

import AdminForm from '../AdminForm';

export const metadata = { title: `Create admin | Dashboard | ${config.site.name}` } satisfies Metadata;

async function Page() {
  return <AdminForm />;
}

export default Page;
