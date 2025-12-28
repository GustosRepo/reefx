
import { redirect } from 'next/navigation';
import AdminPromoClient from '../AdminPromoClient';
import { isRequestAdmin } from '@/utils/admin';

export default async function AdminPromoPage() {
  const allowed = await isRequestAdmin();
  if (!allowed) {
    redirect('/login');
  }

  return <AdminPromoClient />;
}
