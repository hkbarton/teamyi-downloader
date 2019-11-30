import React, { useState, useEffect, useRef, useCallback } from "react"
import cls from "classnames"
import { Alert, Input, Select, Button } from "antd"
import msg from "messages"
import {
  apiResult,
  autoDiscoveryServer,
  getDeployInfo,
  setServerAddress,
  resetServerAddress,
} from "api"
import LoadingIndicator from "renderer/comps/p/LoadingIndicator"

import "renderer/styles/ServerDiscovery.less"

const { Option } = Select

function validateServer(server) {
  return /^[\d\w_-]+(\.[\d\w_-]+)*$/.test(server)
}

export default function (props) {
  const serverIPRef = useRef(null)
  const [server, setServer] = useState(null)
  const [protocol, setProtocol] = useState(null)
  useEffect(() => {
    if (server === null) {
      ; (async function () {
        setProtocol("http://")
        const [result] = apiResult(await autoDiscoveryServer())
        if (result && result.server) {
          setServer(result.server)
        } else {
          setServer(msg.INP_NoServer)
          serverIPRef.current.select()
        }
      })()
    }
  }, [server])

  const handleServerIPChange = (e) => {
    setServer(e.target.value)
  }
  const handleProtocolChange = (v) => {
    setProtocol(v)
  }

  const [isButtonLoading, setButtonLoading] = useState(false)
  const [errMessage, setErrMessage] = useState(null)
  const handleButtonClick = useCallback(async () => {
    const { successState } = props
    setButtonLoading(true)
    await setServerAddress(protocol, server)
    const [result] = apiResult(await getDeployInfo())
    setButtonLoading(false)
    if (result && result.deployInfo.initialized) {
      successState()
    } else {
      await resetServerAddress()
      setErrMessage(msg.T_ServerConnectFail)
    }
  }, [protocol, server])

  const inputLoadingIndicator = <LoadingIndicator className="sd-loading" />
  const protocolSelector = (
    <Select
      className="sd-protocol"
      defaultValue="http://"
      disabled={protocol === null || server === null}
      onChange={handleProtocolChange}
    >
      <Option value="http://">http://</Option>
      <Option value="https://">https://</Option>
    </Select>
  )
  return (
    <div className={cls("page server-discovery")}>
      {errMessage ? (
        <Alert
          type="error"
          message={errMessage}
          className="page-error-tip"
          showIcon
          closable
          afterClose={() => setErrMessage(null)}
        />
      ) : null}
      <h1 className="page-title">{msg.HD_ServerConfig}</h1>
      <div className="page-line">
        <Input
          className="sd-server-ip"
          addonBefore={protocolSelector}
          addonAfter={server === null ? inputLoadingIndicator : null}
          size="large"
          value={server}
          placeholder={
            server === null ? msg.PH_LookingServer : msg.PH_InputServer
          }
          disabled={server === null}
          onChange={handleServerIPChange}
          ref={serverIPRef}
        />
        {server !== null ? (
          <Button
            className="sd-button"
            type="primary"
            loading={isButtonLoading}
            disabled={!validateServer(server)}
            onClick={handleButtonClick}
          >
            {msg.B_ConnectServer}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
