import React, { useState } from 'react'
import { useStore, LAYER_TYPES } from '../store/useStore'

export default function LayersPanel() {
  const layers = useStore(s => s.layers)
  const activeLayerId = useStore(s => s.activeLayerId)
  const setActiveLayer = useStore(s => s.setActiveLayer)
  const addDrawingLayer = useStore(s => s.addDrawingLayer)
  const removeLayer = useStore(s => s.removeLayer)
  const moveLayerUp = useStore(s => s.moveLayerUp)
  const moveLayerDown = useStore(s => s.moveLayerDown)
  const toggleLayerVisible = useStore(s => s.toggleLayerVisible)
  const updateLayerOpacity = useStore(s => s.updateLayerOpacity)
  const [expandedId, setExpandedId] = useState(null)

  const getLayerIcon = (layer) => {
    if (layer.type === LAYER_TYPES.BACKGROUND) return '⬛'
    if (layer.type === LAYER_TYPES.SHAPE) return '⬡'
    return '🖌'
  }

  const getLayerColor = (layer) => {
    if (layer.id === activeLayerId) return 'rgba(124,58,237,0.2)'
    return 'transparent'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b8aa0' }}>Layers</div>
        <button onClick={addDrawingLayer} title="Add drawing layer" style={{
          width: '26px', height: '26px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(124,58,237,0.15)', color: '#a78bfa', cursor: 'pointer', fontSize: '18px', lineHeight: '1',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s'
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.3)'; e.currentTarget.style.borderColor = '#7c3aed' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        >+</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {layers.map((layer, idx) => (
          <div key={layer.id} style={{ marginBottom: '4px' }}>
            <div
              onClick={() => { setActiveLayer(layer.id); setExpandedId(expandedId === layer.id ? null : layer.id) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
                background: getLayerColor(layer),
                border: layer.id === activeLayerId ? '1px solid rgba(124,58,237,0.35)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (layer.id !== activeLayerId) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
              onMouseLeave={e => { if (layer.id !== activeLayerId) e.currentTarget.style.background = 'transparent' }}
            >
              {/* Visibility toggle */}
              <button onClick={e => { e.stopPropagation(); toggleLayerVisible(layer.id) }} style={{
                width: '18px', height: '18px', border: 'none', background: 'none', cursor: 'pointer',
                color: layer.visible ? '#a78bfa' : '#2a2a3a', fontSize: '12px', flexShrink: 0, padding: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {layer.visible ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>

              {/* Layer icon */}
              <span style={{ fontSize: '12px', flexShrink: 0 }}>{getLayerIcon(layer)}</span>

              {/* Name */}
              <span style={{
                flex: 1, fontSize: '12px', fontWeight: '500', color: layer.id === activeLayerId ? '#f1f0ff' : '#8b8aa0',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0
              }}>{layer.name}</span>

              {/* Type badge */}
              <span style={{
                fontSize: '9px', padding: '2px 5px', borderRadius: '4px', flexShrink: 0,
                background: layer.type === LAYER_TYPES.BACKGROUND ? 'rgba(6,182,212,0.1)' :
                  layer.type === LAYER_TYPES.SHAPE ? 'rgba(34,197,94,0.1)' : 'rgba(124,58,237,0.1)',
                color: layer.type === LAYER_TYPES.BACKGROUND ? '#06b6d4' :
                  layer.type === LAYER_TYPES.SHAPE ? '#22c55e' : '#a78bfa',
                fontWeight: '600', letterSpacing: '0.04em', textTransform: 'uppercase'
              }}>
                {layer.type === LAYER_TYPES.BACKGROUND ? 'BG' : layer.type === LAYER_TYPES.SHAPE ? 'SVG' : 'PX'}
              </span>
            </div>

            {/* Expanded controls */}
            {expandedId === layer.id && layer.id !== 'background' && (
              <div style={{ padding: '8px 10px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '0 0 10px 10px', marginTop: '-4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#4a4960', marginBottom: '4px' }}>
                  <span>Opacity</span><span style={{ fontFamily: 'var(--font-mono)', color: '#8b8aa0' }}>{Math.round((layer.opacity || 1) * 100)}%</span>
                </div>
                <input type="range" min="0" max="100" value={Math.round((layer.opacity || 1) * 100)}
                  onChange={e => updateLayerOpacity(layer.id, +e.target.value / 100)}
                  style={{ width: '100%', accentColor: '#7c3aed', marginBottom: '8px' }}
                />
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={() => moveLayerUp(layer.id)} title="Move up" style={{
                    flex: 1, padding: '5px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent',
                    color: '#8b8aa0', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { e.target.style.color = '#f1f0ff'; e.target.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    onMouseLeave={e => { e.target.style.color = '#8b8aa0'; e.target.style.borderColor = 'var(--border)' }}
                  >↑</button>
                  <button onClick={() => moveLayerDown(layer.id)} title="Move down" style={{
                    flex: 1, padding: '5px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent',
                    color: '#8b8aa0', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { e.target.style.color = '#f1f0ff'; e.target.style.borderColor = 'rgba(255,255,255,0.2)' }}
                    onMouseLeave={e => { e.target.style.color = '#8b8aa0'; e.target.style.borderColor = 'var(--border)' }}
                  >↓</button>
                  <button onClick={() => removeLayer(layer.id)} title="Delete layer" style={{
                    flex: 1, padding: '5px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'transparent',
                    color: '#ef4444', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s'
                  }}
                    onMouseEnter={e => { e.target.style.background = 'rgba(239,68,68,0.1)' }}
                    onMouseLeave={e => { e.target.style.background = 'transparent' }}
                  >🗑</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
