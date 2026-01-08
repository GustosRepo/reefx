import { NextResponse } from 'next/server';
import { isRequestAdmin } from '@/utils/admin';
import { createServiceRoleClient } from '@/utils/supabase/server';

// GET /api/admin/feedback - List all feedback
export async function GET() {
  try {
    if (!await isRequestAdmin()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createServiceRoleClient();

    // Get all feedback with user info
    const { data: feedback, error } = await supabase
      .from('feedback')
      .select(`
        id,
        user_id,
        type,
        subject,
        message,
        status,
        admin_notes,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching feedback:', error);
      return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
    }

    // Get user emails for each feedback
    const userIds = [...new Set(feedback?.map(f => f.user_id) || [])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, name')
      .in('id', userIds);

    const profileMap = new Map();
    profiles?.forEach(p => profileMap.set(p.id, p));

    const feedbackWithUsers = feedback?.map(f => ({
      ...f,
      user: profileMap.get(f.user_id) || { email: 'Unknown', name: 'Unknown' }
    })) || [];

    return NextResponse.json({ feedback: feedbackWithUsers });
  } catch (err) {
    console.error('Admin feedback GET error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH /api/admin/feedback - Update feedback status
export async function PATCH(request: Request) {
  try {
    if (!await isRequestAdmin()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, status, admin_notes } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;

    const { data, error } = await supabase
      .from('feedback')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating feedback:', error);
      return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
    }

    return NextResponse.json({ feedback: data });
  } catch (err) {
    console.error('Admin feedback PATCH error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
