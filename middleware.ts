import type { NextRequest } from 'next/server'
import { cookies } from "next/headers";

export function middleware(request: NextRequest) { 
  const cookieStore = cookies();
  const sessionData = cookieStore.get("session_data");

  if (sessionData && request.nextUrl.pathname.startsWith('/login')) {
    return Response.redirect(new URL('/dashboard', request.url))
  }

  if (!sessionData && !request.nextUrl.pathname.startsWith('/login')) {
    return Response.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};