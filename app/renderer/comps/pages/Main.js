import React, { useState, useEffect, useRef } from "react"
import cls from "classnames"
import {
  Alert,
  Card,
  Select,
  Button,
  Divider,
  Modal,
  Input,
  Popconfirm,
} from "antd"
import {
  apiResult,
  getMDTemplates,
  getQueryProfiles,
  saveQueryProfiles,
} from "api"
import msg from "messages"
import QueryConditionRow from "renderer/comps/p/QueryConditionRow"
import QueryResult from "renderer/comps/p/QueryResult"

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
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false)
  const newProfile = newQueryProfile()
  const [profiles, setProfiles] = useState([newProfile])
  const [selectedProfile, setSelectedProfile] = useState(-1)
  const [selectedMDTemp, setSelectedMDTemp] = useState(null)
  const [isSaveQueryModalVisible, setIsSaveQueryModalVisible] = useState(false)
  const modalInputRef = useRef(null)
  const [profileNameEditorValue, setProfileNameEditorValue] = useState(
    newProfile.name,
  )

  useEffect(() => {
    ;(async () => {
      setIsLoadingProfiles(true)
      const [result] = apiResult(await getQueryProfiles())
      if (result.length < 1 || result[result.length - 1].key !== -1) {
        result.push(newQueryProfile())
      }
      setProfiles(result)
      const profile = result[0]
      setSelectedProfile(profile.key)
      setProfileNameEditorValue(profile.name)
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
    isSaveQueryModalVisible,
    setIsSaveQueryModalVisible,
    modalInputRef,
    profileNameEditorValue,
    setProfileNameEditorValue,
  ]
}

function valueByKey(entries, key) {
  return entries.find((entry) => entry.key === key)
}

function newQueryProfile() {
  return {
    key: -1,
    name: msg.L_NewQuery,
    mdTemplate: null,
    conditions: [newCond()],
  }
}

function newCond() {
  return {
    key: new Date().getTime(),
    mdFieldKey: null,
    op: null,
    value: null,
  }
}

function updateProfile(profiles, which, newProfileFields) {
  const target = valueByKey(profiles, which)
  const newProfiles = []
  for (let profile of profiles) {
    if (profile.key !== which) {
      newProfiles.push(profile)
    } else {
      newProfiles.push({
        ...target,
        ...newProfileFields,
      })
    }
  }
  return newProfiles
}

function deleteProfile(profiles, which) {
  return profiles.filter((p) => p.key !== which)
}

function newProfileCondition(profiles, which) {
  const profile = valueByKey(profiles, which)
  const { conditions } = profile
  return updateProfile(profiles, which, {
    conditions: [...conditions, newCond()],
  })
}

function removeProfileCondition(profiles, which, conditionKey) {
  const profile = valueByKey(profiles, which)
  const { conditions } = profile
  const newConditions = conditions.filter((cond) => cond.key !== conditionKey)
  if (newConditions.length < 1) {
    newConditions.push(newCond())
  }
  return updateProfile(profiles, which, {
    ...profile,
    conditions: newConditions,
  })
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
  return updateProfile(profiles, which, {
    ...profile,
    conditions: newConditions,
  })
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
    isSaveQueryModalVisible,
    setIsSaveQueryModalVisible,
    modalInputRef,
    profileNameEditorValue,
    setProfileNameEditorValue,
  ] = useProfiles(props.userID, setErrMessage)
  const [queryResult, setQueryResult] = useState([])
  const [isLoadingQueryResult, setIsLoadingQueryResult] = useState(false)
  const selectedProfileObj = valueByKey(profiles, selectedProfile)

  const handleProfileSelection = (profileKey) => {
    const selectedProfile = valueByKey(profiles, profileKey)
    setSelectedProfile(profileKey)
    setSelectedMDTemp(selectedProfile.mdTemplate)
    setProfileNameEditorValue(selectedProfile.name)
  }

  const handleMDTemplateSelection = (key) => {
    setSelectedMDTemp(key)
    setProfiles(
      updateProfile(profiles, selectedProfile, {
        mdTemplate: key,
        conditions: [newCond()],
      }),
    )
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

  const handleSaveQueryButtonClick = () => {
    let isConditionValid = true
    for (let cond of selectedProfileObj.conditions) {
      if (!cond.mdFieldKey || !cond.op) {
        isConditionValid = false
        break
      }
    }
    if (!isConditionValid) {
      setErrMessage(msg.T_InvalidQueryCondition)
      return
    }
    setIsSaveQueryModalVisible(true)
    setTimeout(() => modalInputRef.current.select(), 0)
  }

  const handleCancelSaveQuery = () => {
    setIsSaveQueryModalVisible(false)
    setProfileNameEditorValue(selectedProfileObj.name)
  }

  const handleSaveQuery = async () => {
    const profileName = profileNameEditorValue.trim()
    if (!profileName) {
      setErrMessage(msg.T_InvalidProfileName)
      return
    }
    setIsSaveQueryModalVisible(false)
    const profileKey =
      selectedProfileObj.key !== -1
        ? selectedProfileObj.key
        : new Date().getTime()
    const newProfiles = updateProfile(profiles, selectedProfile, {
      key: profileKey,
      name: profileName,
    })
    if (newProfiles[newProfiles.length - 1].key !== -1) {
      newProfiles.push(newQueryProfile())
    }
    setProfiles(newProfiles)
    setSelectedProfile(profileKey)
    await saveQueryProfiles(newProfiles.slice(0, newProfiles.length - 1))
  }

  const handleDeleteQueryProfile = async () => {
    const newProfiles = deleteProfile(profiles, selectedProfile)
    const newSelectProfile = newProfiles[0]
    setProfiles(newProfiles)
    setSelectedProfile(newSelectProfile.key)
    setSelectedMDTemp(newSelectProfile.mdTemplate)
    setProfileNameEditorValue(newSelectProfile.name)
    await saveQueryProfiles(newProfiles.slice(0, newProfiles.length - 1))
  }

  const handleRunQuery = () => {
    // TODO
    setIsLoadingQueryResult(true)
    setTimeout(() => {
      setQueryResult([])
      setIsLoadingQueryResult(false)
    }, 1000)
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
            value={selectedProfile}
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
          title={selectedProfileObj.name}
        >
          <div className="m-c-query-conditions">
            <div className="m-c-metadata">
              <span>{msg.L_ChooseMetadata}</span>
              <Select
                value={selectedMDTemp}
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
              {selectedProfileObj.conditions.map((cond) => (
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
            {selectedProfileObj.key !== -1 ? (
              <Popconfirm
                title={msg.T_ConfirmDeleteQueryProfile}
                okText={msg.B_Confirm}
                cancelText={msg.B_Cancel}
                onConfirm={handleDeleteQueryProfile}
              >
                <Button className="m-action-button" type="danger" icon="delete">
                  {msg.B_DeleteQuery}
                </Button>
              </Popconfirm>
            ) : null}
            <Button
              className="m-action-button"
              onClick={handleSaveQueryButtonClick}
            >
              {msg.B_SaveQuery}
            </Button>
            <Modal
              title={msg.B_SaveQuery}
              visible={isSaveQueryModalVisible}
              onCancel={handleCancelSaveQuery}
              onOk={handleSaveQuery}
              okText={msg.B_Confirm}
              cancelText={msg.B_Cancel}
            >
              <Input
                size="large"
                value={profileNameEditorValue}
                ref={modalInputRef}
                onChange={(e) => setProfileNameEditorValue(e.target.value)}
              />
            </Modal>
            <Button
              type="primary"
              className="m-action-button"
              onClick={handleRunQuery}
            >
              {msg.B_RunQuery}
            </Button>
          </div>
        </Card>
      </div>
      <div className="m-right">
        <QueryResult data={queryResult} isLoadingData={isLoadingQueryResult} />
      </div>
    </div>
  )
}
