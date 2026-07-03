import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/sign-up', '/', '/about']

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value
  const isAuthenticated = Boolean(accessToken || refreshToken)

  if (isPublicPath(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.next()
    }

    if (pathname === '/login' || pathname === '/sign-up') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
