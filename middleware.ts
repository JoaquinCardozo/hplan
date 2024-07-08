import type { NextRequest } from 'next/server'
import { cookies } from "next/headers";

export function middleware(request: NextRequest) { 
  const cookieStore = cookies();
  const userId = cookieStore.get("user_id");
  console.log(userId);

  if (userId && request.nextUrl.pathname.startsWith('/login')) {
    return Response.redirect(new URL('/dashboard', request.url))
  }

  if (!userId && !request.nextUrl.pathname.startsWith('/login')) {
    return Response.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};