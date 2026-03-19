const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  printReceipt: (options) => ipcRenderer.invoke("print-receipt", options),
  getPrinters: () => ipcRenderer.invoke("get-printers"),
  isElectron: true,
});
