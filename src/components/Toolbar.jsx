import React from 'react'
import { useStore, TOOLS, BRUSH_SIZES } from '../store/useStore'

const toolIcons = {
  [TOOLS.BRUSH]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
      <path d="M10 17V5l7-3 1 4-8 11z"/>
    </svg>
  ),
  [TOOLS.SHAPE]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  [TOOLS.STAMP]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 3l2.09 6.26L20 9l-5 4.87L16.18 21 12 17.77 7.82 21 9 13.87 4 9l5.91.26L12 3z"/>
    </svg>
  ),
  [TOOLS.FILL]: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 11l-8-8-8.5 8.5a5.5 5.5 0 0 0 7.78 7.78L19 11z"/>
      <path d="M20 8s2 2.5 2 5-2 5-2 5"/>
    </svg>
  ),
}

export default function Toolbar() {
  const activeTool = useStore(s => s.activeTool)
  const setActiveTool = useStore(s => s.setActiveTool)
  const brushSize = useStore(s => s.brushSize)
  const setBrushSize = useStore(s => s.setBrushSize)
  const undo = useStore(s => s.undo)
  const redo = useStore(s => s.redo)
  const undoStack = useStore(s => s.undoStack)
  const redoStack = useStore(s => s.redoStack)

  const tools = [TOOLS.BRUSH, TOOLS.SHAPE, TOOLS.STAMP, TOOLS.FILL]
  const toolNames = { [TOOLS.BRUSH]: 'Brush', [TOOLS.SHAPE]: 'Shapes', [TOOLS.STAMP]: 'Stamp', [TOOLS.FILL]: 'Fill' }

  return (
    <div style={{
      width: '64px', height: '100%', background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)', display: 'flex',
      flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: '4px',
      zIndex: 100, flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px', marginBottom: '16px',
        background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 16px rgba(124,58,237,0.4)'
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Tool buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', padding: '0 8px' }}>
        {tools.map(tool => (
          <button key={tool} title={toolNames[tool]}
            onClick={() => setActiveTool(tool)}
            style={{
              width: '100%', height: '44px', borderRadius: '10px', border: 'none',
              background: activeTool === tool
                ? 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(124,58,237,0.15))'
                : 'transparent',
              color: activeTool === tool ? '#a78bfa' : '#4a4960',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
              borderLeft: activeTool === tool ? '2px solid #7c3aed' : '2px solid transparent',
              boxShadow: activeTool === tool ? '0 0 12px rgba(124,58,237,0.2)' : 'none',
            }}
            onMouseEnter={e => { if (activeTool !== tool) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#8b8aa0' }}}
            onMouseLeave={e => { if (activeTool !== tool) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4a4960' }}}
          >
            {toolIcons[tool]}
          </button>
        ))}
      </div>

      <div style={{ width: '32px', height: '1px', background: 'var(--border)', margin: '8px 0' }}/>

      {/* Brush sizes */}
      {activeTool === TOOLS.BRUSH && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', padding: '0 8px', width: '100%' }}>
          {BRUSH_SIZES.map((size, idx) => (
            <button key={idx} title={`Brush size ${size}px`}
              onClick={() => setBrushSize(idx)}
              style={{
                width: '100%', height: '36px', borderRadius: '8px', border: 'none',
                background: brushSize === idx ? 'rgba(124,58,237,0.2)' : 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s'
              }}
            >
              <div style={{
                width: `${Math.min(size, 20)}px`, height: `${Math.min(size, 20)}px`,
                borderRadius: '50%',
                background: brushSize === idx ? '#a78bfa' : '#4a4960',
                transition: 'all 0.15s'
              }}/>
            </button>
          ))}
        </div>
      )}

      <div style={{ flex: 1 }}/>

      <div style={{ width: '32px', height: '1px', background: 'var(--border)', margin: '4px 0' }}/>

      {/* Undo/Redo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 8px', width: '100%' }}>
        <button title="Undo (Ctrl+Z)" onClick={undo}
          disabled={!undoStack.length}
          style={{
            width: '100%', height: '36px', borderRadius: '8px', border: 'none',
            background: 'transparent', color: undoStack.length ? '#8b8aa0' : '#2a2a3a',
            cursor: undoStack.length ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => { if (undoStack.length) e.currentTarget.style.color = '#f1f0ff' }}
          onMouseLeave={e => e.currentTarget.style.color = undoStack.length ? '#8b8aa0' : '#2a2a3a'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 10h10a5 5 0 0 1 0 10H7"/><polyline points="3 6 3 10 7 10"/>
          </svg>
        </button>
        <button title="Redo (Ctrl+Y)" onClick={redo}
          disabled={!redoStack.length}
          style={{
            width: '100%', height: '36px', borderRadius: '8px', border: 'none',
            background: 'transparent', color: redoStack.length ? '#8b8aa0' : '#2a2a3a',
            cursor: redoStack.length ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => { if (redoStack.length) e.currentTarget.style.color = '#f1f0ff' }}
          onMouseLeave={e => e.currentTarget.style.color = redoStack.length ? '#8b8aa0' : '#2a2a3a'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 10H11a5 5 0 0 0 0 10h6"/><polyline points="21 6 21 10 17 10"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
