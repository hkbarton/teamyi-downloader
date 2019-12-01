import { ApolloError } from "apollo-client"

const errors = {
  ErrorNoServerFound: {
    code: "err_no_server_found",
    message: "没有发现可供使用的服务",
  },
  ErrorDisconnectFromServer: {
    code: "err_disconnect_from_server",
    message: "服务器连接失败",
  },
}

export function getError(err) {
  if (!err) {
    return null
  }
  const code = err.message
  for (let value of Object.values(errors)) {
    if (value.code === code) {
      return value
    }
  }
  return {
    code: err instanceof ApolloError ? "gql_error" : "other_err",
    message: err.message.replace("GraphQL error:", "").trim(),
  }
}

export default errors
