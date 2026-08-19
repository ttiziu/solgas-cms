import { redirect } from "next/navigation";

export default async function ImagenesRedirectPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  redirect(`/sitios/${site}/productos`);
}
