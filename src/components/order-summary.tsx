"use client";

import { useState } from "react";
import { ShoppingBag, Printer, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useSettings } from "@/hooks/use-settings";
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { Order } from "@/types";
import { buildTextReceiptHtml } from "@/lib/receipt";

interface OrderSummaryProps {
  onOrderPlaced?: () => Promise<void> | void;
}

export function OrderSummary({ onOrderPlaced }: OrderSummaryProps) {
  const { items, updateQuantity, removeItem, clearCart, getTotal } = useCart();
  const { settings } = useSettings();
  const currency = settings?.currency || "EGP";
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = getTotal();
  const hasItems = items.length > 0;

  const printOrder = async (order: Order) => {
    const html = buildTextReceiptHtml(order, settings);

    if (window.electronAPI?.isElectron) {
      const result = await window.electronAPI.printReceiptHtml({
        html,
        title: `Receipt-${order.id}`,
      });

      if (!result.success) {
        throw new Error(result.error || "Printing failed");
      }

      return;
    }

    const printWindow = window.open("", "_blank", "width=480,height=720");
    if (!printWindow) {
      throw new Error("Unable to open print window");
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    setTimeout(() => {
      printWindow.close();
    }, 1000);
  };

  const handlePlaceOrder = async () => {
    if (!hasItems || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

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
        const order = (await response.json()) as Order;
        await printOrder(order);
        clearCart();
        await onOrderPlaced?.();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to place order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50/50 border-l border-zinc-200">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex-none">
        <h2 className="text-xl font-bold text-zinc-800">My Orders</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Your orders will be appear here
        </p>
      </div>

      {/* Order items */}
      <div className="flex-1 overflow-y-auto px-6">
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center h-56 text-zinc-300">
            <ShoppingBag className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm">No items yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.menuItemId}
                className="flex items-center gap-3"
              >
                {/* Item image */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-emerald-50 flex-none flex items-center justify-center">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UtensilsCrossed className="w-6 h-6 text-emerald-300" />
                  )}
                </div>

                {/* Item info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-zinc-400 font-medium">
                    {formatPrice(item.price, currency)}
                  </p>
                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() =>
                        updateQuantity(item.menuItemId, item.quantity - 1)
                      }
                      className="w-6 h-6 rounded-md bg-emerald-500 text-white font-bold flex items-center justify-center hover:bg-emerald-600 transition-colors text-xs"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-zinc-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.menuItemId, item.quantity + 1)
                      }
                      disabled={item.stock !== null && item.quantity >= item.stock}
                      className="w-6 h-6 rounded-md bg-emerald-500 text-white font-bold flex items-center justify-center hover:bg-emerald-600 transition-colors text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => removeItem(item.menuItemId)}
                  className="text-red-300 hover:text-red-500 transition-colors flex-none"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-zinc-100 flex-none">
        {/* Total */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-600">Total</span>
          </div>
          <span className="text-base font-bold text-zinc-900">
            {formatPrice(total, currency)}
          </span>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Place order button */}
        <Button
          onClick={handlePlaceOrder}
          disabled={!hasItems || isSubmitting}
          className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          <Printer className="w-4 h-4 mr-2" />
          {isSubmitting ? "Processing..." : "Place Order & Print"}
        </Button>
        <p className="text-[10px] text-center text-zinc-400 mt-2">
          Receipt will print automatically
        </p>
      </div>
    </div>
  );
}
