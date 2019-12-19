import fetch from "node-fetch"
import { ApolloClient } from "apollo-client"
import { ApolloLink } from "apollo-link"
import { InMemoryCache } from "apollo-cache-inmemory"
import { HttpLink } from "apollo-link-http"
import gql from "graphql-tag"
import { getConfig, setConfig } from "config"
import errors, { getError } from "errors"
// electron or nodejs module, exclued in bundle if used in renderer
import dgram from "dgram"
import { Buffer } from "buffer"

let client

const sessionLink = new ApolloLink((operation, forward) => {
  return forward(operation).map((res) => {
    const {
      response: { headers },
    } = operation.getContext()
    const cookie = headers.get("set-cookie")
    if (cookie) {
      const sidMatch = cookie.match(/sid=([^;]+);/)
      if (sidMatch && sidMatch.length > 1) {
        res.data = { ...res.data, sessionID: sidMatch[1] }
      }
    }
    return res
  })
})

function createClient(server) {
  client = null
  const cache = new InMemoryCache()
  const port = process.env.NODE_ENV === "development" ? 9000 : ""
  const link = sessionLink.concat(
    new HttpLink({
      uri: `${server}:${port}/graphql`,
      fetch,
    }),
  )
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

async function gqlQuery(query, options) {
  return await execute(async () => {
    await assureClient()
    return await client.query({ ...options, query })
  })
}

async function gqlMutate(mutation, options) {
  return await execute(async () => {
    await assureClient()
    return await client.mutate({ ...options, mutation })
  })
}

export function apiResult(apiResult) {
  let result, error
  if (apiResult && apiResult.type === "api_result") {
    result = apiResult.data
    error = getError(apiResult.err)
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
  )
}

export async function setServerAddress(protocol, server) {
  const serverAddress = `${protocol}${server}`
  await setConfig({ server: serverAddress })
  createClient(serverAddress)
}

export async function resetServerAddress() {
  await setConfig({ server: null })
  client = null
}

export async function getQueryProfiles() {
  return execute(async () => {
    const profiles = await getConfig("profiles")
    return profiles || []
  })
}

export async function saveQueryProfiles(profiles) {
  await setConfig({ profiles })
}

export async function getCurrentUser(context) {
  return await gqlQuery(
    gql`
      query {
        currentUser {
          id
        }
      }
    `,
    {
      fetchPolicy: "network-only",
      context,
    },
  )
}

export async function getEnterprises(context) {
  return await gqlQuery(
    gql`
      query {
        enterprises {
          key
        }
      }
    `,
    {
      fetchPolicy: "network-only",
      context,
    },
  )
}

export async function getDeployInfo(context) {
  return await gqlQuery(
    gql`
      query {
        deployInfo {
          initialized
        }
      }
    `,
    { context },
  )
}

export async function login(user, pass, context) {
  return await gqlMutate(
    gql`
      mutation {
        login(user:"${user}", password:"${pass}") {
          id
        }
      }
    `,
    { context },
  )
}

export async function getMDTemplates(context) {
  const ent = await getConfig("primaryEnt")
  return await gqlQuery(
    gql`
    query {
      allMDTemplates(entKey:"${ent}"){
        key,
        name,
        fields {
            key,
            name,
            type,
            typeData,
          }
        }
      }
    `,
    { context },
  )
}

export async function queryFiles(queryProfile, context) {
  const entKey = await getConfig("primaryEnt")
  const input = {
    dataSource: "METADATA",
    dataSourceArgs: `"${queryProfile.mdTemplate}"`,
    type: "TABLE",
    fields: ["file.name", "file.size", "file.timestamp"],
    pageSize: 1000,
    sortBy: "",
  }
  let filters = []
  const parseConditionValue = (cond) => {
    switch (cond.valueType) {
      case "TEXT":
      case "SINGLE":
        return `"${cond.value}"`
      case "NUMBER":
      case "DATE":
      case "TIME":
      case "DATETIME":
        return `${cond.value}`
      case "MULTI":
        return `["${cond.value.join('","')}"]`
      default:
        return `"${cond.value}"`
    }
  }
  for (let cond of queryProfile.conditions) {
    filters.push(`${cond.mdFieldKey} ${cond.op} ${parseConditionValue(cond)}`)
  }
  input.filter = filters.join(" AND ")
  const result = await gqlQuery(
    gql`
      query dataViewPreviewData($entKey: ID!, $input: DataViewPreviewInput!) {
        dataViewPreviewData(entKey: $entKey, input: $input, page: 1) {
          data
        }
      }
    `,
    {
      fetchPolicy: "network-only",
      variables: {
        entKey,
        input,
      },
      context,
    },
  )
  if (result.data && result.data.dataViewPreviewData) {
    const files = JSON.parse(result.data.dataViewPreviewData.data)
    const fileKeys = files.map((file) => file["file.key"])
    const filePathQuery = await gqlQuery(
      gql`
        query filePaths($entKey: String!, $fileKeys: [String!]!) {
          filePaths(entKey: $entKey, fileKeys: $fileKeys) {
            key
            path
          }
        }
      `,
      {
        fetchPolicy: "network-only",
        variables: {
          entKey,
          fileKeys,
        },
        context,
      },
    )
    if (filePathQuery.data && filePathQuery.data.filePaths) {
      const filePaths = filePathQuery.data.filePaths
      const pathsByKey = {}
      for (let filePath of filePaths) {
        pathsByKey[filePath.key] = filePath.path
      }
      for (let file of files) {
        file["file.path"] = pathsByKey[file["file.key"]]
      }
    }
    result.data = files
  }
  return result
}
