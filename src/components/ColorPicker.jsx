import React, { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/useStore'

const PALETTE = [
  '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e',
  '#10b981','#14b8a6','#06b6d4','#3b82f6','#6366f1','#8b5cf6',
  '#a855f7','#ec4899','#f43f5e','#ffffff','#d1d5db','#9ca3af',
  '#6b7280','#374151','#1f2937','#111827','#000000','#7c3aed',
]

export default function ColorPicker() {
  const brushColor = useStore(s => s.brushColor)
  const fillColor = useStore(s => s.fillColor)
  const setBrushColor = useStore(s => s.setBrushColor)
  const setFillColor = useStore(s => s.setFillColor)
  const recentColors = useStore(s => s.recentColors)
  const showFillColor = useStore(s => s.showFillColor)
  const setShowFillColor = useStore(s => s.setShowFillColor)

  const [activeTab, setActiveTab] = useState('palette')
  const [hexInput, setHexInput] = useState('')
  const [hue, setHue] = useState(270)
  const [sat, setSat] = useState(80)
  const [lgt, setLgt] = useState(60)

  const currentColor = showFillColor ? fillColor : brushColor
  const setColor = showFillColor ? setFillColor : setBrushColor

  const applyHex = (hex) => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) setColor(hex)
  }

  const hslToHex = (h, s, l) => {
    s /= 100; l /= 100
    const a = s * Math.min(l, 1-l)
    const f = n => { const k = (n + h/30) % 12; const c = l - a*Math.max(Math.min(k-3,9-k,1),-1); return Math.round(255*c).toString(16).padStart(2,'0') }
    return `#${f(0)}${f(8)}${f(4)}`
  }

  return (
    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b8aa0', marginBottom: '12px' }}>Color</div>

      {/* Active color indicators */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', alignItems: 'center' }}>
        {/* Fill behind */}
        <div onClick={() => setShowFillColor(true)} style={{
          position: 'relative', cursor: 'pointer',
          marginLeft: showFillColor ? '0' : '8px'
        }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: fillColor, border: showFillColor ? '2px solid #7c3aed' : '2px solid rgba(255,255,255,0.1)',
            boxShadow: showFillColor ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
            transition: 'all 0.15s', position: showFillColor ? 'relative' : 'absolute',
            bottom: showFillColor ? 0 : '-8px', left: showFillColor ? 0 : '8px'
          }}/>
        </div>
        <div onClick={() => setShowFillColor(false)} style={{ position: 'relative', cursor: 'pointer', zIndex: showFillColor ? 0 : 1 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: brushColor, border: !showFillColor ? '2px solid #7c3aed' : '2px solid rgba(255,255,255,0.1)',
            boxShadow: !showFillColor ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
            transition: 'all 0.15s'
          }}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#8b8aa0', marginBottom: '2px' }}>
            {showFillColor ? 'Fill' : 'Brush'}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#f1f0ff', letterSpacing: '0.02em' }}>
            {currentColor.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '3px', marginBottom: '12px' }}>
        {['palette', 'wheel', 'hex'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '5px', borderRadius: '6px', border: 'none', fontSize: '11px', fontWeight: '500',
            background: activeTab === tab ? 'rgba(124,58,237,0.3)' : 'transparent',
            color: activeTab === tab ? '#a78bfa' : '#8b8aa0', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s'
          }}>{tab}</button>
        ))}
      </div>

      {activeTab === 'palette' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px', marginBottom: '12px' }}>
            {PALETTE.map(c => (
              <button key={c} onClick={() => setColor(c)} title={c} style={{
                width: '100%', aspectRatio: '1', borderRadius: '6px', border: currentColor === c ? '2px solid #a78bfa' : '2px solid transparent',
                background: c, cursor: 'pointer', transition: 'transform 0.1s',
                boxShadow: currentColor === c ? '0 0 8px rgba(167,139,250,0.5)' : 'none'
              }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.15)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
            ))}
          </div>
          <div style={{ fontSize: '10px', color: '#4a4960', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent</div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {recentColors.slice(0, 8).map((c, i) => (
              <button key={i} onClick={() => setColor(c)} title={c} style={{
                width: '24px', height: '24px', borderRadius: '5px', border: currentColor === c ? '2px solid #a78bfa' : '1px solid rgba(255,255,255,0.1)',
                background: c, cursor: 'pointer', transition: 'transform 0.1s'
              }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'wheel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Hue', value: hue, max: 360, set: v => { setHue(v); setColor(hslToHex(v, sat, lgt)) } },
            { label: 'Sat', value: sat, max: 100, set: v => { setSat(v); setColor(hslToHex(hue, v, lgt)) } },
            { label: 'Light', value: lgt, max: 100, set: v => { setLgt(v); setColor(hslToHex(hue, sat, v)) } },
          ].map(({ label, value, max, set }) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b8aa0', marginBottom: '4px' }}>
                <span>{label}</span><span style={{ fontFamily: 'var(--font-mono)', color: '#f1f0ff' }}>{value}</span>
              </div>
              <input type="range" min="0" max={max} value={value} onChange={e => set(+e.target.value)} style={{ width: '100%', accentColor: '#7c3aed' }}/>
            </div>
          ))}
          <div style={{ width: '100%', height: '32px', borderRadius: '8px', background: hslToHex(hue, sat, lgt), border: '1px solid rgba(255,255,255,0.1)' }}/>
        </div>
      )}

      {activeTab === 'hex' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input type="color" value={currentColor} onChange={e => setColor(e.target.value)}
            style={{ width: '100%', height: '60px', border: 'none', borderRadius: '10px', cursor: 'pointer', background: 'none' }}
          />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              value={hexInput || currentColor}
              onChange={e => { setHexInput(e.target.value); applyHex(e.target.value) }}
              onBlur={() => setHexInput('')}
              placeholder="#000000"
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px', padding: '8px 12px', color: '#f1f0ff', fontFamily: 'var(--font-mono)',
                fontSize: '13px'
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
