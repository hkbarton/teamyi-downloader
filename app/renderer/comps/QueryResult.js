import React from "react"
import { Table } from "antd"
import msg from "messages"
import moment from "moment"

import FileIcon from "renderer/comps/FileIcon"
import FolderIcon from "icons/file_folder.svg"

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

export default function(props) {
  const { data, isLoadingData } = props
  return (
    <>
      <Table
        className="m-query-result"
        rowKey="file.key"
        dataSource={data}
        columns={columns}
        pagination={false}
        loading={isLoadingData}
      />
      <div className="m-c-query-result-action"></div>
    </>
  )
}
