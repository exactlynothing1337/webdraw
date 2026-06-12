import React, { useState } from 'react'
import { useStore } from '../store/useStore'

export default function CanvasDialog() {
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [bgColor, setBgColor] = useState('#ffffff')
  const initCanvas = useStore(s => s.initCanvas)

  const handleConfirm = () => {
    initCanvas(Math.max(100, width), Math.max(100, height), bgColor)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'radial-gradient(ellipse at 50% 40%, rgba(124,58,237,0.15) 0%, rgba(10,10,15,0.97) 70%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(26,26,36,0.95) 0%, rgba(17,17,24,0.98) 100%)',
        border: '1px solid rgba(124,58,237,0.3)',
        borderRadius: '20px',
        padding: '40px',
        width: '420px',
        boxShadow: '0 0 60px rgba(124,58,237,0.2), 0 24px 64px rgba(0,0,0,0.7)',
        animation: 'fadeIn 0.3s ease'
      }}>
        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '56px', height: '56px', borderRadius: '16px', marginBottom: '16px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            boxShadow: '0 0 24px rgba(124,58,237,0.5)'
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M12 2v20M3 7l9 5 9-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', background: 'linear-gradient(135deg, #f1f0ff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            WebDraw
          </h1>
          <p style={{ color: '#8b8aa0', fontSize: '14px', marginTop: '6px' }}>Set up your canvas to begin</p>
        </div>

        {/* Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b8aa0' }}>Width (px)</span>
              <input
                type="number" value={width}
                onChange={e => setWidth(+e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '10px 14px', color: '#f1f0ff',
                  fontSize: '15px', fontWeight: '500', width: '100%',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b8aa0' }}>Height (px)</span>
              <input
                type="number" value={height}
                onChange={e => setHeight(+e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px', padding: '10px 14px', color: '#f1f0ff',
                  fontSize: '15px', fontWeight: '500', width: '100%',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#7c3aed'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </label>
          </div>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b8aa0' }}>Background Color</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px' }}>
              <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                style={{ width: '36px', height: '36px', border: 'none', background: 'none', cursor: 'pointer', borderRadius: '8px', padding: '2px' }}
              />
              <span style={{ color: '#f1f0ff', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>{bgColor.toUpperCase()}</span>
            </div>
          </label>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
            {[
              { label: 'HD', w: 1280, h: 720 },
              { label: '800×600', w: 800, h: 600 },
              { label: 'Square', w: 600, h: 600 },
              { label: 'A4', w: 794, h: 1123 },
            ].map(preset => (
              <button key={preset.label} onClick={() => { setWidth(preset.w); setHeight(preset.h) }}
                style={{
                  flex: 1, padding: '7px 4px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px',
                  color: '#8b8aa0', fontSize: '11px', fontWeight: '500',
                  cursor: 'pointer', transition: 'all 0.15s'
                }}
                onMouseEnter={e => { e.target.style.background = 'rgba(124,58,237,0.15)'; e.target.style.color = '#a78bfa'; e.target.style.borderColor = 'rgba(124,58,237,0.4)' }}
                onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = '#8b8aa0'; e.target.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >{preset.label}</button>
            ))}
          </div>

          <button onClick={handleConfirm} style={{
            padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: '600',
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            color: 'white', cursor: 'pointer', border: 'none',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            transition: 'all 0.2s', marginTop: '4px'
          }}
            onMouseEnter={e => e.target.style.boxShadow = '0 6px 28px rgba(124,58,237,0.6)'}
            onMouseLeave={e => e.target.style.boxShadow = '0 4px 20px rgba(124,58,237,0.4)'}
          >
            Create Canvas →
          </button>
        </div>
      </div>
    </div>
  )
}
