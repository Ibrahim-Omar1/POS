"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order, Settings } from "@/types";

export default function PrintReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          fetch(`/api/orders/${id}`),
          fetch("/api/settings"),
        ]);

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrder(orderData);
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setSettings(settingsData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-100">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-100">
        <div className="text-zinc-400">Order not found</div>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt);
  const formattedDateTime = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}-${String(orderDate.getDate()).padStart(2, "0")} ${String(orderDate.getHours()).padStart(2, "0")}:${String(orderDate.getMinutes()).padStart(2, "0")}`;

  const storeName = settings?.storeName || "My POS Store";
  const storeAddress = settings?.storeAddress || "";
  const storePhone = settings?.storePhone || "";
  const currency = settings?.currency || "EGP";

  // Build plain text receipt
  const line = "================================";
  const shortLine = "--------------------------------";

  let receipt = "";
  receipt += line + "\n";
  receipt += centerText(storeName, 32) + "\n";
  if (storeAddress) receipt += centerText(storeAddress, 32) + "\n";
  if (storePhone) receipt += centerText(`Tel: ${storePhone}`, 32) + "\n";
  receipt += line + "\n";
  receipt += `Order #${String(order.id).padStart(3, "0")}\n`;
  receipt += `Date: ${formattedDateTime}\n`;
  receipt += shortLine + "\n";

  // Items
  order.items.forEach((item) => {
    const name = item.menuItem.name.substring(0, 20);
    const qty = `x${item.quantity}`;
    const price = `${(item.unitPrice * item.quantity).toFixed(2)}`;
    receipt += `${name.padEnd(18)} ${qty.padStart(3)} ${price.padStart(8)}\n`;
  });

  receipt += shortLine + "\n";
  receipt += `${"TOTAL".padEnd(22)} ${order.total.toFixed(2).padStart(8)} ${currency}\n`;
  receipt += line + "\n";
  receipt += centerText("Thank You!", 32) + "\n";
  receipt += line + "\n";

  function centerText(text: string, width: number): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return " ".repeat(padding) + text;
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt-${id}</title>
            <style>
              body {
                font-family: 'Courier New', Courier, monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 5px;
                white-space: pre;
              }
              @media print {
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
              }
            </style>
          </head>
          <body>${receipt}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }

  return (
    <div className="min-h-screen bg-zinc-200 py-8 flex items-center justify-center">
      <div className="w-[350px]">
        {/* Preview */}
        <div className="bg-white shadow-2xl p-4 rounded-lg mb-6">
          <pre className="font-mono text-xs whitespace-pre leading-tight">
            {receipt}
          </pre>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Text Receipt
          </Button>
          <Button
            onClick={() => router.push(`/receipt/${id}`)}
            variant="outline"
            className="flex-1 rounded-xl h-12 bg-white"
          >
            Styled Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}
