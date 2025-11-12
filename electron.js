// --------------------------------------------------------------
// Electron main process with robust debug logging + loading screen + DevTools toggle
// --------------------------------------------------------------

import { app, BrowserWindow, Menu, ipcMain, Notification, Tray } from "electron";

import os from "os";
import { networkInterfaces } from "os";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Set correct app identity BEFORE creating any windows or notifications
app.setName("PandaPostage-Desktop");
app.setAppUserModelId("PandaPostage-Desktop");

let mainWindow;
let tray; // tray reference must persist

// --------------------------------------------------------------
// Helper: create main window
// --------------------------------------------------------------
function createWindow() {
  console.log("🚀 Electron starting in", process.env.NODE_ENV || "production");

  const isDev = process.env.NODE_ENV === "development";

  mainWindow = new BrowserWindow({
    width: 1300,
    height: 960,
    minWidth: 500,
    minHeight: 400,
    backgroundColor: "#13406c",
    icon: path.join(__dirname, "assets", "panda-icon.png"), // 🧩 Window/taskbar icon
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: false,
      devTools: true, // allow DevTools toggle again
    },
  });

  // ------------------------------------------------------------
  // 🧭 Show title bar + menu
  // ------------------------------------------------------------
  mainWindow.setMenuBarVisibility(true);
  mainWindow.setAutoHideMenuBar(false);

  // ------------------------------------------------------------
  // Show a temporary loading screen before content loads
  // ------------------------------------------------------------
  const loadingHTML = `
    <html>
      <head>
        <title>PandaPostage</title>
        <style>
          body {
            margin: 0;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #13406c;
            font-family: sans-serif;
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #0078d4;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
      </body>
    </html>`;
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(loadingHTML)}`);

  mainWindow.webContents.on("did-start-loading", () => {
    console.log("🌀 BrowserWindow started loading...");
  });

  mainWindow.webContents.on("did-finish-load", () => {
    console.log("✅ Finished loading:", mainWindow.webContents.getURL());
  });

  // automatically sync with whatever <title> React sets
  mainWindow.webContents.on("page-title-updated", (event, title) => {
    event.preventDefault();
    //mainWindow.setTitle(title || "PandaPostage");
    console.log(`🪶 Window title updated: ${title}`);
  });

  // ------------------------------------------------------------
  // Debug events
  // ------------------------------------------------------------
  mainWindow.webContents.on("did-fail-load", (e, code, desc, url) => {
    console.error("❌ Failed to load:", url, code, desc);
    mainWindow.loadURL(`data:text/html,<h1>Failed to load: ${desc}</h1>`);
  });

  mainWindow.webContents.on("crashed", () => {
    console.error("💥 Renderer process crashed!");
  });

  mainWindow.webContents.on("render-process-gone", (e, details) => {
    console.error("⚠️ Render process gone:", details);
  });

  // ------------------------------------------------------------
  // Load appropriate content after loading screen
  // ------------------------------------------------------------
  const loadAppContent = () => {
    if (isDev) {
      const devURL = "http://localhost:5173";
      console.log("⚡ Development mode: loading Vite server", devURL);

      const tryLoad = async (attempt = 1) => {
        try {
          await fetch(devURL);
          console.log("✅ Vite dev server detected, loading...");
          mainWindow.loadURL(devURL);
        } catch {
          if (attempt < 10) {
            console.log(`⏳ Waiting for Vite dev server (attempt ${attempt})...`);
            setTimeout(() => tryLoad(attempt + 1), 1000);
          } else {
            console.error("❌ Vite dev server not reachable after 10s.");
            mainWindow.loadURL("data:text/html,<h1>Vite dev server not found</h1>");
          }
        }
      };
      tryLoad();
    } else {
      const candidates = [
        path.join(__dirname, "dist", "public", "index.html"),
        path.join(__dirname, "dist", "index.html"),
        path.join(__dirname, "client", "dist", "public", "index.html"),
        path.join(__dirname, "client", "dist", "index.html"),
      ];

      const existing = candidates.find((f) => fs.existsSync(f));

      if (!existing) {
        console.error("❌ Could not locate built index.html in any of:", candidates);
        mainWindow.loadURL("data:text/html,<h1>index.html not found</h1>");
      } else {
        console.log("✅ Production mode: loading", existing);
        mainWindow.loadFile(existing);
      }
    }
  };

  // Native OS notification with host information
  const showTestNotification = () => {
    try {
      const nets = networkInterfaces();
      let ip = "Unknown";

      for (const name of Object.keys(nets)) {
        for (const net of nets[name] || []) {
          if (net.family === "IPv4" && !net.internal) {
            ip = net.address;
            break;
          }
        }
      }

      // Get readable OS name + version
      const platform = os.platform();
      let osName = platform;
      switch (platform) {
        case "win32":
          osName = "Windows";
          break;
        case "darwin":
          osName = "macOS";
          break;
        case "linux":
          osName = "Linux";
          break;
      }

      const osVersion = os.release();

      const info = {
        Hostname: os.hostname(),
        User: os.userInfo().username,
        OS: `${osName} ${osVersion}`,
        Arch: os.arch(),
        IP: ip,
      };

      console.log("💻 Machine Info:", info);

      new Notification({
        title: "Machine Info",
        body:
          `Host: ${info.Hostname}\n` +
          `User: ${info.User}\n` +
          `OS: ${info.OS} (${info.Arch})\n` //+
          //`IP: ${info.IP}`,
      }).show();
    } catch (err) {
      console.error("❌ Failed to get system info:", err);
      new Notification({
        title: "Error",
        body: "Could not retrieve system information.",
      }).show();
    }
  }

  // Delay slightly so spinner is visible
  setTimeout(loadAppContent, 500);

  // ------------------------------------------------------------
  // Fallback safety
  // ------------------------------------------------------------
  setTimeout(() => {
    if (!mainWindow.webContents.getURL()) {
      console.warn("⚠️ Window appears blank, forcing fallback message...");
      mainWindow.loadURL("data:text/html,<h1>Renderer did not load</h1>");
    }
  }, 15000);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

// ------------------------------------------------------------
// 🧩 Application Menu (includes Always on Top + DevTools + Notifications + System Info)
// ------------------------------------------------------------
const menuTemplate = [
  {
    label: "Tools",
    submenu: [
      {
        label: "Show Test Notification",
        click: showTestNotification,
      },
      { type: "separator" },
      {
        label: "Always on Top",
        type: "checkbox",
        checked: false,
        click: (menuItem) => {
          const newState = !mainWindow.isAlwaysOnTop();
          mainWindow.setAlwaysOnTop(newState);
          menuItem.checked = newState;
          console.log(`📌 Always on top: ${newState}`);
        },
      },
      { type: "separator" },
      {
        label: "Reload",
        accelerator: "CmdOrCtrl+R",
        click: () => mainWindow.reload(),
      },
      {
        label: "Toggle DevTools",
        accelerator: "CmdOrCtrl+Shift+I",
        click: () => {
          console.log("🛠️ Toggling DevTools");
          if (mainWindow.webContents.isDevToolsOpened()) {
            mainWindow.webContents.closeDevTools();
          } else {
            mainWindow.webContents.openDevTools({ mode: "detach" });
          }
        },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

  // ------------------------------------------------------------
  // IPC hook — optional frontend toggle
  // ------------------------------------------------------------
  ipcMain.on("toggle-always-on-top", () => {
    if (!mainWindow) return;
    const newState = !mainWindow.isAlwaysOnTop();
    mainWindow.setAlwaysOnTop(newState);
    console.log(`📌 Always on top toggled via IPC: ${newState}`);
  });
}

// --------------------------------------------------------------
// App lifecycle
// --------------------------------------------------------------
app.whenReady().then(() => {
  createWindow();

  // ✅ macOS: Set dock icon once the app is ready
  if (process.platform === "darwin") {
    app.dock.setIcon(path.join(__dirname, "assets", "panda-icon.png"));
  }

  // ------------------------------------------------------------
  // 🪟 Show native notification
  // ------------------------------------------------------------
  const notif = new Notification({
    title: "PandaPostage",
    body: "PandaPostage Desktop App is Running",
  });
  notif.show();

  // ------------------------------------------------------------
  // 🧊 Create system tray icon (only once)
  // ------------------------------------------------------------
  const trayIcon = path.join(__dirname, "assets", "panda-icon.png");

  if (!fs.existsSync(trayIcon)) {
    console.error("❌ Tray icon not found:", trayIcon);
  } else {
    tray = new Tray(trayIcon);
    tray.setToolTip("PandaPostage");

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show App",
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: "Always on Top",
        type: "checkbox",
        checked: mainWindow?.isAlwaysOnTop() ?? false,
        click: (menuItem) => {
          const newState = !mainWindow.isAlwaysOnTop();
          mainWindow.setAlwaysOnTop(newState);
          menuItem.checked = newState;
        },
      },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() },
    ]);

    tray.setContextMenu(contextMenu);
    console.log("✅ Tray icon initialized:", trayIcon);
  }
});

app.on("window-all-closed", () => {
  console.log("🧹 All windows closed");
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});

// --------------------------------------------------------------
// Extra debug hooks
// --------------------------------------------------------------
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught exception in main process:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("💥 Unhandled promise rejection:", reason);
});
