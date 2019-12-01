// API which specificlly designed for renderer.
// For other common API, use app/api
import { ipcRenderer } from "electron"
import { apiResult, login as loginAPI } from "api"

export async function login(user, pass) {
  let [result, err] = apiResult(await loginAPI(user, pass))
  if (result && result.login) {
    // if we logged in, call node-api's login, in order to save user and pass into keychain
    /* eslint-disable no-unused-vars */
    const [_, nodeErr] = await ipcRenderer.invoke("login", user, pass)
    err = nodeErr
  } else {
    await ipcRenderer.invoke("clearCredentials")
  }
  return [result, err]
}
