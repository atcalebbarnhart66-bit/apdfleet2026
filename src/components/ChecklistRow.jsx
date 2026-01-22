import React from 'react'

export default function ChecklistRow({ index, label, value, onChange, subLabel }) {
  const v = value === true ? true : value === false ? false : null

  return (
    <div className="checklist-row">
      <div className="checklist-index">{index}</div>
      <div className="checklist-text">
        <b>{label}</b>
        {subLabel ? <div className="muted">{subLabel}</div> : null}
      </div>
      <button
        type="button"
        className={`checklist-choice ${v === true ? 'on-yes' : ''}`}
        onClick={() => onChange(true)}
      >
        Yes
      </button>
      <button
        type="button"
        className={`checklist-choice ${v === false ? 'on-no' : ''}`}
        onClick={() => onChange(false)}
      >
        No
      </button>
    </div>
  )
}
