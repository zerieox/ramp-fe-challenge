import classNames from "classnames"
import React, { useRef } from "react"
import { InputCheckboxComponent } from "./types"

export const InputCheckbox: InputCheckboxComponent = ({ id, checked = false, disabled, onChange }) => {
  const { current: inputId } = useRef(`RampInputCheckbox-${id}`)
  return (
    <div className="RampInputCheckbox--container" data-testid={inputId}>
      <label
        //BUG2, Label was not associated with the input
        className={classNames("RampInputCheckbox--label", {
          "RampInputCheckbox--label-checked": checked,
          "RampInputCheckbox--label-disabled": disabled,
        })}
      >
        <input
          id={inputId}
          type="checkbox"
          className="RampInputCheckbox--input"
          checked={checked}
          disabled={disabled}
          onChange={() => {
            console.log("Checkbox clicked")
            onChange(!checked)
          }}
        />
      </label>
    </div>
  )
}
