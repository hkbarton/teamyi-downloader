import React from "react"
import cls from "classnames"
import { Card, Select, Button, Divider, Empty } from "antd"
import msg from "messages"

import "renderer/styles/Main.less"

const { Option } = Select

export default function(props) {
  return (
    <div className={cls("page", "main")}>
      <div className="m-left">
        <div className="m-c-queries">
          <span>{msg.L_SelectSavedQuery}</span>
          <Select defaultValue="ph" className="m-queries">
            <Option value="ph">Placeholder</Option>
          </Select>
        </div>
        <Card type="inner" className="m-c-query" title="placeholder">
          <div className="m-c-query-conditions">
            <div className="m-c-metadata">
              <span>{msg.L_ChooseMetadata}</span>
              <Select defaultValue="ph" className="m-metadata">
                <Option value="ph">Placeholder</Option>
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
