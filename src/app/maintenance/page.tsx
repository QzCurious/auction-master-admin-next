import { redirect, RedirectType } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function Page() {
  if (!process.env.NEXT_PUBLIC_IS_MAINTENANCE) {
    redirect('/', RedirectType.replace);
  }

  return <h1>系統維護中</h1>;
}
