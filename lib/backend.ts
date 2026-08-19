import { getApiUrl } from "@/lib/env";
import { getSessionToken } from "@/lib/session";

export async function backendFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getSessionToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${getApiUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function getAuthenticatedUser(): Promise<{ username: string } | null> {
  const token = await getSessionToken();
  if (!token) {
    return null;
  }

  const response = await backendFetch("/api/auth/me");
  if (!response.ok) {
    return null;
  }

  return (await response.json()) as { username: string };
}

export type CmsSite = {
  slug: string;
  name: string;
  publicUrl: string | null;
};

export async function listSites(): Promise<CmsSite[]> {
  const response = await backendFetch("/api/sites");
  if (!response.ok) {
    return [];
  }
  return (await response.json()) as CmsSite[];
}

export type BackendStoreProduct = {
  key: string;
  name: string;
  description: string;
  whatsappMessage: string | null;
  imageUrl: string;
  fallbackImageUrl: string;
  sortOrder: number;
  active: boolean;
  cmsImageId: number | null;
};

export async function listSiteProducts(site: string): Promise<BackendStoreProduct[]> {
  const response = await backendFetch(`/api/sites/${encodeURIComponent(site)}/products?all=true`);
  if (!response.ok) {
    return [];
  }
  return (await response.json()) as BackendStoreProduct[];
}
