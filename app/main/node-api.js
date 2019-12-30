import fs from "fs"
import path from "path"
import util from "util"
import stream from "stream"
import { once } from "events"
import { ipcMain } from "electron"
import fetch from "node-fetch"
import keytar from "keytar"
import moment from "moment"
import { apiResult, login as loginAPI, getEnterprises } from "api"
import { getConfig, setConfig } from "config"
import msg from "messages"
const finished = util.promisify(stream.finished)

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

// return [session, err]
export async function loginWithSavedCredential() {
  const user = await getConfig("user")
  if (!user) {
    return [null, { message: msg.L_NotLoggedIn }]
  }
  const pass = await keytar.getPassword(SERVICE_NAME, user)
  const [result, err] = apiResult(await loginAPI(user, pass))
  if (!result || !result.login) {
    return [null, err || { message: msg.L_FailedLogin }]
  }
  return [result.sessionID, null]
}

let isSavingCanceled = false

function trimCommonFolderOfPaths(oriPaths) {
  // normalize input
  const paths = oriPaths.map((path) =>
    path[path.length - 1] !== "/" ? `${path}/` : path,
  )
  let i = 0
  let endOfSearch = false
  const commonPath = [null]
  while (!endOfSearch) {
    for (let j = 0; j < paths.length; j++) {
      const p = paths[j]
      if (i > p.length - 1) {
        endOfSearch = true
        if (j > 0) {
          commonPath.pop()
        }
        break
      }
      if (commonPath[commonPath.length - 1] === null) {
        commonPath[commonPath.length - 1] = p[i]
      } else if (commonPath[commonPath.length - 1] !== p[i]) {
        commonPath.pop()
        endOfSearch = true
        break
      }
    }
    if (!endOfSearch) {
      i++
      commonPath.push(null)
    }
  }
  if (commonPath[commonPath.length - 1] !== "/") {
    /* eslint-disable no-empty */
    while (commonPath.pop() !== "/") {}
  }
  const commonPathParts = commonPath.join("").split("/")
  if (!commonPathParts[commonPathParts.length - 1]) {
    commonPathParts.pop()
  }
  // pop one more because we do want to keep at leat 1 same parent
  commonPathParts.pop()
  const commonPathStr = commonPathParts.join("/")
  return paths.map((path) => path.replace(commonPathStr, ""))
}

async function savingFiles(files, savingPath, reportProgress) {
  reportProgress(0, msg.L_ProgressCreateFolder)
  const oriPaths = files.map((file) => file["file.path"])
  console.log(oriPaths)
  const paths = trimCommonFolderOfPaths(oriPaths)
  console.log(paths)
  try {
    // create paths
    for (let i = 0; i < files.length; i++) {
      if (isSavingCanceled) {
        return
      }
      const file = files[i]
      const p = paths[i]
      const pathToCreate = path.join(savingPath, p)
      file.absPath = path.join(pathToCreate, file["file.name"])
      await fs.promises.mkdir(pathToCreate, { recursive: true })
    }
    // prepare to download files
    const [sid, err] = await loginWithSavedCredential()
    if (err) {
      return reportProgress("error", err)
    }
    const host = await getConfig("server")
    const port = process.env.NODE_ENV === "development" ? ":8000" : ""
    const entKey = await getConfig("primaryEnt")
    const totalSize = files.reduce(
      (accumulator, value) => accumulator + parseInt(value["file.size"]),
      0,
    )
    let downloadedSize = 0
    // download files
    for (let file of files) {
      if (isSavingCanceled) {
        return
      }
      reportProgress(
        Math.round((downloadedSize / totalSize) * 100),
        msg.progressSavingFile(file["file.name"]),
      )
      const downloadRes = await fetch(
        `${host}${port}/download/${entKey}/${file["file.key"]}?downloadSource=true&version=-1`,
        {
          headers: {
            cookie: `sid=${sid}`,
          },
        },
      )
      const fileStream = fs.createWriteStream(file.absPath)
      for await (const chunk of downloadRes.body) {
        if (!fileStream.write(chunk)) {
          // handle back pressure
          await once(fileStream, "drain")
        }
        downloadedSize += chunk.length
        reportProgress(
          Math.round((downloadedSize / totalSize) * 100),
          msg.progressSavingFile(file["file.name"]),
        )
      }
      fileStream.end()
      await finished(fileStream)
    }
  } catch (e) {
    // NOTE: consider return detailed error info to FE
    return reportProgress("error")
  }
  reportProgress("done")
}

export async function startSavingFiles(win, files, targetPath) {
  isSavingCanceled = false
  const progressChannel = "savingFileProgress"
  const progressReporter = (progress, message) => {
    setImmediate(() => {
      win.webContents.send(progressChannel, { progress, message })
    })
  }
  if (!files || files.length === 0 || !targetPath) {
    progressReporter("done")
    return [null, null]
  }
  let error
  // create targetPath
  const targetFolder = msg.targetFolder(moment().format("YYYYMMDD-HHmmss"))
  const savingPath = path.join(targetPath, targetFolder)
  try {
    await fs.promises.mkdir(savingPath, { recursive: true })
  } catch (e) {
    error = {
      message: msg.L_FailedToCreateSavingTargetPath,
    }
  }
  // start saving files, we do not await but just let it report progress
  savingFiles(files, savingPath, progressReporter)
  return [targetFolder, error]
}

export function cancelOngoingSaving() {
  isSavingCanceled = true
}

export default function(win) {
  ipcMain.removeAllListeners()

  /* eslint-disable no-unused-vars */
  ipcMain.handle("login", async (_ /* events */, user, pass) => {
    return await login(user, pass)
  })

  ipcMain.handle("clearCredentials", async () => {
    await clearCredentials()
  })

  /* eslint-disable no-unused-vars */
  ipcMain.handle("startSavingFiles", async (
    _ /* events */,
    files,
    targetPath,
  ) => {
    return await startSavingFiles(win, files, targetPath)
  })

  ipcMain.handle("cancelOngoingSaving", cancelOngoingSaving)
}
