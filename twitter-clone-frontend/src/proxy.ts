import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/home', '/explore', '/notifications', '/profile'];
const publicRoutes = ['/login', '/register'];

export default function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtected = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );
  const isPublic = publicRoutes.some((route) => path === route);

  // Read token from cookie set at login
  const token = req.cookies.get('access_token')?.value;

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isPublic && token) {
    return NextResponse.redirect(new URL('/home', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
