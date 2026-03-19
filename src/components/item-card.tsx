"use client";

import Image from "next/image";
import { Check, UtensilsCrossed } from "lucide-react";
import { MenuItem } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

interface ItemCardProps {
  item: MenuItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(item.id);

  const handleClick = () => {
    if (!item.isAvailable) return;
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={!item.isAvailable}
      className={cn(
        "relative bg-white rounded-lg p-1.5 cursor-pointer transition-all duration-150 text-left w-full aspect-square flex flex-col items-center justify-center",
        "border border-zinc-100 shadow-sm",
        item.isAvailable && "hover:shadow-md hover:border-zinc-200 hover:scale-[1.03] active:scale-[0.97]",
        !item.isAvailable && "opacity-40 cursor-not-allowed",
        inCart && "bg-emerald-50 border-emerald-200 shadow-md"
      )}
    >
      {/* Checkmark badge when in cart */}
      {inCart && (
        <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center z-10 shadow">
          <Check className="w-2 h-2 text-white stroke-[3]" />
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
          {formatPrice(item.price)}
        </p>
      </div>
    </button>
  );
}
