export interface ElectronAPI {
  printReceipt: (options?: { silent?: boolean }) => Promise<{ success: boolean; error?: string }>;
  getPrinters: () => Promise<Electron.PrinterInfo[]>;
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
