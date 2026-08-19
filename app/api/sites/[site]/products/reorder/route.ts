import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { clearSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ site: string }>;
};

async function proxy(path: string, init: RequestInit = {}): Promise<NextResponse> {
  const response = await backendFetch(path, init);

  if (response.status === 401) {
    await clearSession();
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("Content-Type") ?? "application/json",
    },
  });
}

export async function PUT(request: Request, context: RouteContext) {
  const { site } = await context.params;
  const body = await request.text();
  return proxy(`/api/sites/${encodeURIComponent(site)}/products/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  });
}
