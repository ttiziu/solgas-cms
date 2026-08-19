export function getApiUrl(): string {
  const url = process.env.API_URL;
  if (!url) {
    throw new Error("API_URL no está definida en el entorno");
  }
  return url.replace(/\/$/, "");
}
