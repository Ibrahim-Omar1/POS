"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, Printer, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart } from "@/hooks/use-cart";
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";

export function OrderSummary() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCart();
  const total = getTotal();
  const hasItems = items.length > 0;

  const handlePlaceOrder = async () => {
    if (!hasItems) return;

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          total,
        }),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        router.push(`/receipt/${order.id}`);
      }
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-zinc-100">
      {/* Header */}
      <div className="p-6 pb-0 flex-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-zinc-800">Order Summary</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Your items will appear here
            </p>
          </div>
          {hasItems && (
            <button
              onClick={clearCart}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors"
            >
              Clear Order
            </button>
          )}
        </div>
      </div>

      {/* Order items */}
      <ScrollArea className="flex-1 px-6 py-4">
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
            <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
            <p>No items yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.menuItemId}
                className="flex items-center gap-3 py-3 border-b border-zinc-50"
              >
                {/* Item image */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-50 flex-none flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="w-5 h-5 text-emerald-300" />
                  )}
                </div>

                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-400">
                    ${item.price.toFixed(2)}
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateQuantity(item.menuItemId, item.quantity - 1)
                    }
                    className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center hover:bg-emerald-600 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center text-sm font-bold text-zinc-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.menuItemId, item.quantity + 1)
                    }
                    className="w-7 h-7 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center hover:bg-emerald-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="ml-2 text-red-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-6 border-t border-zinc-100 flex-none">
        {/* Total */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-zinc-400" />
            <span className="text-base font-semibold text-zinc-700">Total</span>
          </div>
          <span className="text-lg font-bold text-zinc-900">
            ${total.toFixed(2)}
          </span>
        </div>

        {/* Place order button */}
        <Button
          onClick={handlePlaceOrder}
          disabled={!hasItems}
          className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          <Printer className="w-5 h-5 mr-2" />
          Place Order & Print
        </Button>
        <p className="text-xs text-center text-zinc-400 mt-2">
          Receipt will print automatically
        </p>
      </div>
    </div>
  );
}
