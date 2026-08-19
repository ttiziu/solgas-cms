"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

export function resolveProductImageSrc(
  sitePublicUrl: string | null | undefined,
  imageUrl: string,
): string {
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (sitePublicUrl && imageUrl.startsWith("/")) {
    return `${sitePublicUrl.replace(/\/$/, "")}${imageUrl}`;
  }
  return imageUrl;
}

type ProductThumbnailProps = {
  src: string;
  alt: string;
};

export function ProductThumbnail({ src, alt }: ProductThumbnailProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground">
        <ImageIcon className="size-10 opacity-40" aria-hidden />
        <span className="text-xs font-medium">Sin imagen</span>
        <span className="max-w-[90%] text-center text-[11px] leading-snug opacity-70">
          Sube una foto o usa una ruta válida en la web pública
        </span>
      </div>
    );
  }

  const isRemote = src.startsWith("http");

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 100vw, 33vw"
      unoptimized={isRemote}
      onError={() => setFailed(true)}
    />
  );
}
