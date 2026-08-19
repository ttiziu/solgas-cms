import { redirect } from "next/navigation";
import { listSites } from "@/lib/backend";

export default async function ImagenesRedirectPage() {
  const sites = await listSites();
  const first = sites[0];
  if (!first) {
    redirect("/");
  }
  redirect(`/sitios/${first.slug}/productos`);
}
