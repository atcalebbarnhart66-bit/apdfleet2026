import React, { useMemo, useState } from 'react'
import SubmitInspection from './pages/SubmitInspection.jsx'
import ViewInspections from './pages/ViewInspections.jsx'

export default function App() {
  const [tab, setTab] = useState('submit')

  const page = useMemo(() => {
    if (tab === 'view') return <ViewInspections />
    return <SubmitInspection />
  }, [tab])

  return (
    <div className="container">
      <div className="topbar">
        <div className="brand">
          <h1>Vehicle & Equipment Inspection Portal</h1>
          <p className="sub">Web app (React) + Supabase database</p>
        </div>
        <div className="nav">
          <button className={tab === 'submit' ? 'active' : ''} onClick={() => setTab('submit')}>Submit Inspection</button>
          <button className={tab === 'view' ? 'active' : ''} onClick={() => setTab('view')}>View Inspections</button>
        </div>
      </div>

      <div className="grid">
        {page}
      </div>

      <div className="footer">
        Tip: If deletes should be supervisor-only, enable Supabase Auth + restrict delete policy.
      </div>
    </div>
  )
}
