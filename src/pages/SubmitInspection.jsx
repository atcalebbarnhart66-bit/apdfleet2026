diff --git a/src/pages/SubmitInspection.jsx b/src/pages/SubmitInspection.jsx
index 3ee215d5d6b12d9f852ffc90d0bc87cc1e0ccc1c..8a47582015dbdcab4533de3b4acafcb933b4c892 100644
--- a/src/pages/SubmitInspection.jsx
+++ b/src/pages/SubmitInspection.jsx
@@ -1,44 +1,71 @@
 import React, { useMemo, useState } from 'react'
 import { supabase } from '../lib/supabase.js'
-import YesNoPill from '../components/YesNoPill.jsx'
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
 
+function YesNoToggle({ value, onChange }) {
+  const v = value === true ? true : value === false ? false : null
+
+  return (
+    <div className="yesno" title="Select Yes or No">
+      <button type="button" className={v === true ? 'on-yes' : ''} onClick={() => onChange(true)}>
+        Yes
+      </button>
+      <button type="button" className={v === false ? 'on-no' : ''} onClick={() => onChange(false)}>
+        No
+      </button>
+    </div>
+  )
+}
+
+function ChecklistRow({ number, label, hint, value, onChange }) {
+  return (
+    <div className="checklist-item">
+      <div className="checklist-number">{number}</div>
+      <div className="checklist-label">
+        <div className="checklist-title">{label}</div>
+        {hint ? <div className="checklist-hint">{hint}</div> : null}
+      </div>
+      <YesNoToggle value={value} onChange={onChange} />
+    </div>
+  )
+}
+
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
 
@@ -127,53 +154,50 @@ export default function SubmitInspection() {
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
-        <div className="small" style={{ color: 'var(--muted)', fontWeight: 800 }}>
-          Required: Car name, Date, Inspected by
-        </div>
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
@@ -209,87 +233,103 @@ export default function SubmitInspection() {
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
-            <div className="small" style={{ color: 'var(--muted)', fontWeight: 800 }}>Yes / No bubbles (add notes in remarks)</div>
+            <div className="small" style={{ color: 'var(--muted)', fontWeight: 800 }}>Answer yes or no for each numbered item.</div>
+          </div>
+          <div className="bd">
+            <div className="checklist-grid">
+              {EQUIPMENT_ITEMS.map((item, index) => (
+                <ChecklistRow
+                  key={item.key}
+                  number={index + 1}
+                  label={item.label}
+                  value={equipment[item.key]}
+                  onChange={(v) => setEquipField(item.key, v)}
+                />
+              ))}
+            </div>
+          </div>
+        </div>
+
+        <hr className="sep" />
+
+        <div className="card" style={{ background: 'rgba(15,22,32,0.25)', boxShadow: 'none' }}>
+          <div className="hd">
+            <h2>Operational / Battery Checks</h2>
+            <div className="small" style={{ color: 'var(--muted)', fontWeight: 800 }}>Complete only the equipment with battery or operational checks.</div>
           </div>
           <div className="bd">
-            <div className="pills">
-              {EQUIPMENT_ITEMS.map(item => (
-                <React.Fragment key={item.key}>
-                  <YesNoPill
-                    label={item.label}
-                    value={equipment[item.key]}
-                    onChange={(v) => setEquipField(item.key, v)}
-                  />
-                  {item.extra ? (
-                    <YesNoPill
-                      label={item.extra.label}
-                      hint={item.label}
-                      value={equipment[item.extra.key]}
-                      onChange={(v) => setEquipField(item.extra.key, v)}
-                    />
-                  ) : null}
-                </React.Fragment>
+            <div className="checklist-grid">
+              {EQUIPMENT_ITEMS.filter(item => item.extra).map((item, index) => (
+                <ChecklistRow
+                  key={item.extra.key}
+                  number={index + 1}
+                  label={item.label}
+                  hint={item.extra.label}
+                  value={equipment[item.extra.key]}
+                  onChange={(v) => setEquipField(item.extra.key, v)}
+                />
               ))}
             </div>
           </div>
         </div>
 
         <hr className="sep" />
 
         <div className="card" style={{ background: 'rgba(15,22,32,0.25)', boxShadow: 'none' }}>
           <div className="hd">
             <h2>Forms in Vehicle</h2>
             <div className="small" style={{ color: 'var(--muted)', fontWeight: 800 }}>Select Yes / No</div>
           </div>
           <div className="bd">
-            <div className="pills">
-              {FORM_ITEMS.map(f => (
-                <YesNoPill
+            <div className="checklist-grid">
+              {FORM_ITEMS.map((f, index) => (
+                <ChecklistRow
                   key={f.key}
+                  number={index + 1}
                   label={f.label}
                   value={forms[f.key]}
                   onChange={(v) => setFormField(f.key, v)}
                 />
               ))}
             </div>
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
