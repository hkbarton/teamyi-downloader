import { app, BrowserWindow } from "electron"
import initNodeAPI from "main/node-api"

let win

initNodeAPI()

function createMainWindow() {
  let winWidth = 1220
  let winHeight = 800

  if (process.env.NODE_ENV === "development") {
    winWidth = 1300
    winHeight = 1000
  }

  win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
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
