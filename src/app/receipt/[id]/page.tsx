"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Printer, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Order, Settings } from "@/types";
import {
  buildStyledReceiptHtml,
  buildTextReceipt,
  buildTextReceiptHtml,
  getReceiptContext,
} from "@/lib/receipt";

export default function ReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [printMode, setPrintMode] = useState<"styled" | "text">("text");

  useEffect(() => {
    async function fetchData() {
      try {
        const [orderRes, settingsRes] = await Promise.all([
          fetch(`/api/orders/${id}`),
          fetch("/api/settings"),
        ]);

        if (orderRes.ok) {
          setOrder(await orderRes.json());
        }
        if (settingsRes.ok) {
          setSettings(await settingsRes.json());
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

  const { formattedDate, formattedTime, storeName, storeAddress, storePhone, currency, total } =
    getReceiptContext(order, settings);
  const textReceipt = buildTextReceipt(order, settings);
  const styledReceiptHtml = buildStyledReceiptHtml(order, settings);
  const textReceiptHtml = buildTextReceiptHtml(order, settings);

  const handlePrint = async () => {
    try {
      console.log("[ReceiptPrint] Print button clicked", {
        id,
        printMode,
        isElectron: Boolean(window.electronAPI?.isElectron),
      });

      document.title = `Receipt-${id}`;
      if (window.electronAPI?.isElectron) {
        const html = printMode === "text" ? textReceiptHtml : styledReceiptHtml;
        console.log("[ReceiptPrint] Sending receipt HTML to Electron", {
          mode: printMode,
          length: html.length,
        });
        const result = await window.electronAPI.printReceiptHtml({
          html,
          title: `Receipt-${id}`,
        });
        console.log("[ReceiptPrint] Electron HTML print result", result);
        if (!result.success) {
          throw new Error(result.error || "Electron HTML print failed");
        }
        return;
      }

      console.log("[ReceiptPrint] Using renderer window.print()");
      window.print();
    } catch (error) {
      console.error("Print error:", error);
      alert("Printing failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-200 py-8 flex items-center justify-center print:bg-white print:py-0">
      <div className="w-[420px] print:w-auto">
        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4 print:hidden">
          <Button
            onClick={() => setPrintMode("text")}
            variant={printMode === "text" ? "default" : "outline"}
            className={`flex-1 rounded-xl ${printMode === "text" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-white"}`}
          >
            Text Mode (Generic Printer)
          </Button>
          <Button
            onClick={() => setPrintMode("styled")}
            variant={printMode === "styled" ? "default" : "outline"}
            className={`flex-1 rounded-xl ${printMode === "styled" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-white"}`}
          >
            Styled Mode
          </Button>
        </div>

        {/* Text Receipt Preview */}
        {printMode === "text" && (
          <div className="bg-white shadow-2xl rounded-lg mb-4 overflow-x-auto print:shadow-none print:rounded-none print:mb-0">
            <div className="print:w-auto">
              <pre
                style={{
                  margin: 0,
                  padding: "8px 8px 0 8px",
                  fontFamily: "monospace",
                  fontSize: "12px",
                  lineHeight: "1.2",
                  whiteSpace: "pre",
                  textAlign: "left",
                }}
                className="print:text-[13pt]"
              >{textReceipt}</pre>
            </div>
          </div>
        )}

        {/* Styled Receipt Preview */}
        {printMode === "styled" && (
          <div
            className="receipt-paper bg-white shadow-2xl px-4 py-4 print:shadow-none"
            style={{
              fontFamily: "'Courier New', Courier, monospace",
              fontSize: "12px",
              lineHeight: "1.3",
            }}
          >
            <div className="mb-3">
              <span className="text-2xl font-black">
                #{String(order.id).padStart(3, "0")}
              </span>
            </div>

            <div className="flex flex-col items-center mb-2">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-800 flex items-center justify-center mb-1">
                <Store className="w-6 h-6" />
              </div>
            </div>

            <div className="text-center mb-2">
              <h1 className="text-sm font-bold">{storeName}</h1>
              {storeAddress && <p className="text-[10px] text-zinc-600">{storeAddress}</p>}
              {storePhone && <p className="text-[10px] text-zinc-600">Tel: {storePhone}</p>}
            </div>

            <div className="border-t border-dashed border-zinc-400 my-2" />

            <div className="my-2 text-[11px] space-y-0">
              <div>Date: {formattedDate} {formattedTime}</div>
              <div>Order No.: #{String(order.id).padStart(3, "0")}</div>
              <div>Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</div>
            </div>

            <div className="border-t border-dashed border-zinc-400 my-2" />

            <div className="my-2 space-y-1">
              {order.items.map((item) => (
                <div key={item.id} className="flex text-[11px]">
                  <span className="w-5 flex-shrink-0">{item.quantity}</span>
                  <span className="flex-1 pr-2">{item.menuItem.name}</span>
                  <span className="text-right font-medium">
                    {item.unitPrice.toFixed(2)} {currency}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-zinc-400 my-2" />

            <div className="my-2 flex justify-between items-baseline">
              <span className="text-lg font-bold">Total</span>
              <span className="text-xl font-black">{total.toFixed(2)} {currency}</span>
            </div>

            <div className="border-t border-dashed border-zinc-400 my-2" />

            <div className="text-center mt-2">
              <p className="text-sm font-medium">Bon Appetit!</p>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex gap-4 print:hidden">
          <Button
            onClick={handlePrint}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-12"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="flex-1 rounded-xl h-12 bg-white"
          >
            Back to POS
          </Button>
        </div>
      </div>
    </div>
  );
}
