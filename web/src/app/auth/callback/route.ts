import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  const supabase = await createClient()

  // Handle PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Check if this is a password recovery flow
      if (type === 'recovery') {
        return redirectTo(request, origin, '/reset-password?type=recovery')
      }
      
      // Successful auth - redirect to dashboard or next page
      return redirectTo(request, origin, next)
    }
  }

  // Handle token hash flow (email links like magic link, password reset)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    
    if (!error) {
      // For password recovery, redirect to reset password page
      if (type === 'recovery') {
        return redirectTo(request, origin, '/reset-password?type=recovery')
      }
      
      // For email confirmation or magic link, redirect to dashboard
      return redirectTo(request, origin, next)
    }
  }

  // If auth fails, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}

function redirectTo(request: Request, origin: string, path: string) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocalEnv = process.env.NODE_ENV === 'development'
  
  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${path}`)
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${path}`)
  } else {
    return NextResponse.redirect(`${origin}${path}`)
  }
}
