import React from 'react'
import { useStore } from './store/useStore'
import CanvasDialog from './components/CanvasDialog'
import Header from './components/Header'
import Toolbar from './components/Toolbar'
import Canvas from './components/Canvas'
import RightPanel from './components/RightPanel'

export default function App() {
  const showCanvasDialog = useStore(s => s.showCanvasDialog)
  const canvasInitialized = useStore(s => s.canvasInitialized)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {showCanvasDialog && <CanvasDialog />}

      {canvasInitialized && (
        <>
          <Header />
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <Toolbar />
            <Canvas />
            <RightPanel />
          </div>
        </>
      )}

      {!canvasInitialized && !showCanvasDialog && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: '#4a4960', fontSize: '14px' }}>Loading...</div>
        </div>
      )}
    </div>
  )
}
