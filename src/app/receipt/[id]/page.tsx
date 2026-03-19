"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order } from "@/types";

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const response = await fetch(`/api/orders/${id}`);
        if (response.ok) {
          const data = await response.json();
          setOrder(data);
          // Auto print after loading
          setTimeout(() => {
            window.print();
          }, 500);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-400">Order not found</div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const formattedTime = orderDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="min-h-screen bg-zinc-50 py-8 no-print">
      <div className="max-w-sm mx-auto">
        {/* Screen view card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 no-print">
          <div className="receipt-content font-mono text-sm">
            {/* Header */}
            <div className="text-center border-b border-dashed border-zinc-300 pb-4 mb-4">
              <p className="text-lg font-bold">MY POS</p>
              <p className="text-zinc-500 text-xs">Tel: 01xxxxxxxxx</p>
            </div>

            {/* Order info */}
            <div className="border-b border-dashed border-zinc-300 pb-4 mb-4 text-xs">
              <div className="flex justify-between">
                <span>Date:</span>
                <span>
                  {formattedDate} {formattedTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Order #:</span>
                <span>{String(order.id).padStart(4, "0")}</span>
              </div>
            </div>

            {/* Items */}
            <div className="border-b border-dashed border-zinc-300 pb-4 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="mb-2">
                  <div className="flex justify-between text-xs">
                    <span>{item.menuItem.name}</span>
                    <span>x{item.quantity}</span>
                  </div>
                  <div className="text-right text-xs text-zinc-500">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-b-2 border-zinc-800 pb-4 mb-4">
              <div className="flex justify-between font-bold">
                <span>TOTAL:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-zinc-500">
              <p>Thank you! Come again</p>
            </div>
          </div>
        </div>

        {/* Print button */}
        <div className="mt-6 flex gap-4 no-print">
          <Button
            onClick={() => window.print()}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Again
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="flex-1 rounded-xl h-12"
          >
            Back to POS
          </Button>
        </div>
      </div>

      {/* Print-only content */}
      <div className="hidden print:block receipt-content">
        <div className="receipt-header">
          <p>MY POS</p>
          <p style={{ fontSize: "10px", fontWeight: "normal" }}>
            Tel: 01xxxxxxxxx
          </p>
        </div>
        <div className="receipt-divider" />
        <div style={{ fontSize: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Date:</span>
            <span>
              {formattedDate} {formattedTime}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Order #:</span>
            <span>{String(order.id).padStart(4, "0")}</span>
          </div>
        </div>
        <div className="receipt-divider" />
        {order.items.map((item) => (
          <div key={item.id} className="receipt-item">
            <span>
              {item.menuItem.name} x{item.quantity}
            </span>
            <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="receipt-total">
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>TOTAL:</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
        <div className="receipt-divider" />
        <div style={{ textAlign: "center", fontSize: "10px" }}>
          Thank you! Come again
        </div>
      </div>
    </div>
  );
}
