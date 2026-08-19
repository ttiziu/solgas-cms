"use client";

import type { HTMLAttributes } from "react";
import { GripVertical } from "lucide-react";
import { ProductThumbnail, resolveProductImageSrc } from "@/components/product-thumbnail";
import type { StoreProduct } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export type ProductCardProps = {
  product: StoreProduct;
  sitePublicUrl: string | null;
  isBusy: boolean;
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>;
  onEdit: () => void;
  onUpload: (file: File) => void;
  onRemoveImage: () => void;
  onDelete: () => void;
  onToggleActive: (active: boolean) => void;
};

export function ProductCard({
  product,
  sitePublicUrl,
  isBusy,
  dragHandleProps,
  onEdit,
  onUpload,
  onRemoveImage,
  onDelete,
  onToggleActive,
}: ProductCardProps) {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm ${
        product.active ? "border-border" : "border-dashed border-muted-foreground/40 opacity-75"
      }`}
    >
      <div className="relative aspect-square bg-muted">
        <ProductThumbnail
          src={resolveProductImageSrc(sitePublicUrl, product.imageUrl)}
          alt={product.name}
        />
        {dragHandleProps ? (
          <button
            type="button"
            className="absolute top-2 left-2 flex size-8 cursor-grab items-center justify-center rounded-md bg-background/90 text-muted-foreground ring-1 ring-border active:cursor-grabbing"
            aria-label={`Arrastrar ${product.name}`}
            {...dragHandleProps}
          >
            <GripVertical className="size-4" aria-hidden />
          </button>
        ) : null}
        {!product.active ? (
          <span
            className={`absolute top-2 rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border ${
              dragHandleProps ? "left-12" : "left-2"
            }`}
          >
            Oculto
          </span>
        ) : null}
        <span className="absolute top-2 right-2 rounded-md bg-background/90 px-2 py-0.5 font-mono text-xs text-muted-foreground ring-1 ring-border">
          #{product.sortOrder}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{product.key}</p>
          <h2 className="font-heading text-base font-semibold">{product.name}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
          <Label htmlFor={`visible-${product.key}`} className="text-xs font-normal">
            Visible en web
          </Label>
          <Switch
            id={`visible-${product.key}`}
            checked={product.active}
            disabled={isBusy}
            onCheckedChange={onToggleActive}
          />
        </div>

        <div className="mt-auto flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={isBusy} onClick={onEdit}>
            Editar
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => document.getElementById(`file-${product.key}`)?.click()}
          >
            {product.cmsImageId ? "Cambiar foto" : "Subir foto"}
          </Button>
          {product.cmsImageId ? (
            <Button type="button" variant="ghost" size="sm" disabled={isBusy} onClick={onRemoveImage}>
              Quitar foto
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            disabled={isBusy}
            onClick={onDelete}
          >
            Eliminar
          </Button>
        </div>

        <input
          id={`file-${product.key}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) onUpload(file);
          }}
        />
      </div>
    </article>
  );
}
