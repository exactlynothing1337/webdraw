import React from 'react'
import ColorPicker from './ColorPicker'
import ShapeOptions from './ShapeOptions'
import LayersPanel from './LayersPanel'

export default function RightPanel() {
  return (
    <div style={{
      width: '280px', height: '100%', background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
      flexShrink: 0, overflow: 'hidden'
    }}>
      <ColorPicker />
      <ShapeOptions />
      <LayersPanel />
    </div>
  )
}
