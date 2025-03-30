import { NextResponse, type NextRequest } from 'next/server'

const publicRoutes = ['/auth', '/auth/signup']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const accessToken = request.cookies.get('accessToken')?.value

    if (publicRoutes.some((path) => pathname.startsWith(path))) {
        if (accessToken) {
            const url = request.nextUrl.clone();
            url.pathname = '/retrieve';
            return NextResponse.redirect(url);
        }
        return NextResponse.next();
    }

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
        '/((?!_next/static|_next/image|favicon.ico|api).*)',
    ],
}