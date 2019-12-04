import React, { useState, useEffect } from "react"
import cls from "classnames"
import { Alert, Card, Select, Button, Divider, Empty } from "antd"
import { apiResult, getMDTemplates, getQueryProfiles } from "api"
import msg from "messages"

import "renderer/styles/Main.less"

const { Option } = Select

function useMetadataTemplates(userID, errSetter) {
  const defaultTemplate = {
    key: -1,
    name: msg.L_NoMDTemplate,
  }
  const [isLoadingMDTemplates, setIsLoadingTemplates] = useState(false)
  const [mdTemplates, setMDTemplates] = useState([])

  useEffect(() => {
    ;(async () => {
      setIsLoadingTemplates(true)
      const [result, err] = apiResult(await getMDTemplates())
      setIsLoadingTemplates(false)
      if (err) {
        errSetter(err.message)
        return
      }
      const temps =
        result.allMDTemplates.length > 0
          ? result.allMDTemplates
          : [defaultTemplate]
      setMDTemplates(temps)
    })()
  }, [userID])

  return [isLoadingMDTemplates, mdTemplates]
}

function useProfiles(userID, errSetter) {
  const defaultProfile = {
    key: -1,
    name: msg.L_NewQuery,
    mdTemplate: null,
    conditions: [],
  }
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false)
  const [profiles, setProfiles] = useState([defaultProfile])
  const [selectedProfile, setSelectedProfile] = useState(defaultProfile.key)

  useEffect(() => {
    ;(async () => {
      setIsLoadingProfiles(true)
      const [result] = apiResult(await getQueryProfiles())
      if (result.length < 1) {
        result.push(defaultProfile)
      }
      setProfiles(result)
      setIsLoadingProfiles(false)
    })()
  }, [userID])

  return [isLoadingProfiles, profiles, selectedProfile, setSelectedProfile]
}

function profileByKey(profiles, key) {
  return profiles.find((profile) => profile.key === key)
}

export default function(props) {
  const [errMessage, setErrMessage] = useState(null)
  const [isLoadingMDTemplates, mdTemplates] = useMetadataTemplates(
    props.userID,
    setErrMessage,
  )
  const [
    isLoadingProfiles,
    profiles,
    selectedProfile,
    setSelectedProfile,
  ] = useProfiles(props.userID, setErrMessage)

  const handleProfileSelection = (profileKey) => {
    setSelectedProfile(profileKey)
  }

  return (
    <div className={cls("page", "main")}>
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
      <div className="m-left">
        <div className="m-c-queries">
          <span>{msg.L_SelectSavedQuery}</span>
          <Select
            defaultValue={selectedProfile}
            className="m-queries"
            loading={isLoadingProfiles}
            onChange={handleProfileSelection}
          >
            {profiles.map((profile) => (
              <Option key={profile.key} value={profile.key}>
                {profile.name}
              </Option>
            ))}
          </Select>
        </div>
        <Card type="inner" className="m-c-query" title="placeholder">
          <div className="m-c-query-conditions">
            <div className="m-c-metadata">
              <span>{msg.L_ChooseMetadata}</span>
              <Select
                defaultValue={
                  profileByKey(profiles, selectedProfile).mdTemplate
                }
                className="m-metadata"
                loading={isLoadingMDTemplates}
              >
                {mdTemplates.map((template) => (
                  <Option key={template.key} value={template.key}>
                    {template.name}
                  </Option>
                ))}
              </Select>
            </div>
            <p>{msg.L_ConditionEditor}</p>
            <Divider className="m-dividen" />
            <div className="m-c-condition-editor">
              {/* dynamic generate condition */}
              <div className="m-c-condition-editor-row">
                <Select defaultValue="ph">
                  <Option value="ph">Placeholder</Option>
                </Select>
                <Select defaultValue="ph">
                  <Option value="ph">Placeholder</Option>
                </Select>
                <Select defaultValue="ph">
                  <Option value="ph">Placeholder</Option>
                </Select>
              </div>
              <div className="m-c-condition-editor-row">
                <Select defaultValue="ph">
                  <Option value="ph">Placeholder</Option>
                </Select>
                <Select defaultValue="ph">
                  <Option value="ph">Placeholder</Option>
                </Select>
                <Select defaultValue="ph">
                  <Option value="ph">Placeholder</Option>
                </Select>
              </div>
              <div className="m-c-condition-editor-row">
                <Select defaultValue="ph">
                  <Option value="ph">Placeholder</Option>
                </Select>
                <Select defaultValue="ph">
                  <Option value="ph">Placeholder</Option>
                </Select>
                <Select defaultValue="ph">
                  <Option value="ph">Placeholder</Option>
                </Select>
                <Button icon="plus"></Button>
              </div>
            </div>
          </div>
          <div className="m-c-query-actions">
            <Button className="m-action-button">{msg.B_SaveQuery}</Button>
            <Button type="primary" className="m-action-button">
              {msg.B_RunQuery}
            </Button>
          </div>
        </Card>
      </div>
      <div className="m-right">
        <Empty />
      </div>
    </div>
  )
}
