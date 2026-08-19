"use client";

import { useState } from "react";
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  reorderProducts,
  type StoreProduct,
  updateProduct,
  uploadProductImage,
} from "@/lib/api";
import { ProductSortableGrid } from "@/components/product-sortable-grid";
import { ProductBoardSkeleton } from "@/components/product-board-skeleton";
import { compressProductImage } from "@/lib/compress-image";
import {
  useInvalidateSiteProducts,
  useSetSiteProducts,
  useSiteProducts,
} from "@/hooks/use-site-products";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  emptyProductFormValues,
  parseProductForm,
  ProductFormFields,
  productToFormValues,
  type ProductFormValues,
} from "@/components/product-form-fields";

type ProductBoardProps = {
  siteSlug: string;
  siteName: string;
  sitePublicUrl: string | null;
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductBoard({
  siteSlug,
  siteName,
  sitePublicUrl,
}: ProductBoardProps) {
  const { data: products = [], isLoading, isError } = useSiteProducts(siteSlug);
  const invalidateProducts = useInvalidateSiteProducts();
  const setProducts = useSetSiteProducts();

  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<StoreProduct | null>(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState<StoreProduct | null>(null);

  const [addKey, setAddKey] = useState("");
  const [addForm, setAddForm] = useState<ProductFormValues>(() =>
    emptyProductFormValues(1)
  );
  const [editForm, setEditForm] = useState<ProductFormValues | null>(null);

  function openEdit(product: StoreProduct) {
    setEditProduct(product);
    setEditForm(productToFormValues(product));
    setError(null);
  }

  function closeEdit() {
    setEditProduct(null);
    setEditForm(null);
  }

  async function handleCreate() {
    const productKey = addKey.trim() || slugify(addForm.name);
    const parsed = parseProductForm(addForm);
    if (!productKey || !parsed) {
      setError("Completa nombre, descripción, imagen por defecto y orden.");
      return;
    }

    setBusyKey("__create__");
    setError(null);
    try {
      const created = await createProduct(siteSlug, {
        productKey,
        ...parsed,
      });
      setProducts(siteSlug, (prev) => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder));
      setAddKey("");
      setAddForm(emptyProductFormValues(products.length + 2));
      setAddOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el producto.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleUpdate() {
    if (!editProduct || !editForm) return;
    const parsed = parseProductForm(editForm);
    if (!parsed) {
      setError("Completa nombre, descripción, imagen por defecto y orden.");
      return;
    }

    setBusyKey(editProduct.key);
    setError(null);
    try {
      const updated = await updateProduct(siteSlug, editProduct.key, parsed);
      setProducts(siteSlug, (prev) =>
        prev
          .map((p) => (p.key === updated.key ? updated : p))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      );
      closeEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el producto.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleDelete() {
    if (!deleteProductTarget) return;
    const key = deleteProductTarget.key;
    setBusyKey(key);
    setError(null);
    try {
      await deleteProduct(siteSlug, key);
      setProducts(siteSlug, (prev) => prev.filter((p) => p.key !== key));
      setDeleteProductTarget(null);
      if (editProduct?.key === key) closeEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo eliminar el producto.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleToggleActive(product: StoreProduct, active: boolean) {
    setBusyKey(product.key);
    setError(null);
    try {
      const updated = await updateProduct(siteSlug, product.key, {
        name: product.name,
        description: product.description,
        whatsappMessage: product.whatsappMessage ?? undefined,
        fallbackImageUrl: product.fallbackImageUrl,
        sortOrder: product.sortOrder,
        active,
      });
      setProducts(siteSlug, (prev) => prev.map((p) => (p.key === updated.key ? updated : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo actualizar la visibilidad.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleReorder(nextProducts: StoreProduct[]) {
    setProducts(siteSlug, nextProducts);
    setBusyKey("__reorder__");
    setError(null);
    try {
      await reorderProducts(
        siteSlug,
        nextProducts.map((product) => product.key),
      );
    } catch (e) {
      await invalidateProducts(siteSlug);
      setError(e instanceof Error ? e.message : "No se pudo guardar el orden.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleUpload(productKey: string, file: File) {
    setBusyKey(productKey);
    setError(null);
    try {
      const compressed = await compressProductImage(file);
      const updated = await uploadProductImage(siteSlug, productKey, compressed);
      setProducts(siteSlug, (prev) => prev.map((p) => (p.key === productKey ? updated : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo subir la imagen.");
    } finally {
      setBusyKey(null);
    }
  }

  async function handleRemoveImage(product: StoreProduct) {
    if (!product.cmsImageId) return;
    setBusyKey(product.key);
    setError(null);
    try {
      const updated = await deleteProductImage(siteSlug, product.cmsImageId, product.key);
      setProducts(siteSlug, (prev) => prev.map((p) => (p.key === product.key ? updated : p)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo quitar la imagen.");
    } finally {
      setBusyKey(null);
    }
  }

  if (isLoading && products.length === 0) {
    return <ProductBoardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">Productos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Catálogo de <span className="font-medium text-foreground">{siteName}</span>. Arrastra las tarjetas
            para cambiar el orden en la web.
          </p>
        </div>
        <Button type="button" onClick={() => setAddOpen(true)}>
          Agregar producto
        </Button>
      </div>

      {isError ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          No se pudo cargar el catálogo. Recarga la página o intenta de nuevo en unos segundos.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <ProductSortableGrid
        products={products}
        sitePublicUrl={sitePublicUrl}
        busyKey={busyKey}
        reordering={busyKey === "__reorder__"}
        onReorder={(next) => void handleReorder(next)}
        getCardProps={(product) => ({
          onEdit: () => openEdit(product),
          onUpload: (file) => void handleUpload(product.key, file),
          onRemoveImage: () => void handleRemoveImage(product),
          onDelete: () => setDeleteProductTarget(product),
          onToggleActive: (active) => void handleToggleActive(product, active),
        })}
      />

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay productos. Agrega el primero con el botón de arriba.</p>
      ) : null}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Agregar producto</DialogTitle>
            <DialogDescription>
              La clave identifica el producto en la URL del CMS y en la web. Si la dejas vacía, se genera del nombre.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="add-product-key">Clave</Label>
            <Input
              id="add-product-key"
              value={addKey}
              onChange={(e) => setAddKey(e.target.value)}
              placeholder={addForm.name ? slugify(addForm.name) : "balon-10kg"}
              className="font-mono text-sm"
            />
          </div>

          <ProductFormFields values={addForm} onChange={setAddForm} />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={busyKey === "__create__"} onClick={() => void handleCreate()}>
              {busyKey === "__create__" ? "Creando…" : "Crear producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editProduct} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar producto</DialogTitle>
            <DialogDescription>
              Cambios en nombre, descripción y WhatsApp se ven al instante en la web pública.
            </DialogDescription>
          </DialogHeader>

          {editForm && editProduct ? (
            <ProductFormFields
              values={editForm}
              onChange={setEditForm}
              showActive
              productKey={editProduct.key}
            />
          ) : null}

          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              disabled={busyKey === editProduct?.key}
              onClick={() => editProduct && setDeleteProductTarget(editProduct)}
            >
              Eliminar producto
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeEdit}>
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={busyKey === editProduct?.key}
                onClick={() => void handleUpdate()}
              >
                {busyKey === editProduct?.key ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteProductTarget} onOpenChange={(open) => !open && setDeleteProductTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar producto?</DialogTitle>
            <DialogDescription>
              Se borrará <span className="font-medium text-foreground">{deleteProductTarget?.name}</span> (
              <span className="font-mono">{deleteProductTarget?.key}</span>) y su imagen del CMS. Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteProductTarget(null)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busyKey === deleteProductTarget?.key}
              onClick={() => void handleDelete()}
            >
              {busyKey === deleteProductTarget?.key ? "Eliminando…" : "Sí, eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
