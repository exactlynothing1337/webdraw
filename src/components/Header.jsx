import React, { useRef } from 'react'
import { useStore } from '../store/useStore'

export default function Header() {
  const saveJPEG = useStore(s => s.saveJPEG)
  const saveProject = useStore(s => s.saveProject)
  const loadProject = useStore(s => s.loadProject)
  const canvasWidth = useStore(s => s.canvasWidth)
  const canvasHeight = useStore(s => s.canvasHeight)
  const fileRef = useRef()

  const handleLoad = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => loadProject(ev.target.result)
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div style={{
      height: '48px', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', paddingLeft: '0', paddingRight: '16px',
      gap: '8px', flexShrink: 0, zIndex: 200
    }}>
      {/* Left spacer for toolbar */}
      <div style={{ width: '64px', flexShrink: 0 }}/>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          fontSize: '13px', fontWeight: '700', letterSpacing: '0.05em',
          background: 'linear-gradient(135deg, #a78bfa, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>WebDraw</span>
        <span style={{ color: '#2a2a3a', fontSize: '13px' }}>•</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#4a4960' }}>
          {canvasWidth} × {canvasHeight}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <input ref={fileRef} type="file" accept=".sdp" onChange={handleLoad} style={{ display: 'none' }}/>

        <button onClick={() => fileRef.current?.click()} style={{
          padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)', color: '#8b8aa0', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
          display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s'
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f1f0ff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#8b8aa0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Load
        </button>

        <button onClick={saveProject} style={{
          padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.04)', color: '#8b8aa0', cursor: 'pointer', fontSize: '12px', fontWeight: '500',
          display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.15s'
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#f1f0ff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#8b8aa0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
          </svg>
          Save .sdp
        </button>

        <button onClick={saveJPEG} style={{
          padding: '6px 14px', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
          display: 'flex', alignItems: 'center', gap: '5px', transition: 'all 0.2s',
          boxShadow: '0 2px 12px rgba(124,58,237,0.3)'
        }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.5)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(124,58,237,0.3)'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export JPG
        </button>
      </div>
    </div>
  )
}
