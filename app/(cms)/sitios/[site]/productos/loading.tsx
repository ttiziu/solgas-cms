import { ProductBoardSkeleton } from "@/components/product-board-skeleton";

export default function SiteProductsLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-1">
      <ProductBoardSkeleton />
    </div>
  );
}
