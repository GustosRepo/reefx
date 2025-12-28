import { NextResponse } from 'next/server';
import { isRequestAdmin } from '@/utils/admin';

export async function GET() {
  try {
    const isAdmin = await isRequestAdmin();
    return NextResponse.json({ isAdmin });
  } catch (err) {
    console.error('Error checking admin:', err);
    return NextResponse.json({ isAdmin: false });
  }
}
