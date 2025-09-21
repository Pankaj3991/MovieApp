// middleware.ts
import { verifyJWT } from "@/lib/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const publicPaths = ["/login", "/api/auth/login", "/api/auth/signup", "/api/health"];

  if (publicPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const user = await verifyJWT(token);
  if (!user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("unauthorized", "1");
    return NextResponse.redirect(loginUrl);
  }
  
  const headers = new Headers(req.headers);
  headers.set("x-user-id", user._id);
  headers.set("x-user-role", user.role);
  return NextResponse.next({
    request: { headers },
  });
}

export const config = {
  matcher: ["/", "/mynotes", "/api/:path*"],
};
