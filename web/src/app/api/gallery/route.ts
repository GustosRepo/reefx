import { createClient } from '@/utils/supabase/server';
import { NextResponse, NextRequest } from 'next/server';
import { STORAGE_LIMITS, SubscriptionTier } from '@/utils/subscription';

// GET /api/gallery - Fetch all photos for authenticated user
export async function GET() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/gallery - Upload a new photo
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's subscription to check storage limits
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('tier, storage_used_mb, storage_limit_mb')
    .eq('user_id', user.id)
    .single();

  const tier: SubscriptionTier = subscription?.tier || 'free';
  const storageLimit = STORAGE_LIMITS[tier];
  const storageUsed = subscription?.storage_used_mb || 0;

  // Check if user has gallery access
  if (storageLimit === 0) {
    return NextResponse.json({ error: 'Gallery access requires Premium or Super Premium subscription' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const caption = formData.get('caption') as string || '';
  const tags = formData.get('tags') as string || '';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const fileSizeMB = file.size / (1024 * 1024);

  // Check storage limit
  if (storageUsed + fileSizeMB > storageLimit) {
    return NextResponse.json({ 
      error: `Storage limit exceeded. You have ${(storageLimit - storageUsed).toFixed(1)}MB remaining.` 
    }, { status: 403 });
  }

  // Check file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
  }

  // Convert File to ArrayBuffer for server-side upload
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Generate unique filename
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  // Determine content type
  const contentType = file.type || `image/${fileExt}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('gallery-photos')
    .upload(fileName, buffer, {
      cacheControl: '3600',
      upsert: false,
      contentType,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  // Get public URL (or signed URL if bucket is private)
  const { data: urlData } = supabase.storage
    .from('gallery-photos')
    .getPublicUrl(fileName);

  // Parse tags
  const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  // Save photo metadata to database
  const { data: photoData, error: dbError } = await supabase
    .from('gallery_photos')
    .insert({
      user_id: user.id,
      storage_path: fileName,
      url: urlData.publicUrl,
      caption,
      tags: tagArray,
      file_size_mb: fileSizeMB,
    })
    .select()
    .single();

  if (dbError) {
    // Rollback: delete uploaded file
    await supabase.storage.from('gallery-photos').remove([fileName]);
    console.error('DB error:', dbError);
    return NextResponse.json({ error: 'Failed to save photo metadata' }, { status: 500 });
  }

  // Update storage used
  await supabase
    .from('subscriptions')
    .update({ storage_used_mb: storageUsed + fileSizeMB })
    .eq('user_id', user.id);

  return NextResponse.json(photoData);
}

// DELETE /api/gallery?id=xxx - Delete a photo
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const photoId = searchParams.get('id');

  if (!photoId) {
    return NextResponse.json({ error: 'Photo ID is required' }, { status: 400 });
  }

  // Get photo details
  const { data: photo, error: fetchError } = await supabase
    .from('gallery_photos')
    .select('*')
    .eq('id', photoId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !photo) {
    return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('gallery-photos')
    .remove([photo.storage_path]);

  if (storageError) {
    console.error('Storage delete error:', storageError);
    // Continue anyway to clean up database
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('gallery_photos')
    .delete()
    .eq('id', photoId)
    .eq('user_id', user.id);

  if (dbError) {
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
  }

  // Update storage used
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('storage_used_mb')
    .eq('user_id', user.id)
    .single();

  if (subscription) {
    const newStorageUsed = Math.max(0, (subscription.storage_used_mb || 0) - (photo.file_size_mb || 0));
    await supabase
      .from('subscriptions')
      .update({ storage_used_mb: newStorageUsed })
      .eq('user_id', user.id);
  }

  return NextResponse.json({ success: true });
}
