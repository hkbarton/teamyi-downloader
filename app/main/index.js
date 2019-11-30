import { app, BrowserWindow } from "electron"
import initCredentialManager from "main/credential-mgr"

let win

initCredentialManager()

function createMainWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  win.loadFile("dist/renderer/index.html")

  win.on("closed", () => {
    win = null
  })

  if (process.env.NODE_ENV === "development") {
    win.webContents.openDevTools()
  }
}

app.on("ready", createMainWindow)

app.on("window-all-closed", () => {
  app.quit()
})

app.on("activate", () => {
  if (!win) {
    createMainWindow()
  }
})
