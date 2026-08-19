import { redirect } from "next/navigation";
import { listSites } from "@/lib/backend";

export default async function CmsHomePage() {
  const sites = await listSites();
  const first = sites[0];
  if (!first) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay sitios configurados.
      </p>
    );
  }
  redirect(`/sitios/${first.slug}/productos`);
}
