import React, { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase.js'

function startOfMonthISO() {
  const d = new Date()
  d.setDate(1)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
function todayISO() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function tagClass(v) {
  if (v === 'Clean') return 'tag clean'
  if (v === 'Average') return 'tag avg'
  if (v === 'Dirty') return 'tag dirty'
  return 'tag'
}

export default function ViewInspections() {
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState(null) // {type,text}
  const [rows, setRows] = useState([])

  const [filters, setFilters] = useState({
    from: startOfMonthISO(),
    to: todayISO(),
    inspected_by: '',
  })

  const filtered = useMemo(() => rows, [rows])

  async function load() {
    setLoading(true)
    setNotice(null)
    try {
      const from = filters.from
      const to = filters.to
      const by = filters.inspected_by.trim()

      // Pull inspections + join equipment/forms (1:1 tables)
      let q = supabase
        .from('inspections')
        .select(`
          id, created_at, car_name, inspection_date, inspected_by, mileage,
          exterior_cleanliness, interior_cleanliness, vehicle_remarks,
          maintenance_needed, additional_remarks,
          inspection_equipment (*),
          inspection_forms (*)
        `)
        .gte('inspection_date', from)
        .lte('inspection_date', to)
        .order('inspection_date', { ascending: false })

      if (by) {
        q = q.ilike('inspected_by', `%${by}%`)
      }

      const { data, error } = await q
      if (error) throw error

      setRows(data || [])
    } catch (err) {
      setNotice({ type: 'err', text: err?.message || 'Failed to load inspections.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onDelete(id) {
    setNotice(null)
    const ok = window.confirm('Delete this inspection? This cannot be undone.')
    if (!ok) return

    try {
      setLoading(true)
      // cascade will delete equipment/forms due to FK
      const { error } = await supabase.from('inspections').delete().eq('id', id)
      if (error) throw error
      setRows(prev => prev.filter(r => r.id !== id))
      setNotice({ type: 'ok', text: 'Inspection deleted.' })
    } catch (err) {
      setNotice({ type: 'err', text: err?.message || 'Delete failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="hd">
        <h2>View Inspections</h2>
        <button className="btn" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      <div className="bd">
        {notice ? (
          <div className={`notice ${notice.type === 'ok' ? 'ok' : 'err'}`} style={{ marginBottom: 12 }}>
            {notice.text}
          </div>
        ) : null}

        <div className="row cols3">
          <label>
            From (inspection date)
            <input type="date" value={filters.from} onChange={e => setFilters(prev => ({ ...prev, from: e.target.value }))} />
          </label>
          <label>
            To (inspection date)
            <input type="date" value={filters.to} onChange={e => setFilters(prev => ({ ...prev, to: e.target.value }))} />
          </label>
          <label>
            Inspected by
            <input value={filters.inspected_by} onChange={e => setFilters(prev => ({ ...prev, inspected_by: e.target.value }))} placeholder="Search name" />
          </label>
        </div>

        <div className="actions" style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={load} disabled={loading}>Apply Filters</button>
        </div>

        <hr className="sep" />

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Car</th>
                <th>Inspected by</th>
                <th>Mileage</th>
                <th>Exterior</th>
                <th>Interior</th>
                <th>Remarks</th>
                <th>Maintenance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="notice">No inspections found for your filters.</div>
                  </td>
                </tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td>
                    <b>{r.inspection_date}</b>
                    <div className="small">Created: {new Date(r.created_at).toLocaleString()}</div>
                  </td>
                  <td><b>{r.car_name}</b></td>
                  <td>{r.inspected_by}</td>
                  <td>{r.mileage ?? ''}</td>
                  <td><span className={tagClass(r.exterior_cleanliness)}>{r.exterior_cleanliness}</span></td>
                  <td><span className={tagClass(r.interior_cleanliness)}>{r.interior_cleanliness}</span></td>
                  <td>
                    <div className="small">{r.vehicle_remarks || ''}</div>
                  </td>
                  <td>
                    <div className="small">{r.maintenance_needed || ''}</div>
                  </td>
                  <td>
                    <button className="btn danger" onClick={() => onDelete(r.id)} disabled={loading}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="notice" style={{ marginTop: 12 }}>
          Showing {filtered.length} record(s). Filters are limited to date range + inspected by (as requested).
        </div>
      </div>
    </div>
  )
}
