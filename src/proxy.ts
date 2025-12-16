import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: [
    "/",
    "/permintaan-makanan",
    "/pemesanan-makanan",
    "/pasien",
    "/admin/menu-book",
    "/admin/makanan",
    "/admin/bahan-makanan",
    "/admin/gudang",
    "/admin/diet",
    "/admin/alergi",
    "/admin/ruangan",
  ],
};
