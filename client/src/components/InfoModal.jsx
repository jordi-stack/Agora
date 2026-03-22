import React, { useState } from 'react'
import { useT } from '../App.jsx'

export default function InfoModal({ title, children }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)} style={{ background: 'none', border: `1px solid ${t.border}`, color: t.muted, cursor: 'pointer', fontSize: 10, borderRadius: 4, padding: '2px 6px', marginLeft: 8 }}>?</button>
      {open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setOpen(false)}>
          <div style={{ background: t.card, borderRadius: 12, padding: 32, maxWidth: 540, width: '100%', border: `1px solid ${t.accent}44`, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: t.accent, fontSize: 18 }}>{title}</h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: t.muted, cursor: 'pointer', fontSize: 18 }}>X</button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  )
}
