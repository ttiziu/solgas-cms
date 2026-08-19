import { notFound, redirect } from "next/navigation";
import { listSites } from "@/lib/backend";

export default async function SiteHomePage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const sites = await listSites();
  if (!sites.some((item) => item.slug === site)) {
    notFound();
  }
  redirect(`/sitios/${site}/productos`);
}
