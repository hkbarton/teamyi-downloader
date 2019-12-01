import React, { useState, useCallback } from "react"
import cls from "classnames"
import { Alert, Input, Button } from "antd"
import msg from "messages"
import { login } from "renderer/api"

import "renderer/styles/Login.less"

export default function(props) {
  const [userName, setUserName] = useState("")
  const [pass, setPass] = useState("")
  const [errMessage, setErrMessage] = useState(null)
  const [isLogingIn, setIsLogingIn] = useState(false)

  const handleInputUserName = (e) => {
    setUserName(e.target.value)
  }
  const handleInputPassword = (e) => {
    setPass(e.target.value)
  }
  const handleLogin = useCallback(
    async (e) => {
      setIsLogingIn(true)
      const name = userName.trim()
      const pw = pass.trim()
      // validate
      if (!name || !pw) {
        setIsLogingIn(false)
        setErrMessage(msg.T_InvalidAccount)
        return
      }
      /* eslint-disable no-unused-vars */
      const [_, err] = await login(name, pw)
      setIsLogingIn(false)
      if (err) {
        setErrMessage(err.message)
      } else {
        props.successState()
      }
    },
    [userName, pass],
  )

  return (
    <div className={cls("page", "login")}>
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
      <h1 className="page-title">{msg.HD_Login}</h1>
      <div className="page-line">
        <Input
          className="lo-input"
          size="large"
          addonBefore={msg.L_UserName}
          placeholder={msg.PH_UserName}
          value={userName}
          onChange={handleInputUserName}
          onPressEnter={handleLogin}
        />
      </div>
      <div className="page-line">
        <Input.Password
          className="lo-password"
          size="large"
          addonBefore={msg.L_Password}
          placeholder={msg.PH_Password}
          value={pass}
          onChange={handleInputPassword}
          onPressEnter={handleLogin}
        />
      </div>
      <div className="page-line">
        <Button
          className="lo-button"
          type="primary"
          loading={isLogingIn}
          onClick={handleLogin}
        >
          {msg.B_Login}
        </Button>
      </div>
    </div>
  )
}
