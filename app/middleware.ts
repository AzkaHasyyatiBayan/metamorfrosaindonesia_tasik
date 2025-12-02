import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 1. Siapkan response awal
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // FORCE NO CACHE: Paksa browser & Next.js Client Router untuk tidak menyimpan cache redirect
  response.headers.set('x-middleware-cache', 'no-cache')
  response.headers.set('Cache-Control', 'no-store, must-revalidate')

  const path = request.nextUrl.pathname

  // --- DEBUGGING LOG (Cek Terminal Server) ---
  // Ini membantu kita melihat apakah request masuk dan ke mana arahnya
  // console.log(`[Middleware] Request: ${path}`) 

  // 2. DAFTAR JALUR PUBLIK
  const publicPaths = [
    '/user/about', 
    '/user/events', 
    '/about', 
    '/events', 
    '/auth/login', 
    '/auth/register',
    '/' 
  ]

  // 3. BYPASS JALUR PUBLIK & SYSTEM (Prioritas Tertinggi)
  // Kita izinkan langsung jika:
  // a. Path ada di daftar publicPaths
  // b. Path diawali /_next (request data internal Next.js) -> Penting untuk mencegah error prefetch!
  // c. Path adalah file statis (favicon, images) - meskipun matcher sudah handle, double check aman.
  if (
    publicPaths.some(publicPath => path.startsWith(publicPath)) || 
    path.startsWith('/_next') || 
    path.includes('.') // Asumsi file berekstensi (jpg, css, dll) adalah public
  ) {
    // console.log(`[Middleware] ✅ Allowed Public/System Path: ${path}`)
    return response 
  }

  // 4. Inisialisasi Supabase (Hanya untuk halaman yang mungkin butuh auth)
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

  // 5. Cek User Session
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user
  } catch (error) {
    console.error('Middleware Auth Error:', error)
  }

  // 6. PROTEKSI HALAMAN KHUSUS

  // Proteksi Halaman Admin
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    
    // Cek Role Admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Proteksi Halaman Profile User
  if (path.startsWith('/profile') || path.startsWith('/user/profile')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Default: Izinkan
  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/user/:path*', 
    // Matcher regex: Mengecualikan static files agar performa lebih baik
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}