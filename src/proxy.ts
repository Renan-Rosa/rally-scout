import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/edge";

const PUBLIC_ROUTES = ["/sign-in", "/sign-up", "/"];
const AUTH_ROUTES = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("rally_token")?.value;

  // Verifica se é rota pública
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route);
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // Se não tem token e não é rota pública → redireciona pro login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Se tem token, verifica se é válido
  if (token) {
    const payload = await verifyToken(token);

    // Token inválido → limpa e redireciona
    if (!payload && !isPublicRoute) {
      const response = NextResponse.redirect(new URL("/sign-in", request.url));
      response.cookies.delete("rally_token");
      return response;
    }

    // Token válido + tentando acessar auth routes → redireciona pro dashboard
    if (payload && isAuthRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
