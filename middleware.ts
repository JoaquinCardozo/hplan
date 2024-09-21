import type { NextRequest } from 'next/server'
import { cookies } from "next/headers";

export function middleware(request: NextRequest) { 
  const cookieStore = cookies();
  const sessionData = cookieStore.get("session_data");

  if (sessionData){
    if (request.nextUrl.pathname == '/' || 
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register')) {
      return Response.redirect(new URL('/dashboard', request.url))
    }
  }
  else {
    if (!request.nextUrl.pathname.startsWith('/login') && 
        !request.nextUrl.pathname.startsWith('/register')) {
      return Response.redirect(new URL('/login', request.url))
    }
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};