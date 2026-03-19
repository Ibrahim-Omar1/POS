const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  printReceipt: (options) => ipcRenderer.invoke("print-receipt", options),
  printReceiptHtml: (options) => ipcRenderer.invoke("print-receipt-html", options),
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  isElectron: true,
});
