import React from 'react'

export default function YesNoPill({ label, value, onChange, hint }) {
  const v = value === true ? true : value === false ? false : null

  return (
    <div className="pill">
      <div>
        <b>{label}</b>
        {hint ? <div className="muted">{hint}</div> : null}
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
