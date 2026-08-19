export type ImageAsset = {
  id: number;
  url: string;
  site: string;
  section: string;
  createdAt: string;
};

function parseJson<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Respuesta inválida del servidor");
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string; error?: string };
    const message = payload.message ?? payload.error;
    if (message && !looksTechnical(message)) {
      return message;
    }
  } catch {
    // body is not JSON
  }
  if (response.status === 413) {
    return "La imagen es demasiado grande. Usa un archivo de hasta 10 MB.";
  }
  if (response.status >= 500) {
    return "No se pudo subir la imagen. Intenta con otra foto.";
  }
  return "No se pudo completar la solicitud";
}

function looksTechnical(message: string): boolean {
  return (
    message.includes("Exception") ||
    message.includes(".dylib") ||
    message.includes("dlopen") ||
    message.includes("mach-o") ||
    message.includes("ClassNotFound") ||
    message.length > 180
  );
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
  });

  if (response.status === 401) {
    window.location.assign("/login");
    throw new Error("Sesión expirada. Vuelve a iniciar sesión.");
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response;
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await request(path, init);
  const text = await response.text();
  if (!text) {
    throw new Error("Respuesta vacía del servidor");
  }
  return parseJson<T>(text);
}

async function requestEmpty(path: string, init: RequestInit = {}): Promise<void> {
  await request(path, init);
}

function imagesPath(site: string): string {
  return `/api/sites/${encodeURIComponent(site)}/images`;
}

export async function listImages(site: string): Promise<ImageAsset[]> {
  return requestJson<ImageAsset[]>(imagesPath(site));
}

export async function uploadImage(file: File, site: string, section: string): Promise<ImageAsset> {
  const body = new FormData();
  body.append("file", file);
  body.append("section", section);
  return requestJson<ImageAsset>(imagesPath(site), {
    method: "POST",
    body,
  });
}

export async function deleteImage(site: string, id: number): Promise<void> {
  await requestEmpty(`${imagesPath(site)}/${id}`, { method: "DELETE" });
}

export type StoreProduct = {
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

export type CreateProductInput = {
  productKey: string;
  name: string;
  description: string;
  whatsappMessage?: string;
  fallbackImageUrl: string;
  sortOrder?: number;
};

export type UpdateProductInput = {
  name: string;
  description: string;
  whatsappMessage?: string;
  fallbackImageUrl: string;
  sortOrder?: number;
  active?: boolean;
};

function productsPath(site: string): string {
  return `/api/sites/${encodeURIComponent(site)}/products`;
}

export async function listProducts(site: string, all = true): Promise<StoreProduct[]> {
  const query = all ? "?all=true" : "";
  return requestJson<StoreProduct[]>(`${productsPath(site)}${query}`);
}

export async function createProduct(site: string, input: CreateProductInput): Promise<StoreProduct> {
  return requestJson<StoreProduct>(productsPath(site), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      productKey: input.productKey,
      name: input.name,
      description: input.description,
      whatsappMessage: input.whatsappMessage ?? null,
      fallbackImageUrl: input.fallbackImageUrl,
      sortOrder: input.sortOrder,
    }),
  });
}

export async function updateProduct(
  site: string,
  productKey: string,
  input: UpdateProductInput,
): Promise<StoreProduct> {
  return requestJson<StoreProduct>(`${productsPath(site)}/${encodeURIComponent(productKey)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      whatsappMessage: input.whatsappMessage ?? null,
      fallbackImageUrl: input.fallbackImageUrl,
      sortOrder: input.sortOrder,
      active: input.active,
    }),
  });
}

export async function deleteProduct(site: string, productKey: string): Promise<void> {
  await requestEmpty(`${productsPath(site)}/${encodeURIComponent(productKey)}`, {
    method: "DELETE",
  });
}

export async function reorderProducts(site: string, productKeys: string[]): Promise<void> {
  await requestEmpty(`${productsPath(site)}/reorder`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productKeys }),
  });
}

export async function uploadProductImage(
  site: string,
  productKey: string,
  file: File,
): Promise<StoreProduct> {
  await uploadImage(file, site, productKey);
  const products = await listProducts(site);
  const updated = products.find((product) => product.key === productKey);
  if (!updated) {
    throw new Error("Producto no encontrado tras subir la imagen");
  }
  return updated;
}

export async function deleteProductImage(
  site: string,
  imageId: number,
  productKey: string,
): Promise<StoreProduct> {
  await deleteImage(site, imageId);
  const products = await listProducts(site);
  const updated = products.find((product) => product.key === productKey);
  if (!updated) {
    throw new Error("Producto no encontrado tras quitar la imagen");
  }
  return updated;
}
