import { notFound } from "next/navigation";
import { listSites } from "@/lib/backend";
import { ProductBoard } from "@/components/product-board";

export default async function SiteProductsPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const sites = await listSites();
  const current = sites.find((item) => item.slug === site);
  if (!current) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-1">
      <ProductBoard
        siteSlug={current.slug}
        siteName={current.name}
        sitePublicUrl={current.publicUrl}
      />
    </div>
  );
}
