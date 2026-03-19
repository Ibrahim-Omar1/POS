const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

let mainWindow = null;

const isDev = process.env.NODE_ENV === "development";
const port = process.env.PORT || 3000;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    autoHideMenuBar: true,
    titleBarStyle: "default",
    icon: path.join(__dirname, "../public/icon.png"),
  });

  const url = isDev
    ? `http://localhost:${port}`
    : `file://${path.join(__dirname, "../out/index.html")}`;

  mainWindow.loadURL(url);

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// IPC Handler for printing
ipcMain.handle("print-receipt", async (event, options) => {
  try {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.webContents.print(
        {
          silent: options?.silent ?? false,
          printBackground: true,
          pageSize: {
            width: 80000, // 80mm in microns
            height: 297000, // A4 height, will be trimmed
          },
          margins: {
            marginType: "none",
          },
        },
        (success, errorType) => {
          if (!success) {
            console.error("Print failed:", errorType);
          }
        }
      );
      return { success: true };
    }
    return { success: false, error: "No window found" };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// IPC Handler to get available printers
ipcMain.handle("get-printers", async () => {
  try {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      const printers = await win.webContents.getPrintersAsync();
      return printers;
    }
    return [];
  } catch (error) {
    console.error("Error getting printers:", error);
    return [];
  }
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
