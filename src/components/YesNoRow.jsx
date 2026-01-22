import React from 'react'

export default function YesNoRow({ index, label, value, onChange, hint }) {
  const v = value === true ? true : value === false ? false : null

  return (
    <div className="checklist-item">
      <div className="checklist-label">
        <span className="checklist-index">{String(index).padStart(2, '0')}</span>
        <div>
          <div className="checklist-title">{label}</div>
          {hint ? <div className="muted">{hint}</div> : null}
        </div>
      </div>
      <div className="yesno" title="Select Yes or No">
        <button
          type="button"
          className={v === true ? 'on-yes' : ''}
          onClick={() => onChange(true)}
        >
          Yes
        </button>
        <button
          type="button"
          className={v === false ? 'on-no' : ''}
          onClick={() => onChange(false)}
        >
          No
        </button>
      </div>
    </div>
  )
}
