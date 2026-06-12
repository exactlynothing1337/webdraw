import React from 'react'
import { useStore, SHAPES, TOOLS } from '../store/useStore'

export default function ShapeOptions() {
  const activeTool = useStore(s => s.activeTool)
  const activeShape = useStore(s => s.activeShape)
  const setActiveShape = useStore(s => s.setActiveShape)
  const shapeFilled = useStore(s => s.shapeFilled)
  const setShapeFilled = useStore(s => s.setShapeFilled)
  const polygonSides = useStore(s => s.polygonSides)
  const setPolygonSides = useStore(s => s.setPolygonSides)
  const starPoints = useStore(s => s.starPoints)
  const setStarPoints = useStore(s => s.setStarPoints)
  const starR1 = useStore(s => s.starR1)
  const setStarR1 = useStore(s => s.setStarR1)
  const starR2 = useStore(s => s.starR2)
  const setStarR2 = useStore(s => s.setStarR2)
  const stampTemplate = useStore(s => s.stampTemplate)
  const setStampTemplate = useStore(s => s.setStampTemplate)
  const setCustomStampImage = useStore(s => s.setCustomStampImage)

  const shapes = [
    { id: SHAPES.RECTANGLE, label: 'Rect', icon: <rect x="3" y="5" width="18" height="14" rx="2"/> },
    { id: SHAPES.OVAL, label: 'Oval', icon: <ellipse cx="12" cy="12" rx="9" ry="6"/> },
    { id: SHAPES.POLYGON, label: 'Poly', icon: <polygon points="12,3 21,9 17,21 7,21 3,9"/> },
    { id: SHAPES.STAR, label: 'Star', icon: <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/> },
  ]

  if (activeTool === TOOLS.STAMP) {
    const templates = ['star', 'heart', 'lightning', 'flower']
    const icons = {
      star: '★', heart: '♥', lightning: '⚡', flower: '✿'
    }
    return (
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b8aa0', marginBottom: '12px' }}>Stamp Templates</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
          {templates.map(t => (
            <button key={t} onClick={() => setStampTemplate(t)} style={{
              padding: '10px 6px', borderRadius: '10px', border: 'none',
              background: stampTemplate === t ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
              color: stampTemplate === t ? '#a78bfa' : '#8b8aa0',
              cursor: 'pointer', fontSize: '20px', transition: 'all 0.15s',
              borderLeft: stampTemplate === t ? '2px solid #7c3aed' : '2px solid transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
            }}>
              <span>{icons[t]}</span>
              <span style={{ fontSize: '10px', textTransform: 'capitalize', fontWeight: '500' }}>{t}</span>
            </button>
          ))}
        </div>
        <button onClick={() => {
          const input = document.createElement('input')
          input.type = 'file'; input.accept = 'image/*'
          input.onchange = e => {
            const file = e.target.files[0]
            if (!file) return
            const img = new Image()
            const url = URL.createObjectURL(file)
            img.onload = () => setCustomStampImage(img)
            img.src = url
          }
          input.click()
        }} style={{
          width: '100%', padding: '8px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.12)',
          background: 'transparent', color: '#8b8aa0', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s'
        }}
          onMouseEnter={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.color = '#a78bfa' }}
          onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = '#8b8aa0' }}
        >
          + Custom Image
        </button>
      </div>
    )
  }

  if (activeTool !== TOOLS.SHAPE) return null

  return (
    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8b8aa0', marginBottom: '12px' }}>Shape</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
        {shapes.map(s => (
          <button key={s.id} onClick={() => setActiveShape(s.id)} style={{
            padding: '10px 6px', borderRadius: '10px', border: 'none',
            background: activeShape === s.id ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
            color: activeShape === s.id ? '#a78bfa' : '#8b8aa0',
            cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'all 0.15s',
            borderLeft: activeShape === s.id ? '2px solid #7c3aed' : '2px solid transparent',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {s.icon}
            </svg>
            {s.label}
          </button>
        ))}
      </div>

      {/* Fill toggle */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        <button onClick={() => setShapeFilled(true)} style={{
          flex: 1, padding: '7px', borderRadius: '8px', border: 'none',
          background: shapeFilled ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
          color: shapeFilled ? '#a78bfa' : '#8b8aa0', cursor: 'pointer', fontSize: '11px', fontWeight: '600', transition: 'all 0.15s'
        }}>Filled</button>
        <button onClick={() => setShapeFilled(false)} style={{
          flex: 1, padding: '7px', borderRadius: '8px', border: 'none',
          background: !shapeFilled ? 'rgba(124,58,237,0.25)' : 'rgba(255,255,255,0.04)',
          color: !shapeFilled ? '#a78bfa' : '#8b8aa0', cursor: 'pointer', fontSize: '11px', fontWeight: '600', transition: 'all 0.15s'
        }}>Outline</button>
      </div>

      {/* Polygon options */}
      {activeShape === SHAPES.POLYGON && (
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b8aa0', marginBottom: '6px' }}>
            <span>Sides</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#f1f0ff' }}>{polygonSides}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button onClick={() => setPolygonSides(polygonSides - 1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: '#8b8aa0', cursor: 'pointer', fontSize: '16px' }}>−</button>
            <input type="range" min="3" max="20" value={polygonSides} onChange={e => setPolygonSides(+e.target.value)} style={{ flex: 1, accentColor: '#7c3aed' }}/>
            <button onClick={() => setPolygonSides(polygonSides + 1)} style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--border)', background: 'transparent', color: '#8b8aa0', cursor: 'pointer', fontSize: '16px' }}>+</button>
          </div>
        </div>
      )}

      {/* Star options */}
      {activeShape === SHAPES.STAR && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b8aa0', marginBottom: '4px' }}>
              <span>Points</span><span style={{ fontFamily: 'var(--font-mono)', color: '#f1f0ff' }}>{starPoints}</span>
            </div>
            <input type="range" min="3" max="20" value={starPoints} onChange={e => setStarPoints(+e.target.value)} style={{ width: '100%', accentColor: '#7c3aed' }}/>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b8aa0', marginBottom: '4px' }}>
              <span>R1 (outer)</span><span style={{ fontFamily: 'var(--font-mono)', color: '#f1f0ff' }}>{starR1}</span>
            </div>
            <input type="range" min="10" max="200" value={starR1} onChange={e => setStarR1(+e.target.value)} style={{ width: '100%', accentColor: '#7c3aed' }}/>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b8aa0', marginBottom: '4px' }}>
              <span>R2 (inner)</span><span style={{ fontFamily: 'var(--font-mono)', color: '#f1f0ff' }}>{starR2}</span>
            </div>
            <input type="range" min="5" max="200" value={starR2} onChange={e => setStarR2(+e.target.value)} style={{ width: '100%', accentColor: '#7c3aed' }}/>
          </div>
        </div>
      )}
    </div>
  )
}
