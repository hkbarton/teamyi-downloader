import React, { useState, useEffect } from "react"
import { apiResult, getCurrentUser } from "api"
import errors from "errors"
import ServerDiscovery from "renderer/comps/pages/ServerDiscovery"
import Login from "renderer/comps/pages/Login"
import Main from "renderer/comps/pages/Main"
import LoadingIndicator from "renderer/comps/LoadingIndicator"

import "renderer/styles/Application.less"

const AppState = {
  INITING: -1,
  NO_SERVER: 0,
  NO_USER: 1,
  READY: 2,
}

export default function(props) {
  const [appState, setAppState] = useState(AppState.INITING)
  const [userID, setUserID] = useState(null)
  useEffect(() => {
    ;(async function() {
      const [result, err] = apiResult(await getCurrentUser())
      if (err && err.code === errors.ErrorNoServerFound.code) {
        setAppState(AppState.NO_SERVER)
      } else if (!result || !result.currentUser) {
        setAppState(AppState.NO_USER)
      } else {
        setUserID(result.currentUser.id)
        setAppState(AppState.READY)
      }
    })()
  })

  function renderByState() {
    switch (appState) {
      case AppState.NO_SERVER:
        return (
          <ServerDiscovery successState={() => setAppState(AppState.INITING)} />
        )
      case AppState.NO_USER:
        return <Login successState={() => setAppState(AppState.INITING)} />
      case AppState.READY:
        return <Main userID={userID} />
      default:
        return <LoadingIndicator width={32} height={32} />
    }
  }

  return <div className="app-container">{renderByState()}</div>
}
