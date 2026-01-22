import React, { useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import YesNoPill from '../components/YesNoPill.jsx'
import { CLEAN_OPTIONS, EQUIPMENT_ITEMS, FORM_ITEMS } from '../lib/schema.js'

function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function toIntOrNull(s) {
  if (s === '' || s === null || s === undefined) return null
  const n = Number(s)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

export default function SubmitInspection() {
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState(null) // {type:'ok'|'err', text:''}

  const [header, setHeader] = useState({
    car_name: '',
    inspection_date: todayISO(),
    inspected_by: '',
    mileage: '',
    exterior_cleanliness: 'Clean',
    interior_cleanliness: 'Clean',
    vehicle_remarks: '',
    maintenance_needed: '',
    additional_remarks: '',
  })

  const [equipment, setEquipment] = useState(() => {
    const obj = {}
    for (const item of EQUIPMENT_ITEMS) {
      obj[item.key] = null
      if (item.extra) obj[item.extra.key] = null
    }
    return obj
  })

  const [forms, setForms] = useState(() => {
    const obj = {}
    for (const f of FORM_ITEMS) obj[f.key] = null
    return obj
  })

  const missingRequired = useMemo(() => {
    return !header.car_name.trim() || !header.inspected_by.trim() || !header.inspection_date
  }, [header])

  function setHeaderField(k, v) {
    setHeader(prev => ({ ...prev, [k]: v }))
  }

  function setEquipField(k, v) {
    setEquipment(prev => ({ ...prev, [k]: v }))
  }

  function setFormField(k, v) {
    setForms(prev => ({ ...prev, [k]: v }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setNotice(null)

    if (missingRequired) {
      setNotice({ type: 'err', text: 'Please fill Car name, Inspection date, and Inspected by.' })
      return
    }

    setBusy(true)
    try {
      // 1) insert into inspections
      const inspectionPayload = {
        car_name: header.car_name.trim(),
        inspection_date: header.inspection_date,
        inspected_by: header.inspected_by.trim(),
        mileage: toIntOrNull(header.mileage),
        exterior_cleanliness: header.exterior_cleanliness,
        interior_cleanliness: header.interior_cleanliness,
        vehicle_remarks: header.vehicle_remarks?.trim() || null,
        maintenance_needed: header.maintenance_needed?.trim() || null,
        additional_remarks: header.additional_remarks?.trim() || null,
      }

      const { data: ins, error: insErr } = await supabase
        .from('inspections')
        .insert(inspectionPayload)
        .select('id')
        .single()

      if (insErr) throw insErr

      const inspection_id = ins.id

      // 2) equipment + forms
      const equipmentPayload = { inspection_id, ...equipment }
      const formsPayload = { inspection_id, ...forms }

      const [{ error: eqErr }, { error: fmErr }] = await Promise.all([
        supabase.from('inspection_equipment').upsert(equipmentPayload),
        supabase.from('inspection_forms').upsert(formsPayload),
      ])

      if (eqErr) throw eqErr
      if (fmErr) throw fmErr

      setNotice({ type: 'ok', text: 'Inspection submitted successfully.' })

      // reset (keep date = today)
      setHeader({
        car_name: '',
        inspection_date: todayISO(),
        inspected_by: '',
        mileage: '',
        exterior_cleanliness: 'Clean',
        interior_cleanliness: 'Clean',
        vehicle_remarks: '',
        maintenance_needed: '',
        additional_remarks: '',
      })
      setEquipment(() => {
        const obj = {}
        for (const item of EQUIPMENT_ITEMS) {
          obj[item.key] = null
          if (item.extra) obj[item.extra.key] = null
        }
        return obj
      })
      setForms(() => {
        const obj = {}
        for (const f of FORM_ITEMS) obj[f.key] = null
        return obj
      })
    } catch (err) {
      const msg = err?.message ? err.message : 'Submit failed.'
      setNotice({ type: 'err', text: msg })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="card" onSubmit={onSubmit}>
      <div className="hd">
        <h2>Submit Inspection</h2>
        <div className="small" style={{ color: 'var(--muted)', fontWeight: 800 }}>
          Required: Car name, Date, Inspected by
        </div>
      </div>
      <div className="bd">
        {notice ? (
          <div className={`notice ${notice.type === 'ok' ? 'ok' : 'err'}`} style={{ marginBottom: 12 }}>
            {notice.text}
          </div>
        ) : null}

        <div className="row cols4">
          <label>
            Car name *
            <input value={header.car_name} onChange={e => setHeaderField('car_name', e.target.value)} placeholder="e.g., Car 12 / Tahoe / Explorer" />
          </label>
          <label>
            Inspection date *
            <input type="date" value={header.inspection_date} onChange={e => setHeaderField('inspection_date', e.target.value)} />
          </label>
          <label>
            Inspected by *
            <input value={header.inspected_by} onChange={e => setHeaderField('inspected_by', e.target.value)} placeholder="Name" />
          </label>
          <label>
            Mileage
            <input inputMode="numeric" value={header.mileage} onChange={e => setHeaderField('mileage', e.target.value.replace(/[^0-9]/g,''))} placeholder="e.g., 54321" />
          </label>
        </div>

        <hr className="sep" />

        <div className="row cols2">
          <div className="card" style={{ background: 'rgba(15,22,32,0.25)', boxShadow: 'none' }}>
            <div className="hd">
              <h2>Cleanliness</h2>
            </div>
            <div className="bd">
              <div className="row cols2">
                <label>
                  Exterior
                  <select value={header.exterior_cleanliness} onChange={e => setHeaderField('exterior_cleanliness', e.target.value)}>
                    {CLEAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
                <label>
                  Interior
                  <select value={header.interior_cleanliness} onChange={e => setHeaderField('interior_cleanliness', e.target.value)}>
                    {CLEAN_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </label>
              </div>

              <label style={{ marginTop: 10 }}>
                Vehicle Remarks
                <textarea value={header.vehicle_remarks} onChange={e => setHeaderField('vehicle_remarks', e.target.value)} placeholder="Small notes (optional)" />
              </label>
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(15,22,32,0.25)', boxShadow: 'none' }}>
            <div className="hd">
              <h2>Supervisor / Admin</h2>
            </div>
            <div className="bd">
              <label>
                Vehicle maintenance needed
                <textarea value={header.maintenance_needed} onChange={e => setHeaderField('maintenance_needed', e.target.value)} placeholder="Supervisor notes on maintenance needed (optional)" />
              </label>
              <label style={{ marginTop: 10 }}>
                Additional remarks
                <textarea value={header.additional_remarks} onChange={e => setHeaderField('additional_remarks', e.target.value)} placeholder="Any other remarks (optional)" />
              </label>
            </div>
          </div>
        </div>

        <hr className="sep" />

        <div className="card" style={{ background: 'rgba(15,22,32,0.25)', boxShadow: 'none' }}>
          <div className="hd">
            <h2>Car Equipment</h2>
            <div className="small" style={{ color: 'var(--muted)', fontWeight: 800 }}>Yes / No bubbles (add notes in remarks)</div>
          </div>
          <div className="bd">
            <ol className="numbered-list">
              {EQUIPMENT_ITEMS.map(item => (
                <li key={item.key}>
                  <YesNoPill
                    label={item.label}
                    value={equipment[item.key]}
                    onChange={(v) => setEquipField(item.key, v)}
                  />
                </li>
              ))}
            </ol>
            {EQUIPMENT_ITEMS.some(item => item.extra) ? (
              <>
                <hr className="sep" />
                <div className="subhead">
                  <h3>Battery Charged</h3>
                  <div className="small" style={{ color: 'var(--muted)', fontWeight: 800 }}>
                    For equipment items that use batteries
                  </div>
                </div>
                <ol className="numbered-list">
                  {EQUIPMENT_ITEMS.filter(item => item.extra).map(item => (
                    <li key={item.extra.key}>
                      <YesNoPill
                        label={item.extra.label}
                        hint={item.label}
                        value={equipment[item.extra.key]}
                        onChange={(v) => setEquipField(item.extra.key, v)}
                      />
                    </li>
                  ))}
                </ol>
              </>
            ) : null}
          </div>
        </div>

        <hr className="sep" />

        <div className="card" style={{ background: 'rgba(15,22,32,0.25)', boxShadow: 'none' }}>
          <div className="hd">
            <h2>Forms in Vehicle</h2>
            <div className="small" style={{ color: 'var(--muted)', fontWeight: 800 }}>Select Yes / No</div>
          </div>
          <div className="bd">
            <ol className="numbered-list">
              {FORM_ITEMS.map(f => (
                <li key={f.key}>
                  <YesNoPill
                    label={f.label}
                    value={forms[f.key]}
                    onChange={(v) => setFormField(f.key, v)}
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="actions">
          <button className="btn" type="button" onClick={() => location.reload()} disabled={busy}>
            Reset
          </button>
          <button className="btn primary" type="submit" disabled={busy || missingRequired}>
            {busy ? 'Submitting…' : 'Submit Inspection'}
          </button>
        </div>

        <div className="notice" style={{ marginTop: 12 }}>
          <b>Note:</b> If you want to make “Maintenance needed” supervisor-only, we can hide it behind login and enforce it in Supabase policies.
        </div>
      </div>
    </form>
  )
}
