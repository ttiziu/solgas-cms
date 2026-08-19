export const productsQueryKey = (siteSlug: string) => ["products", siteSlug] as const;

/** Tiempo que los datos se consideran frescos al cambiar de sitio en el panel. */
export const PRODUCTS_STALE_MS = 30_000;
