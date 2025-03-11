import { NextResponse, type NextRequest } from 'next/server'

const publicRoutes = ['/auth', '/auth/login', '/auth/register']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (publicRoutes.some((path) => pathname.startsWith(path))) {
        return NextResponse.next()
    }

    const accessToken = request.cookies.get('accessToken')?.value

    if (!accessToken) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
          Protect all routes
        */
        '/((?!_next/static|_next/image|favicon.ico|api|auth).*)',
    ],
}
