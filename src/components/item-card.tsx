"use client";

import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { MenuItem } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

interface ItemCardProps {
  item: MenuItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const { addItem, getItemQuantity } = useCart();
  const { settings } = useSettings();
  const currency = settings?.currency || "EGP";
  const quantity = getItemQuantity(item.id);
  const inCart = quantity > 0;

  // Check if item is out of stock (stock is 0) or if we've reached the stock limit in cart
  const isOutOfStock = item.stock !== null && item.stock === 0;
  const reachedStockLimit = item.stock !== null && quantity >= item.stock;
  const canAdd = item.isAvailable && !isOutOfStock && !reachedStockLimit;

  const handleClick = () => {
    if (!canAdd) return;
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      stock: item.stock,
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={!canAdd}
      className={cn(
        "relative bg-white rounded-lg p-1.5 cursor-pointer transition-all duration-150 text-left w-full aspect-square flex flex-col items-center justify-center",
        "border border-zinc-100 shadow-sm",
        canAdd && "hover:shadow-md hover:border-zinc-200 hover:scale-[1.03] active:scale-[0.97]",
        (!item.isAvailable || isOutOfStock) && "opacity-40 cursor-not-allowed",
        reachedStockLimit && !isOutOfStock && "opacity-70 cursor-not-allowed",
        inCart && "bg-emerald-50 border-emerald-200 shadow-md"
      )}
    >
      {/* Out of stock badge */}
      {isOutOfStock && (
        <div className="absolute top-1 left-1 px-1 py-0.5 bg-red-500 rounded text-[8px] font-bold text-white z-10">
          OUT
        </div>
      )}

      {/* Low stock indicator */}
      {!isOutOfStock && item.stock !== null && item.stock <= 5 && (
        <div className="absolute top-1 left-1 px-1 py-0.5 bg-amber-500 rounded text-[8px] font-bold text-white z-10">
          {item.stock}
        </div>
      )}

      {/* Quantity badge when in cart */}
      {inCart && (
        <div className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-emerald-500 rounded-full flex items-center justify-center z-10 shadow">
          <span className="text-[10px] font-bold text-white">{quantity}</span>
        </div>
      )}

      {/* Circular image */}
      <div className="w-10 h-10 rounded-full overflow-hidden mx-auto mb-1.5 bg-emerald-50/50 flex items-center justify-center">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          <UtensilsCrossed className="w-4 h-4 text-emerald-300" />
        )}
      </div>

      {/* Item info */}
      <div className="text-center space-y-0 w-full px-0.5">
        <h3 className="text-[11px] font-semibold text-zinc-800 leading-tight truncate">{item.name}</h3>
        <p className="text-[9px] text-zinc-400 truncate">{item.category.name}</p>
        <p className="text-[11px] font-bold text-emerald-500">
          {formatPrice(item.price, currency)}
        </p>
      </div>
    </button>
  );
}
