import { ipcMain } from "electron"
import keytar from "keytar"
import { apiResult, login as loginAPI } from "api"
import { setConfig } from "config"

const SERVICE_NAME = "teamyi-downloader"

async function clearCredentials() {
  const accts = await keytar.findCredentials(SERVICE_NAME)
  if (accts && accts.length > 0) {
    accts.forEach(async ({ account }) => {
      await keytar.deletePassword(SERVICE_NAME, account)
    })
  }
}

export async function login(user, pass) {
  const [result, err] = apiResult(await loginAPI(user, pass))
  if (result && result.login) {
    await setConfig("user", user)
    await keytar.setPassword(SERVICE_NAME, user, pass)
  }
  return [result, err]
}

export default function() {
  /* eslint-disable no-unused-vars */
  ipcMain.handle("login", async (_, user, pass) => {
    return await login(user, pass)
  })

  ipcMain.handle("clearCredentials", async () => {
    await clearCredentials()
  })
}
