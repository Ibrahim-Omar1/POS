"use client";

import Image from "next/image";
import { Check, UtensilsCrossed } from "lucide-react";
import { MenuItem } from "@/types";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

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
        "relative bg-white rounded-2xl shadow-sm p-4 cursor-pointer transition-all duration-200 text-left w-full",
        item.isAvailable && "hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        !item.isAvailable && "opacity-40 cursor-not-allowed",
        inCart && "ring-2 ring-emerald-400 ring-offset-1"
      )}
    >
      {/* Checkmark badge when in cart */}
      {inCart && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center z-10">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Circular image */}
      <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-3 bg-emerald-50 flex items-center justify-center">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={112}
            height={112}
            className="w-full h-full object-cover"
          />
        ) : (
          <UtensilsCrossed className="w-12 h-12 text-emerald-300" />
        )}
      </div>

      {/* Item info */}
      <div className="text-center">
        <h3 className="text-base font-bold text-zinc-800 mt-1">{item.name}</h3>
        <p className="text-xs text-zinc-400">{item.category.name}</p>
        <p className="text-sm font-semibold text-emerald-500 mt-1">
          ${item.price.toFixed(2)}
        </p>
      </div>
    </button>
  );
}
