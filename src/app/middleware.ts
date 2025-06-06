import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export async function middleware(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  // Redirection après connexion
  if (request.nextUrl.pathname === "/auth/callback/credentials") {
    if (session?.user?.role === "administrateur") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    } else if (session?.user?.role === "examinateur") {
      return NextResponse.redirect(new URL("/dashboard/examiner", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard/student", request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/callback/credentials",
    "/dashboard/:path*"
  ]
};
