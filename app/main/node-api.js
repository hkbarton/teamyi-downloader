import { ipcMain } from "electron"
import keytar from "keytar"
import { apiResult, login as loginAPI, getEnterprises } from "api"
import { setConfig } from "config"

const SERVICE_NAME = "teamyi-downloader"

async function clearCredentials() {
  const accts = await keytar.findCredentials(SERVICE_NAME)
  if (accts && accts.length > 0) {
    accts.forEach(async ({ account }) => {
      await keytar.deletePassword(SERVICE_NAME, account)
    })
  }
  await setConfig({ user: null, primaryEnt: null })
}

export async function login(user, pass) {
  const [result, err] = apiResult(await loginAPI(user, pass))
  if (result && result.login) {
    const persistConfig = { user }
    const [entsResult] = apiResult(
      await getEnterprises({
        headers: {
          cookie: `sid=${result.sessionID}`,
        },
      }),
    )
    if (
      entsResult &&
      entsResult.enterprises &&
      entsResult.enterprises.length > 0
    ) {
      persistConfig.primaryEnt = entsResult.enterprises[0].key
    }
    await setConfig(persistConfig)
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
