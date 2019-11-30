import { ipcMain } from "electron"
import keytar from "keytar"

const SERVICE_NAME = "teamyi-downloader"

export default function () {
  ipcMain.handle("getSavedSessionID", async () => {
    return await keytar.getPassword(SERVICE_NAME, "sid")
  })

  /*  */
  ipcMain.handle("setSavedSessionID", async (_, sid) => {
    await keytar.setPassword(SERVICE_NAME, "sid", sid)
  })
}
