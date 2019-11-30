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

export function getErrorByCode(code) {
  for (let value of Object.values(errors)) {
    if (value.code === code) {
      return value
    }
  }
  return null
}

export default errors
