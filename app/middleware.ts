import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function validateCSRFToken(token: string | null, sessionToken: string | undefined): boolean {
  if (!token || !sessionToken) {
    return false
  }
  return token === sessionToken
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const csrfToken = generateCSRFToken()
  response.headers.set('X-CSRF-Token', csrfToken)

  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const contentType = request.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      const token = request.headers.get('X-CSRF-Token') || request.headers.get('x-csrf-token')
      const sessionToken = request.cookies.get('csrf-token')?.value
      
      if (!validateCSRFToken(token, sessionToken)) {
        return new NextResponse(
          JSON.stringify({ error: 'Invalid CSRF token' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/profile')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  if (!request.cookies.has('csrf-token')) {
    response.cookies.set('csrf-token', csrfToken, { httpOnly: true, sameSite: 'strict' })
  }

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
