import { NextResponse } from 'next/server';
import { isRequestAdmin } from '@/utils/admin';
import { createServiceRoleClient } from '@/utils/supabase/server';

// GET /api/admin/users - List all users
export async function GET() {
  try {
    if (!await isRequestAdmin()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createServiceRoleClient();

    // Get all profiles - try with is_admin first, fall back without it
    let profiles;
    let profilesError;
    
    // First try with is_admin column
    const result = await supabase
      .from('profiles')
      .select('id, email, name, is_admin, created_at, updated_at')
      .order('created_at', { ascending: false });
    
    if (result.error?.message?.includes('is_admin')) {
      // Column doesn't exist, query without it
      const fallbackResult = await supabase
        .from('profiles')
        .select('id, email, name, created_at, updated_at')
        .order('created_at', { ascending: false });
      profiles = fallbackResult.data?.map(p => ({ ...p, is_admin: false }));
      profilesError = fallbackResult.error;
    } else {
      profiles = result.data;
      profilesError = result.error;
    }

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get subscription info for all users
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('user_id, tier, status');

    if (subsError) {
      console.error('Error fetching subscriptions:', subsError);
    }

    // Create a map of subscriptions
    const subMap = new Map();
    subscriptions?.forEach(sub => {
      subMap.set(sub.user_id, sub);
    });

    // Combine profiles with subscription info
    const users = profiles?.map(profile => ({
      ...profile,
      subscription: subMap.get(profile.id) || { tier: 'free', status: 'active' }
    })) || [];

    return NextResponse.json({ users });
  } catch (err) {
    console.error('Admin users GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE /api/admin/users - Delete a user
export async function DELETE(request: Request) {
  try {
    if (!await isRequestAdmin()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Check if user exists - try with is_admin first
    let profile;
    const result = await supabase
      .from('profiles')
      .select('id, email, is_admin')
      .eq('id', userId)
      .single();
    
    if (result.error?.message?.includes('is_admin')) {
      // Column doesn't exist, query without it
      const fallbackResult = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', userId)
        .single();
      profile = fallbackResult.data ? { ...fallbackResult.data, is_admin: false } : null;
    } else {
      profile = result.data;
    }

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (profile.is_admin) {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    // Delete user data in parallel batches to speed up the process
    // First batch: Get storage files and delete independent tables
    const [galleryPhotos, livestockData] = await Promise.all([
      supabase.from('gallery_photos').select('file_path').eq('user_id', userId),
      supabase.from('livestock').select('photo_url').eq('user_id', userId),
    ]);

    // Delete storage files in parallel (don't await, fire and forget for speed)
    const storagePromises: Promise<any>[] = [];
    
    if (galleryPhotos.data && galleryPhotos.data.length > 0) {
      const filePaths = galleryPhotos.data.map(p => p.file_path).filter(Boolean);
      if (filePaths.length > 0) {
        storagePromises.push(supabase.storage.from('gallery').remove(filePaths));
      }
    }

    if (livestockData.data && livestockData.data.length > 0) {
      const photoPaths = livestockData.data
        .map(l => l.photo_url)
        .filter(Boolean)
        .map(url => {
          const match = url.match(/livestock\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];
      if (photoPaths.length > 0) {
        storagePromises.push(supabase.storage.from('livestock').remove(photoPaths));
      }
    }

    // Delete from tables in parallel (tables without FK dependencies on each other)
    await Promise.all([
      supabase.from('gallery_photos').delete().eq('user_id', userId),
      supabase.from('affiliate_earnings').delete().eq('user_id', userId),
      supabase.from('feedback').delete().eq('user_id', userId),
      supabase.from('livestock').delete().eq('user_id', userId),
      supabase.from('equipment').delete().eq('user_id', userId),
      supabase.from('maintenance').delete().eq('user_id', userId),
      supabase.from('logs').delete().eq('user_id', userId),
      supabase.from('thresholds').delete().eq('user_id', userId),
      ...storagePromises,
    ]);

    // Delete tanks (may have FK from other tables)
    await supabase.from('tanks').delete().eq('user_id', userId);
    
    // Delete subscription and profile last
    await Promise.all([
      supabase.from('subscriptions').delete().eq('user_id', userId),
      supabase.from('profiles').delete().eq('id', userId),
    ]);

    // Now delete the user from auth
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user from auth:', deleteError);
      // User data is already deleted, so we can still report success
      return NextResponse.json({ 
        success: true, 
        message: `User ${profile.email} data has been deleted` 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${profile.email} has been deleted` 
    });
  } catch (err) {
    console.error('Admin users DELETE error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
