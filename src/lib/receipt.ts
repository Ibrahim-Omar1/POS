import { Order, Settings } from "@/types";

function centerText(text: string, width: number): string {
  const totalPadding = width - text.length;
  const leftPad = Math.max(0, Math.floor(totalPadding / 2));
  const rightPad = Math.max(0, totalPadding - leftPad);
  return " ".repeat(leftPad) + text + " ".repeat(rightPad);
}

function rightAlign(left: string, right: string, width: number): string {
  const space = width - left.length - right.length;
  return left + " ".repeat(Math.max(1, space)) + right;
}

function padCell(
  value: string,
  width: number,
  align: "left" | "right" = "left"
): string {
  const trimmed = value.length > width ? value.slice(0, width) : value;
  return align === "right" ? trimmed.padStart(width) : trimmed.padEnd(width);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function getReceiptContext(order: Order, settings: Settings | null) {
  const orderDate = new Date(order.createdAt);
  const formattedDate = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}-${String(orderDate.getDate()).padStart(2, "0")}`;
  const formattedTime = `${String(orderDate.getHours()).padStart(2, "0")}:${String(orderDate.getMinutes()).padStart(2, "0")}`;

  return {
    formattedDate,
    formattedTime,
    storeName: settings?.storeName || "My POS Store",
    storeAddress: settings?.storeAddress || "",
    storePhone: settings?.storePhone || "",
    currency: settings?.currency || "EGP",
    total: order.total,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export function buildTextReceipt(order: Order, settings: Settings | null) {
  const { formattedDate, formattedTime, storeName, storeAddress, storePhone, currency, total, itemCount } =
    getReceiptContext(order, settings);

  const width = 46;
  const line = "=".repeat(width);
  const dash = "-".repeat(width);
  const nameWidth = 18;
  const qtyWidth = 5;
  const priceWidth = 9;
  const totalWidth = 10;

  let textReceipt = "";
  textReceipt += "  " + centerText(storeName.substring(0, width - 2), width - 2) + "\n";
  if (storeAddress) textReceipt += centerText(storeAddress.substring(0, width), width) + "\n";
  if (storePhone) textReceipt += centerText(`Tel: ${storePhone}`, width) + "\n";
  textReceipt += line + "\n";
  textReceipt += `Order: #${String(order.id).padStart(3, "0")}\n`;
  textReceipt += `Date: ${formattedDate} ${formattedTime}\n`;
  textReceipt += `Items: ${itemCount}\n`;
  textReceipt += dash + "\n";
  textReceipt += `${padCell("NAME", nameWidth)} ${padCell("QTY", qtyWidth, "right")} ${padCell("PRICE", priceWidth, "right")} ${padCell("TOTAL", totalWidth, "right")}\n`;
  textReceipt += dash + "\n";

  order.items.forEach((item) => {
    const name = item.menuItem.name;
    const qty = String(item.quantity);
    const price = item.unitPrice.toFixed(2);
    const itemTotal = (item.unitPrice * item.quantity).toFixed(2);
    textReceipt += `${padCell(name, nameWidth)} ${padCell(qty, qtyWidth, "right")} ${padCell(price, priceWidth, "right")} ${padCell(itemTotal, totalWidth, "right")}\n`;
  });

  textReceipt += dash + "\n";
  textReceipt += rightAlign("TOTAL:", `${total.toFixed(2)} ${currency}`, width) + "\n";
  textReceipt += line + "\n";
  textReceipt += centerText("Bon Appetit!", width) + "\n";
  textReceipt += line + "\n";

  return textReceipt;
}

export function buildTextReceiptHtml(order: Order, settings: Settings | null) {
  const textReceipt = buildTextReceipt(order, settings);

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt-${order.id}</title>
        <style>
          @page { margin: 0; }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
          }
          body {
            padding: 8px 8px 0;
            font-family: Consolas, "Courier New", monospace;
            font-size: 13pt;
            line-height: 1.2;
            white-space: pre;
          }
        </style>
      </head>
      <body>${escapeHtml(textReceipt)}</body>
    </html>
  `;
}

export function buildStyledReceiptHtml(order: Order, settings: Settings | null) {
  const { formattedDate, formattedTime, storeName, storeAddress, storePhone, currency, total, itemCount } =
    getReceiptContext(order, settings);

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Receipt-${order.id}</title>
        <style>
          @page { size: 72mm auto; margin: 0; }
          html, body {
            margin: 0;
            padding: 0;
            background: white;
            font-family: "Courier New", Courier, monospace;
          }
          body {
            width: 72mm;
            padding: 2mm 2mm 0;
            box-sizing: border-box;
            color: #111827;
            font-size: 12px;
            line-height: 1.3;
          }
          .center { text-align: center; }
          .row {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            font-size: 11px;
            margin-bottom: 4px;
          }
          .qty { width: 16px; flex-shrink: 0; }
          .name { flex: 1; }
          .price { text-align: right; white-space: nowrap; }
          .divider {
            border-top: 1px dashed #9ca3af;
            margin: 8px 0;
          }
          .badge {
            font-size: 28px;
            font-weight: 900;
            margin-bottom: 10px;
          }
          .store-icon {
            width: 48px;
            height: 48px;
            border: 2px solid #27272a;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 6px;
            font-size: 24px;
          }
          .store-name { font-size: 14px; font-weight: 700; }
          .muted { font-size: 10px; color: #52525b; }
          .meta { font-size: 11px; }
          .total {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin: 8px 0;
          }
          .total-label { font-size: 18px; font-weight: 700; }
          .total-value { font-size: 22px; font-weight: 900; }
        </style>
      </head>
      <body>
        <div class="badge">#${String(order.id).padStart(3, "0")}</div>
        <div class="center">
          <div class="store-icon">S</div>
          <div class="store-name">${escapeHtml(storeName)}</div>
          ${storeAddress ? `<div class="muted">${escapeHtml(storeAddress)}</div>` : ""}
          ${storePhone ? `<div class="muted">Tel: ${escapeHtml(storePhone)}</div>` : ""}
        </div>
        <div class="divider"></div>
        <div class="meta">Date: ${formattedDate} ${formattedTime}</div>
        <div class="meta">Order No.: #${String(order.id).padStart(3, "0")}</div>
        <div class="meta">Items: ${itemCount}</div>
        <div class="divider"></div>
        ${order.items
          .map(
            (item) => `
              <div class="row">
                <div class="qty">${item.quantity}</div>
                <div class="name">${escapeHtml(item.menuItem.name)}</div>
                <div class="price">${item.unitPrice.toFixed(2)} ${escapeHtml(currency)}</div>
              </div>
            `
          )
          .join("")}
        <div class="divider"></div>
        <div class="total">
          <div class="total-label">Total</div>
          <div class="total-value">${total.toFixed(2)} ${escapeHtml(currency)}</div>
        </div>
        <div class="divider"></div>
        <div class="center">Bon Appetit!</div>
      </body>
    </html>
  `;
}
