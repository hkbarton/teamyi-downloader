import React, { useState, useEffect } from "react"
import cls from "classnames"
import { Alert, Card, Select, Button, Divider, Empty } from "antd"
import { apiResult, getMDTemplates, getQueryProfiles } from "api"
import msg from "messages"
import QueryConditionRow from "renderer/comps/p/QueryConditionRow"

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
    conditions: [newCond()],
  }
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false)
  const [profiles, setProfiles] = useState([defaultProfile])
  const [selectedProfile, setSelectedProfile] = useState(defaultProfile.key)
  const [selectedMDTemp, setSelectedMDTemp] = useState(null)

  useEffect(() => {
    ;(async () => {
      setIsLoadingProfiles(true)
      const [result] = apiResult(await getQueryProfiles())
      if (result.length < 1) {
        result.push(defaultProfile)
      }
      setProfiles(result)
      const profile = result[0]
      setSelectedProfile(profile.key)
      setSelectedMDTemp(profile.mdTemplate)
      setIsLoadingProfiles(false)
    })()
  }, [userID])

  return [
    isLoadingProfiles,
    profiles,
    setProfiles,
    selectedProfile,
    setSelectedProfile,
    selectedMDTemp,
    setSelectedMDTemp,
  ]
}

function valueByKey(entries, key) {
  return entries.find((entry) => entry.key === key)
}

function newCond() {
  return {
    key: new Date().getTime(),
    mdFieldKey: null,
    op: null,
    value: null,
  }
}

function clearProfileCondition(profiles, which) {
  const profile = valueByKey(profiles, which)
  return [
    ...profiles.filter((p) => p.key !== which),
    {
      ...profile,
      conditions: [newCond()],
    },
  ]
}

function newProfileCondition(profiles, which) {
  const profile = valueByKey(profiles, which)
  const { conditions } = profile
  return [
    ...profiles.filter((p) => p.key !== which),
    {
      ...profile,
      conditions: [...conditions, newCond()],
    },
  ]
}

function removeProfileCondition(profiles, which, conditionKey) {
  const profile = valueByKey(profiles, which)
  const { conditions } = profile
  const newConditions = conditions.filter((cond) => cond.key !== conditionKey)
  if (newConditions.length < 1) {
    newConditions.push(newCond())
  }
  return [
    ...profiles.filter((p) => p.key !== which),
    {
      ...profile,
      conditions: newConditions,
    },
  ]
}

function updateProfileCondition(profiles, which, condition) {
  const profile = valueByKey(profiles, which)
  const { conditions } = profile
  const newConditions = []
  conditions.forEach((cond) => {
    if (cond.key === condition.key) {
      newConditions.push(condition)
    } else {
      newConditions.push(cond)
    }
  })
  return [
    ...profiles.filter((p) => p.key !== which),
    {
      ...profile,
      conditions: newConditions,
    },
  ]
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
    setProfiles,
    selectedProfile,
    setSelectedProfile,
    selectedMDTemp,
    setSelectedMDTemp,
  ] = useProfiles(props.userID, setErrMessage)

  const handleProfileSelection = (profileKey) => {
    const selectedProfile = valueByKey(profiles, profileKey)
    setSelectedProfile(profileKey)
    setSelectedMDTemp(selectedProfile.mdTemplate)
  }

  const handleMDTemplateSelection = (key) => {
    setSelectedMDTemp(key)
    setProfiles(clearProfileCondition(profiles, selectedProfile))
  }

  const handleConditionChange = (cond) => {
    setProfiles(updateProfileCondition(profiles, selectedProfile, cond))
  }

  const handleConditionRemoval = (key) => {
    setProfiles(removeProfileCondition(profiles, selectedProfile, key))
  }

  const handleConditionAdd = () => {
    setProfiles(newProfileCondition(profiles, selectedProfile))
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
        <Card
          type="inner"
          className="m-c-query"
          title={valueByKey(profiles, selectedProfile).name}
        >
          <div className="m-c-query-conditions">
            <div className="m-c-metadata">
              <span>{msg.L_ChooseMetadata}</span>
              <Select
                defaultValue={selectedMDTemp}
                className="m-metadata"
                loading={isLoadingMDTemplates}
                onChange={handleMDTemplateSelection}
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
              {valueByKey(profiles, selectedProfile).conditions.map((cond) => (
                <QueryConditionRow
                  key={cond.key}
                  mdTemplate={valueByKey(mdTemplates, selectedMDTemp)}
                  condition={cond}
                  onChange={handleConditionChange}
                  onRemove={handleConditionRemoval}
                  onNew={handleConditionAdd}
                />
              ))}
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
