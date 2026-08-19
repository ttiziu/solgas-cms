import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type ProductFormValues = {
  name: string;
  description: string;
  whatsappMessage: string;
  fallbackImageUrl: string;
  sortOrder: string;
  active: boolean;
};

type ProductFormFieldsProps = {
  values: ProductFormValues;
  onChange: (values: ProductFormValues) => void;
  showActive?: boolean;
  productKey?: string;
};

export function ProductFormFields({
  values,
  onChange,
  showActive = false,
  productKey,
}: ProductFormFieldsProps) {
  function patch(partial: Partial<ProductFormValues>) {
    onChange({ ...values, ...partial });
  }

  return (
    <div className="grid gap-4">
      {productKey ? (
        <div className="flex flex-col gap-1.5">
          <Label>Clave (no editable)</Label>
          <Input value={productKey} readOnly disabled className="font-mono text-sm" />
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="product-name">Nombre</Label>
          <Input
            id="product-name"
            value={values.name}
            onChange={(e) => patch({ name: e.target.value })}
            placeholder="Balón Solgas 10 kg"
            required
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="product-description">Descripción</Label>
          <Textarea
            id="product-description"
            value={values.description}
            onChange={(e) => patch({ description: e.target.value })}
            placeholder="Texto corto en la tarjeta de la web"
            rows={3}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="product-whatsapp">Mensaje WhatsApp (opcional)</Label>
          <Textarea
            id="product-whatsapp"
            value={values.whatsappMessage}
            onChange={(e) => patch({ whatsappMessage: e.target.value })}
            placeholder="Hola, me interesa…"
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="product-fallback">Imagen por defecto (opcional)</Label>
          <Input
            id="product-fallback"
            value={values.fallbackImageUrl}
            onChange={(e) => patch({ fallbackImageUrl: e.target.value })}
            placeholder="Solo si no subes foto en el CMS"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Las fotos del catálogo se gestionan desde «Subir foto» en cada tarjeta.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product-order">Orden</Label>
          <Input
            id="product-order"
            type="number"
            min={1}
            value={values.sortOrder}
            onChange={(e) => patch({ sortOrder: e.target.value })}
            required
          />
        </div>

        {showActive ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 sm:col-span-2">
            <div>
              <Label htmlFor="product-active">Visible en la web</Label>
              <p className="text-xs text-muted-foreground">
                Si está apagado, no aparece en la tienda pública.
              </p>
            </div>
            <Switch
              id="product-active"
              checked={values.active}
              onCheckedChange={(checked) => patch({ active: checked })}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function emptyProductFormValues(sortOrder = 1): ProductFormValues {
  return {
    name: "",
    description: "",
    whatsappMessage: "",
    fallbackImageUrl: "",
    sortOrder: String(sortOrder),
    active: true,
  };
}

export function productToFormValues(product: {
  name: string;
  description: string;
  whatsappMessage: string | null;
  fallbackImageUrl: string;
  sortOrder: number;
  active: boolean;
}): ProductFormValues {
  return {
    name: product.name,
    description: product.description,
    whatsappMessage: product.whatsappMessage ?? "",
    fallbackImageUrl: product.fallbackImageUrl,
    sortOrder: String(product.sortOrder),
    active: product.active,
  };
}

export function parseProductForm(values: ProductFormValues): {
  name: string;
  description: string;
  whatsappMessage?: string;
  fallbackImageUrl: string;
  sortOrder: number;
  active: boolean;
} | null {
  const name = values.name.trim();
  const description = values.description.trim();
  const fallbackImageUrl = values.fallbackImageUrl.trim();
  const sortOrder = Number.parseInt(values.sortOrder, 10);

  if (!name || !description || Number.isNaN(sortOrder) || sortOrder < 1) {
    return null;
  }

  const whatsappMessage = values.whatsappMessage.trim();
  return {
    name,
    description,
    whatsappMessage: whatsappMessage || undefined,
    fallbackImageUrl,
    sortOrder,
    active: values.active,
  };
}
