"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listProducts, type StoreProduct } from "@/lib/api";
import { PRODUCTS_STALE_MS, productsQueryKey } from "@/lib/products-query";

export function useSiteProducts(siteSlug: string) {
  return useQuery({
    queryKey: productsQueryKey(siteSlug),
    queryFn: () => listProducts(siteSlug, true),
    staleTime: PRODUCTS_STALE_MS,
  });
}

export function useInvalidateSiteProducts() {
  const queryClient = useQueryClient();

  return (siteSlug: string) =>
    queryClient.invalidateQueries({ queryKey: productsQueryKey(siteSlug) });
}

export function useSetSiteProducts() {
  const queryClient = useQueryClient();

  return (
    siteSlug: string,
    updater: StoreProduct[] | ((previous: StoreProduct[]) => StoreProduct[]),
  ) =>
    queryClient.setQueryData<StoreProduct[]>(productsQueryKey(siteSlug), (previous) => {
      const current = previous ?? [];
      return typeof updater === "function" ? updater(current) : updater;
    });
}
