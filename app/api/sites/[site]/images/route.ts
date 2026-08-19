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

export async function GET(request: Request, context: RouteContext) {
  const { site } = await context.params;
  const query = new URL(request.url).search;
  return proxy(`/api/sites/${encodeURIComponent(site)}/images${query}`);
}

export async function POST(request: Request, context: RouteContext) {
  const { site } = await context.params;
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("multipart/form-data")) {
    return NextResponse.json({ message: "Se requiere una imagen." }, { status: 400 });
  }

  return proxy(`/api/sites/${encodeURIComponent(site)}/images`, {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: request.body,
    duplex: "half",
  } as RequestInit);
}
