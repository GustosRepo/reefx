import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// POST /api/livestock/[id]/photo - Upload photo for livestock
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership of livestock
  const { data: livestock, error: fetchError } = await supabase
    .from('livestock')
    .select('id, user_id, photo_url')
    .eq('id', id)
    .single();

  if (fetchError || !livestock) {
    return NextResponse.json({ error: 'Livestock not found' }, { status: 404 });
  }

  if (livestock.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Delete old photo if exists
    if (livestock.photo_url) {
      const oldPath = livestock.photo_url.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('livestock-photos')
          .remove([`${user.id}/${oldPath}`]);
      }
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const fileName = `${id}-${Date.now()}.${ext}`;
    const filePath = `${user.id}/${fileName}`;

    // Convert file to buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('livestock-photos')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('livestock-photos')
      .getPublicUrl(filePath);

    // Update livestock with photo URL
    const { error: updateError } = await supabase
      .from('livestock')
      .update({ photo_url: publicUrl })
      .eq('id', id);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json({ error: 'Failed to save photo URL' }, { status: 500 });
    }

    return NextResponse.json({ photoUrl: publicUrl });
  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Failed to process photo' }, { status: 500 });
  }
}

// DELETE /api/livestock/[id]/photo - Remove photo from livestock
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership and get current photo URL
  const { data: livestock, error: fetchError } = await supabase
    .from('livestock')
    .select('id, user_id, photo_url')
    .eq('id', id)
    .single();

  if (fetchError || !livestock) {
    return NextResponse.json({ error: 'Livestock not found' }, { status: 404 });
  }

  if (livestock.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (!livestock.photo_url) {
    return NextResponse.json({ error: 'No photo to delete' }, { status: 400 });
  }

  try {
    // Extract file path from URL
    const urlParts = livestock.photo_url.split('/livestock-photos/');
    if (urlParts.length > 1) {
      const filePath = urlParts[1];
      
      // Delete from storage
      await supabase.storage
        .from('livestock-photos')
        .remove([filePath]);
    }

    // Clear photo URL in database
    const { error: updateError } = await supabase
      .from('livestock')
      .update({ photo_url: null })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Photo delete error:', error);
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }
}
