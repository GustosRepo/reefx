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

    // Get all profiles with subscription info
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        name,
        is_admin,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

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

    // Check if user exists and is not an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, is_admin')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (profile.is_admin) {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    // Delete the user from auth (this cascades to profiles and other tables)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
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
