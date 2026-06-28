// import { NextRequest, NextResponse } from "next/server";

// export function middleware(request: NextRequest) {
//   const pathname = request.nextUrl.pathname;

//   // Allow the landing page
//   if (pathname === "/") {
//     return NextResponse.next();
//   }

//   // Allow Next.js internal assets
//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/favicon") ||
//     pathname.startsWith("/images") ||
//     pathname.startsWith("/logo") ||
//     pathname.startsWith("/icons")
//   ) {
//     return NextResponse.next();
//   }

//   // Allow static files
//   if (pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|css|js)$/)) {
//     return NextResponse.next();
//   }

//   // Redirect everything else back home
//   return NextResponse.redirect(new URL("/", request.url));
// }

// export const config = {
//   matcher: "/:path*",
// };