"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProductCard, type ProductCardProps } from "@/components/product-card";
import type { StoreProduct } from "@/lib/api";

type ProductSortableGridProps = {
  products: StoreProduct[];
  sitePublicUrl: string | null;
  busyKey: string | null;
  reordering: boolean;
  onReorder: (products: StoreProduct[]) => void;
  getCardProps: (product: StoreProduct) => Omit<
    ProductCardProps,
    "product" | "sitePublicUrl" | "isBusy" | "dragHandleProps"
  >;
};

const gridClassName = "grid gap-4 sm:grid-cols-2 xl:grid-cols-3";

function SortableProductCard({
  product,
  sitePublicUrl,
  isBusy,
  cardProps,
}: {
  product: StoreProduct;
  sitePublicUrl: string | null;
  isBusy: boolean;
  cardProps: Omit<ProductCardProps, "product" | "sitePublicUrl" | "isBusy" | "dragHandleProps">;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.key,
    disabled: isBusy,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "shadow-lg" : undefined}>
      <ProductCard
        product={product}
        sitePublicUrl={sitePublicUrl}
        isBusy={isBusy}
        dragHandleProps={{ ...attributes, ...listeners }}
        {...cardProps}
      />
    </div>
  );
}

function SortableProductGrid({
  products,
  sitePublicUrl,
  busyKey,
  reordering,
  onReorder,
  getCardProps,
}: ProductSortableGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const globalBusy = reordering || busyKey === "__reorder__";

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = products.findIndex((product) => product.key === active.id);
    const newIndex = products.findIndex((product) => product.key === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    const reordered = arrayMove(products, oldIndex, newIndex).map((product, index) => ({
      ...product,
      sortOrder: index + 1,
    }));

    onReorder(reordered);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={products.map((product) => product.key)} strategy={rectSortingStrategy}>
        <div className={gridClassName}>
          {products.map((product) => {
            const isBusy = globalBusy || busyKey === product.key;
            return (
              <SortableProductCard
                key={product.key}
                product={product}
                sitePublicUrl={sitePublicUrl}
                isBusy={isBusy}
                cardProps={getCardProps(product)}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export function ProductSortableGrid({
  products,
  sitePublicUrl,
  busyKey,
  reordering,
  onReorder,
  getCardProps,
}: ProductSortableGridProps) {
  const [sortableReady, setSortableReady] = useState(false);

  useEffect(() => {
    setSortableReady(true);
  }, []);

  const globalBusy = reordering || busyKey === "__reorder__";

  if (!sortableReady) {
    return (
      <div className={gridClassName}>
        {products.map((product) => {
          const isBusy = globalBusy || busyKey === product.key;
          return (
            <ProductCard
              key={product.key}
              product={product}
              sitePublicUrl={sitePublicUrl}
              isBusy={isBusy}
              {...getCardProps(product)}
            />
          );
        })}
      </div>
    );
  }

  return (
    <SortableProductGrid
      products={products}
      sitePublicUrl={sitePublicUrl}
      busyKey={busyKey}
      reordering={reordering}
      onReorder={onReorder}
      getCardProps={getCardProps}
    />
  );
}
