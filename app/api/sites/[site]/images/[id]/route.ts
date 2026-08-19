import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";
import { clearSession } from "@/lib/session";

type RouteContext = {
  params: Promise<{ site: string; id: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { site, id } = await context.params;
  const response = await backendFetch(
    `/api/sites/${encodeURIComponent(site)}/images/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );

  if (response.status === 401) {
    await clearSession();
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  return new NextResponse(null, { status: response.status === 200 ? 204 : response.status });
}
