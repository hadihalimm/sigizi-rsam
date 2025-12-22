import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import DietTags from "@/components/diet-tag";
import { auth } from "@/lib/auth";
import { htmlShell } from "@/lib/utils";
import { orpc } from "@/server/orpc";

export async function GET(request: NextRequest) {
  try {
    const sessionData = await auth.api.getSession({
      headers: await headers(),
    });

    if (!sessionData?.session || !sessionData?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    if (!date) {
      return NextResponse.json(
        { error: "Missing date parameter" },
        { status: 400 }
      );
    }

    const result = await orpc.dailyPermintaanMakanan.getAll.call({
      date: date,
    });

    const { renderToStaticMarkup } = await import("react-dom/server");
    const { createElement } = await import("react");
    const body = renderToStaticMarkup(
      createElement(DietTags, { data: result })
    );
    const html = htmlShell(body);

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
