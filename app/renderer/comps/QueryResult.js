import React, { useState, useEffect } from "react"
import { Table } from "antd"
import msg from "messages"
import moment from "moment"
import { Button, Modal, Progress, Input, Popconfirm } from "antd"
import { apiResult, getSavingTargetPath, chooseSavingTargetPath } from "api"
import { kickoffSavingProcess, cancelOngoingSaving } from "renderer/api"

import FileIcon from "renderer/comps/FileIcon"
import FolderIcon from "icons/file_folder.svg"

// electron or nodejs module, exclued in bundle if used in renderer
import { shell } from "electron"
import path from "path"

function convertSize(bytes) {
  let units = ["B", "KB", "MB", "GB", "TB", "PB"]
  let e = Math.floor(Math.log(bytes || 1) / Math.log(1024))

  return `${(bytes / Math.pow(1024, Math.floor(e))).toFixed(
    e - 1 >= 0 ? e - 1 : 0,
  )}${units[e]}`
}

const columns = [
  {
    title: msg.TH_FileName,
    dataIndex: "file.name",
    key: "file.name",
    render: (name) => (
      <div className="m-c-query-result-file-icon-col">
        <FileIcon name={name} />
        <span className="col-content">{name}</span>
      </div>
    ),
  },
  {
    title: msg.TH_FilePath,
    dataIndex: "file.path",
    render: (p) => {
      let path = p.replace(/^home_\d+/, msg.L_RootFolder)
      path =
        path.length > 17
          ? `...${path.substr(path.length - 17, path.length)}`
          : path
      return (
        <div className="m-c-query-result-file-icon-col">
          <FolderIcon width={28} height={28} />
          <span className="col-content">{path}</span>
        </div>
      )
    },
  },
  {
    title: msg.TH_FileSize,
    dataIndex: "file.size",
    key: "file.size",
    render: (size) => convertSize(size),
  },
  {
    title: msg.TH_FileTS,
    dataIndex: "file.timestamp",
    key: "file.timestamp",
    render: (ts) => moment(ts).format("YYYY-MM-DD"),
  },
]

function useSavingTargetPath(userID) {
  const [targetPath, setTargetPath] = useState(null)
  useEffect(() => {
    ;(async () => {
      const [result, err] = apiResult(await getSavingTargetPath())
      if (!err) {
        setTargetPath(result)
      }
    })()
  }, [userID])
  return [targetPath, setTargetPath]
}

export default function(props) {
  const { userID, data, isLoadingData } = props

  const [isSaving, setIsSaving] = useState(false)
  const [showSavingDialog, setShowSavingDialog] = useState(false)
  const [savingProgress, setSavingProgress] = useState(0)
  const [progressStatus, setProgressStatus] = useState("normal")
  const [progressMsg, setProgressMsg] = useState(msg.L_StartSaving)
  const [targetPath, setTargetPath] = useSavingTargetPath(userID)
  const [resultFolder, setResultFolder] = useState(null)

  const handleFolderChooseButtonClick = async () => {
    const [newTarget, err] = apiResult(await chooseSavingTargetPath())
    if (!err) {
      setTargetPath(newTarget)
    }
  }

  const handleSaveButtonClick = async () => {
    const [resultFolder, err] = await kickoffSavingProcess(
      data,
      targetPath,
      (progress, message) => {
        if (progress === "done") {
          setIsSaving(false)
          setSavingProgress(100)
          setProgressStatus("success")
          setProgressMsg(msg.L_FinishedSaving)
        } else if (progress === "error") {
          setIsSaving(false)
          setProgressStatus("exception")
          setProgressMsg(message ? message.message : msg.L_FailedSavingFile)
        } else {
          setSavingProgress(progress)
          setProgressMsg(message)
        }
      },
    )
    if (err) {
      props.errSetter(err.message)
      return
    }
    setResultFolder(resultFolder)
    setShowSavingDialog(true)
    setIsSaving(true)
    setSavingProgress(0)
    setProgressStatus("normal")
    setProgressMsg(msg.L_StartSaving)
  }

  const handleCancelSaving = async () => {
    await cancelOngoingSaving()
    setIsSaving(false)
    setShowSavingDialog(false)
  }

  const handleOpenTarget = () => {
    if (resultFolder) {
      shell.openItem(path.join(targetPath, resultFolder))
    }
  }

  return (
    <>
      <Table
        className="m-query-result"
        rowKey="file.key"
        /* TODO: temporary display top 1000, should add pagination later */
        dataSource={data.slice(0, 1000)}
        columns={columns}
        pagination={false}
        loading={isLoadingData}
      />
      <div className="m-c-query-result-action">
        <span className="m-c-query-result-action-label">
          {msg.L_SaveLocation}
        </span>
        <Input
          className="m-c-query-result-action-path"
          value={targetPath}
          readOnly={true}
        />
        <Button
          className="m-c-query-result-action-button"
          onClick={handleFolderChooseButtonClick}
        >
          {msg.B_SelectFolder}
        </Button>
        <Button
          className="m-c-query-result-action-button"
          type="primary"
          disabled={!(data && data.length > 0)}
          onClick={handleSaveButtonClick}
        >
          {msg.B_SaveFiles}
        </Button>
        <Modal
          title={msg.B_SaveFiles}
          visible={showSavingDialog}
          footer={null}
          closable={false}
          maskClosable={false}
        >
          <div className="m-c-saving-modal">
            <Progress
              type="circle"
              percent={savingProgress}
              status={progressStatus}
            />
            <p className="m-saving-modal-progress-text">{progressMsg}</p>
            <div className="m-saving-modal-buttons">
              {isSaving ? (
                <Popconfirm
                  title={msg.T_ConfirmCancelSaving}
                  okText={msg.B_Confirm}
                  cancelText={msg.B_Cancel}
                  onConfirm={handleCancelSaving}
                >
                  <Button>{msg.B_CancelSaving}</Button>
                </Popconfirm>
              ) : (
                <Button onClick={() => setShowSavingDialog(false)}>
                  {msg.B_CloseSaving}
                </Button>
              )}
              <Button
                type="primary"
                disabled={isSaving}
                onClick={handleOpenTarget}
              >
                {msg.B_OpenFiles}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  )
}
