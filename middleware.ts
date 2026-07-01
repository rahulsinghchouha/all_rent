import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/request'
import { verifyRefreshToken } from '@/app/services/auth'

const PUBLIC_PATHS = ['/login', '/sign-up', '/', '/about']

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isPublicPath(pathname)) {
    const token = request.cookies.get('refreshToken')?.value
    if (!token) {
      return NextResponse.next()
    }

    try {
      verifyRefreshToken(token)
      if (pathname === '/login' || pathname === '/sign-up') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      return NextResponse.next()
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('refreshToken')?.value
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      verifyRefreshToken(token)
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
