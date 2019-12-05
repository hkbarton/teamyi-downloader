import React, { useState } from "react"
import {
  Select,
  Input,
  InputNumber,
  Button,
  DatePicker,
  TimePicker,
} from "antd"
import moment from "moment"
import msg from "messages"

const { Option } = Select

import "renderer/styles/Main.less"

function opsByFieldType(field) {
  if (!field) return null
  switch (field.type) {
    case "TEXT":
    case "SINGLE":
      return [
        { key: "=", value: msg.OP_Equal },
        { key: "<>", value: msg.OP_NotEqual },
      ]
    case "NUMBER":
    case "DATE":
    case "TIME":
    case "DATETIME":
      return [
        { key: "=", value: msg.OP_Equal },
        { key: ">", value: msg.OP_Greater },
        { key: ">=", value: msg.OP_GreaterEqual },
        { key: "<", value: msg.OP_Smaller },
        { key: "<=", value: msg.OP_SmallerEqual },
      ]
    case "MULTI":
      return [
        { key: "CONTAINS", value: msg.OP_Include },
        { key: "NOT_CONTAINS", value: msg.OP_NotInclude },
      ]
    default:
      return null
  }
}

function valueByKey(entries, key) {
  if (!entries || !key) return null
  return entries.find((entry) => entry.key === key)
}

export default function(props) {
  const { mdTemplate, condition, onChange, onRemove, onNew } = props
  const currentField = valueByKey(
    mdTemplate ? mdTemplate.fields : null,
    condition.mdFieldKey,
  )

  const [selectedField, setSelectedField] = useState(condition.mdFieldKey)
  const [ops, setOps] = useState(opsByFieldType(currentField))
  const [selectedOp, setSelectedOp] = useState(condition.op)
  const [value, setValue] = useState(condition.value)

  const handleFieldSelection = (mdFieldKey) => {
    const newOps = opsByFieldType(
      mdTemplate.fields.find((field) => field.key === mdFieldKey),
    )
    const defaultOp = newOps[0].key
    setSelectedField(mdFieldKey)
    setOps(newOps)
    setSelectedOp(defaultOp)
    setValue(null)
    onChange({ ...condition, mdFieldKey, op: defaultOp, value: null })
  }

  const handleOpChange = (op) => {
    setSelectedOp(op)
    onChange({
      ...condition,
      mdFieldKey: selectedField,
      op,
      value,
    })
  }

  const handleValueChange = (v) => {
    setValue(v)
    onChange({
      ...condition,
      mdFieldKey: selectedField,
      op: selectedOp,
      value: v,
    })
  }

  const textInputChangeHandler = () => {
    return (e) => {
      handleValueChange(e.target.value)
    }
  }

  const dateTimeChangeHandler = (format) => {
    return (v) => {
      const parsedV = v.format(format)
      handleValueChange(parsedV)
    }
  }

  const renderValueControl = () => {
    if (!currentField) {
      return (
        <Input
          className="m-cr-value"
          placeholder={msg.PH_InputValue}
          disabled
        />
      )
    }
    switch (currentField.type) {
      case "NUMBER":
        return (
          <InputNumber
            className="m-cr-value"
            value={value}
            onChange={handleValueChange}
          />
        )
      case "DATE":
        return (
          <DatePicker
            className="m-cr-value"
            value={value ? moment(value) : null}
            onChange={dateTimeChangeHandler("YYYY-MM-DD")}
          />
        )
      case "TIME":
        return (
          <TimePicker
            className="m-cr-value"
            value={
              value ? moment(`${moment().format("YYYY-MM-DD")} ${value}`) : null
            }
            onChange={dateTimeChangeHandler("HH:mm:ss")}
          />
        )
      case "DATETIME":
        return (
          <DatePicker
            className="m-cr-value"
            value={value ? moment(value) : null}
            onChange={dateTimeChangeHandler("YYYY-MM-DD HH:mm:ss")}
            showTime
          />
        )
      case "SINGLE":
        return (
          <Select
            className="m-cr-value"
            value={value}
            onChange={handleValueChange}
          >
            {JSON.parse(currentField.typeData).map((d, i) => (
              <Option key={i} value={d}>
                {d}
              </Option>
            ))}
          </Select>
        )
      case "MULTI":
        return (
          <Select
            className="m-cr-value"
            mode="multiple"
            value={value ? value : []}
            onChange={handleValueChange}
          >
            {JSON.parse(currentField.typeData).map((d, i) => (
              <Option key={i} value={d}>
                {d}
              </Option>
            ))}
          </Select>
        )
      case "TEXT":
      default:
        return (
          <Input
            className="m-cr-value"
            value={value}
            placeholder={msg.PH_InputValue}
            onChange={textInputChangeHandler()}
          />
        )
    }
  }

  return (
    <div className="m-c-condition-editor-row">
      <Select
        className="m-cr-field"
        value={selectedField}
        onChange={handleFieldSelection}
        disabled={!mdTemplate}
      >
        {mdTemplate
          ? mdTemplate.fields.map((field) => (
              <Option key={field.key} value={field.key}>
                {field.name}
              </Option>
            ))
          : null}
      </Select>
      <Select
        className="m-cr-op"
        value={selectedOp}
        disabled={!selectedField}
        onChange={handleOpChange}
      >
        {ops
          ? ops.map((op) => (
              <Option key={op.key} value={op.key}>
                {op.value}
              </Option>
            ))
          : null}
      </Select>
      {renderValueControl()}
      <Button
        className="m-cr-button"
        icon="minus"
        onClick={() => onRemove(condition.key)}
      ></Button>
      <Button
        className="m-cr-button"
        icon="plus"
        onClick={() => onNew()}
      ></Button>
    </div>
  )
}
