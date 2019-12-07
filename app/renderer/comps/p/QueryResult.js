import React from "react"
import { Table } from "antd"
import msg from "messages"

const columns = [
  {
    title: msg.TH_FileName,
    dataIndex: "file.name",
    key: "file.name",
  },
  {
    title: msg.TH_FilePath,
    dataIndex: "file.path",
    key: "file.path",
  },
  {
    title: msg.TH_FileSize,
    dataIndex: "file.size",
    key: "file.size",
  },
  {
    title: msg.TH_FileTS,
    dataIndex: "file.timestamp",
    key: "file.timestamp",
  },
]

export default function(props) {
  const { data, isLoadingData } = props
  return (
    <>
      <Table
        className="m-query-result"
        dataSource={data}
        columns={columns}
        pagination={false}
        loading={isLoadingData}
      />
      <div className="m-c-query-result-action"></div>
    </>
  )
}
