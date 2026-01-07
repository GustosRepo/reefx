import { createServiceRoleClient } from '@/utils/supabase/server';
import { createClient } from '@/utils/supabase/server';

export async function isAdminByUserId(userId: string) {
  if (!userId) return false;
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .limit(1)
      .single();

    if (error) {
      console.error('isAdminByUserId error', error);
      return false;
    }

    return !!data?.is_admin;
  } catch (err) {
    console.error('isAdminByUserId unexpected error', err);
    return false;
  }
}

export async function isRequestAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return false;
    return await isAdminByUserId(user.id);
  } catch (err: any) {
    // Ignore dynamic server usage errors during static generation
    if (err?.digest === 'DYNAMIC_SERVER_USAGE') {
      return false;
    }
    console.error('isRequestAdmin error', err);
    return false;
  }
}

export default {
  isAdminByUserId,
  isRequestAdmin,
};
