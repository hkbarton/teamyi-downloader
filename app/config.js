import { app, remote } from "electron"
import { promises as fs } from "fs"
import path from "path"

const CONFIG_FILE = "config.json"

let config

async function init() {
  if (!config) {
    try {
      const electronApp = app || remote.app
      const configPath = path.join(electronApp.getPath("userData"), CONFIG_FILE)
      const configFileContent = await fs.readFile(configPath, {
        encoding: "utf8",
      })
      config = JSON.parse(configFileContent)
    } catch {
      config = {}
    }
  }
}

async function saveConfig() {
  const electronApp = app || remote.app
  const configPath = path.join(electronApp.getPath("userData"), CONFIG_FILE)
  await fs.writeFile(configPath, JSON.stringify(config), { encoding: "utf8" })
}

export async function getConfig(key) {
  await init()
  return config[key]
}

export async function setConfig(fields) {
  config = { ...config, ...fields }
  await saveConfig()
}
