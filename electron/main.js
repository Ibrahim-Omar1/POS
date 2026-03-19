const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { spawn } = require("child_process");
const net = require("net");
const path = require("path");
const fs = require("fs");

let mainWindow = null;
let nextServer = null;

const isDev = process.env.NODE_ENV === "development";
const port = process.env.PORT || 3000;
const projectRoot = path.join(__dirname, "..");

function logPrintDebug(message, extra) {
  const timestamp = new Date().toISOString();
  if (extra !== undefined) {
    console.log(`[PrintDebug ${timestamp}] ${message}`, extra);
    return;
  }
  console.log(`[PrintDebug ${timestamp}] ${message}`);
}

function printWebContents(webContents, options = {}) {
  return new Promise((resolve) => {
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(result);
    };

    const timeoutId = setTimeout(() => {
      logPrintDebug("webContents.print() timed out waiting for callback");
      finish({
        success: false,
        error: "Electron print timed out before returning a result",
      });
    }, 10000);

    logPrintDebug("Calling webContents.print()", options);
    webContents.print(
      {
        silent: options.silent ?? false,
        printBackground: true,
        margins: { marginType: "none" },
      },
      (success, failureReason) => {
        logPrintDebug("webContents.print() callback fired", {
          success,
          failureReason: failureReason || null,
        });

        if (!success) {
          console.error("Print failed:", failureReason);
          finish({
            success: false,
            error: failureReason || "Electron print failed",
          });
          return;
        }

        finish({ success: true });
      }
    );
  });
}

function showError(title, message) {
  dialog.showErrorBox(title, message);
  app.quit();
}

function waitForServer(port, callback, retries = 40) {
  const client = net.connect({ port }, () => {
    client.destroy();
    callback();
  });
  client.on("error", () => {
    if (retries <= 0) {
      showError(
        "Startup Failed",
        `Next.js server failed to start on port ${port}.\n\nProject root: ${projectRoot}`
      );
      return;
    }
    setTimeout(() => waitForServer(port, callback, retries - 1), 500);
  });
}

function getNodeBinary() {
  const electronDir = path.dirname(process.execPath);
  const candidates = [
    path.join(electronDir, "node.exe"),
    path.join(electronDir, "resources", "node.exe"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return "node";
}

function ensureDatabase() {
  // Copy dev.db to userData on first run so it's writable
  // (installed apps in Program Files are read-only)
  const userDataDir = app.getPath("userData");
  const userDbPath = path.join(userDataDir, "dev.db");
  const bundledDbPath = path.join(projectRoot, "prisma", "dev.db");

  if (!fs.existsSync(userDbPath)) {
    if (fs.existsSync(bundledDbPath)) {
      fs.mkdirSync(userDataDir, { recursive: true });
      fs.copyFileSync(bundledDbPath, userDbPath);
      console.log(`[DB] Copied database to: ${userDbPath}`);
    } else {
      console.warn(`[DB] Bundled database not found at: ${bundledDbPath}`);
    }
  }

  return userDbPath;
}

function startNextServer(dbPath) {
  return new Promise((resolve, reject) => {
    const nextBin = path.join(
      projectRoot,
      "node_modules",
      "next",
      "dist",
      "bin",
      "next"
    );

    if (!fs.existsSync(nextBin)) {
      showError("Missing Dependency", `Cannot find Next.js at:\n${nextBin}`);
      reject(new Error("next binary not found"));
      return;
    }

    const nodeBin = getNodeBinary();

    nextServer = spawn(nodeBin, [nextBin, "start", "--port", String(port)], {
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: "production",
        FORCE_COLOR: "0",
        DATABASE_URL: `file:${dbPath}`,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (nextServer.stdout) {
      nextServer.stdout.on("data", (data) => {
        try { process.stdout.write(`[Next] ${data}`); } catch {}
      });
    }
    if (nextServer.stderr) {
      nextServer.stderr.on("data", (data) => {
        try { process.stderr.write(`[Next] ${data}`); } catch {}
      });
    }

    nextServer.on("error", (err) => {
      showError(
        "Server Error",
        `Failed to start Next.js:\n${err.message}\n\nNode binary: ${nodeBin}\nProject root: ${projectRoot}`
      );
      reject(err);
    });

    nextServer.on("exit", (code) => {
      if (code !== 0 && code !== null) {
        showError(
          "Server Crashed",
          `Next.js exited with code ${code}.\n\nNode: ${nodeBin}\nRoot: ${projectRoot}\nDB: ${dbPath}`
        );
      }
    });

    waitForServer(port, resolve);
  });
}

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
    icon: path.join(projectRoot, "public", "icon.ico"),
  });

  mainWindow.loadURL(`http://localhost:${port}`);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

ipcMain.handle("print-receipt", async (event, options) => {
  try {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);

    logPrintDebug("Received print-receipt IPC", {
      options,
      url: webContents.getURL(),
      title: webContents.getTitle(),
      isDestroyed: webContents.isDestroyed(),
      isLoading: webContents.isLoading(),
      isLoadingMainFrame: webContents.isLoadingMainFrame(),
      windowId: win?.id ?? null,
    });

    if (!win || webContents.isDestroyed()) {
      logPrintDebug("Cannot print because no active receipt window was found");
      return { success: false, error: "No active receipt window found" };
    }

    try {
      const printers = await webContents.getPrintersAsync();
      logPrintDebug(
        `Available printers: ${printers.length}`,
        printers.map((printer) => ({
          name: printer.name,
          displayName: printer.displayName,
          isDefault: printer.isDefault,
          status: printer.status,
        }))
      );
    } catch (printerError) {
      logPrintDebug("Failed to load printer list", String(printerError));
    }

    return await printWebContents(webContents, {
      silent: options?.silent ?? false,
      source: "sender",
    });
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle("print-receipt-html", async (_event, options) => {
  let printWindow = null;
  let shouldClosePrintWindow = false;

  try {
    if (!options?.html) {
      return { success: false, error: "No receipt HTML was provided" };
    }

    printWindow = new BrowserWindow({
      show: Boolean(options?.silent) === false,
      width: 420,
      height: 900,
      autoHideMenuBar: true,
      webPreferences: {
        sandbox: false,
      },
    });

    const title = options.title || "Receipt";
    const html = options.html;

    logPrintDebug("Creating hidden print window", { title });

    printWindow.webContents.on("did-start-loading", () => {
      logPrintDebug("Hidden print window started loading");
    });
    printWindow.webContents.on("did-stop-loading", () => {
      logPrintDebug("Hidden print window stopped loading");
    });
    printWindow.webContents.on(
      "did-fail-load",
      (_event, errorCode, errorDescription) => {
        logPrintDebug("Hidden print window failed to load", {
          errorCode,
          errorDescription,
        });
      }
    );
    printWindow.webContents.on("dom-ready", () => {
      logPrintDebug("Hidden print window DOM ready");
    });
    printWindow.on("ready-to-show", () => {
      logPrintDebug("Hidden print window ready-to-show");
    });

    await printWindow.loadURL(
      `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
    );

    if (!options?.silent) {
      printWindow.show();
      printWindow.focus();
      logPrintDebug("Hidden print window shown for interactive printing");
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    if (options?.silent) {
      return await printWebContents(printWindow.webContents, {
        silent: true,
        source: "hidden-window",
        title,
      });
    }

    logPrintDebug("Calling renderer window.print() inside hidden print window");

    const rendererPrintResult = await printWindow.webContents.executeJavaScript(`
      new Promise((resolve) => {
        let done = false;

        const finish = (value) => {
          if (done) return;
          done = true;
          resolve(value);
        };

        window.addEventListener("afterprint", () => finish("afterprint"), { once: true });
        setTimeout(() => {
          try {
            window.print();
          } catch (error) {
            finish("print-error:" + String(error));
          }
        }, 100);

        setTimeout(() => finish("afterprint-timeout"), 60000);
      });
    `);

    logPrintDebug("Renderer print script finished", { rendererPrintResult });

    shouldClosePrintWindow = true;
    return { success: true };
  } catch (error) {
    logPrintDebug("Hidden print window failed", String(error));
    return { success: false, error: String(error) };
  } finally {
    if (shouldClosePrintWindow && printWindow && !printWindow.isDestroyed()) {
      logPrintDebug("Closing hidden print window");
      printWindow.close();
    }
  }
});

ipcMain.handle("get-printers", async (event) => {
  try {
    const webContents = event.sender;
    if (!webContents.isDestroyed()) {
      const printers = await webContents.getPrintersAsync();
      logPrintDebug(
        `get-printers returned ${printers.length} printer(s)`,
        printers.map((printer) => ({
          name: printer.name,
          displayName: printer.displayName,
          isDefault: printer.isDefault,
          status: printer.status,
        }))
      );
      return printers;
    }
    return [];
  } catch (error) {
    console.error("Error getting printers:", error);
    return [];
  }
});

app.whenReady().then(async () => {
  if (isDev) {
    createWindow();
  } else {
    try {
      const dbPath = ensureDatabase();
      await startNextServer(dbPath);
      createWindow();
    } catch (err) {
      console.error("Failed to start:", err);
    }
  }
});

app.on("window-all-closed", () => {
  if (nextServer) {
    nextServer.kill();
    nextServer = null;
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
