import fetch from "node-fetch"
import { ApolloClient } from "apollo-client"
import { InMemoryCache } from "apollo-cache-inmemory"
import { ApolloLink } from 'apollo-link'
import { HttpLink } from "apollo-link-http"
import gql from "graphql-tag"
import { getConfig, setConfig } from "config"
import errors, { getErrorByCode } from "errors"
// electron or nodejs module, exclued in bundle
import { ipcRenderer } from "electron"
import dgram from "dgram"
import { Buffer } from "buffer"

let client

const sessionLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(res => {
    const { response: { headers } } = operation.getContext()
    console.log(headers)
    return res
  })
})

function createClient(server) {
  client = null
  const cache = new InMemoryCache()
  const port = process.env.NODE_ENV === "development" ? 9000 : ""
  const link = sessionLink.concat(new HttpLink({
    uri: `${server}:${port}/graphql`,
    fetch,
  }))
  client = new ApolloClient({
    cache,
    link,
  })
}

async function assureClient() {
  if (!client) {
    const server = await getConfig("server")
    if (!server) {
      throw new Error(errors.ErrorNoServerFound.code)
    }
    createClient(server)
  }
}

function error(e) {
  return {
    type: "api_result",
    err: e,
  }
}

function data(d) {
  return {
    type: "api_result",
    data: d,
  }
}

async function execute(apiFn) {
  try {
    const result = await apiFn()
    return data(result.data || result)
  } catch (e) {
    return error(e)
  }
}

async function gqlQuery(gql, context) {
  return await execute(async () => {
    await assureClient()
    const sid = await ipcRenderer.invoke("getSavedSessionID")
    const headers = {}
    if (sid) {
      headers.Cookie = `sid=${sid}`
    }
    const ctx = Object.assign({ headers }, context)
    return await client.query({
      query: gql,
      context: ctx,
    })
  })
}

export function apiResult(apiResult) {
  let result, error
  if (apiResult && apiResult.type === "api_result") {
    if (apiResult.err) {
      const code = apiResult.err.message
      error = getErrorByCode(code)
    }
    result = apiResult.data
  }
  return [result, error]
}

export async function autoDiscoveryServer() {
  return execute(
    () =>
      new Promise((resolve, reject) => {
        const client = dgram.createSocket("udp4")
        const handleMessage = (payload, remote) => {
          const data = Buffer.from(payload).toString("utf8")
          if (data === "teamyi") {
            resolve({ server: remote.address })
          }
        }
        setTimeout(() => {
          client.off("message", handleMessage)
          reject(new Error(errors.ErrorNoServerFound))
        }, 10000)
        client.on("message", handleMessage)
        client.send(Buffer.from("ping"), 19613)
      }),
    true,
  )
}

export async function setServerAddress(protocol, server) {
  const serverAddress = `${protocol}${server}`
  await setConfig("server", serverAddress)
  createClient(serverAddress)
}

export async function resetServerAddress() {
  await setConfig("server", null)
  client = null
}

export async function getCurrentUser() {
  return await gqlQuery(
    gql`
      query {
        currentUser {
          id
        }
      }
    `,
  )
}

export async function getDeployInfo() {
  return await gqlQuery(
    gql`
      query {
        deployInfo {
          initialized
        }
      }
    `,
  )
}
