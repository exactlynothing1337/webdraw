import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useStore, TOOLS, SHAPES, LAYER_TYPES, BRUSH_SIZES } from '../store/useStore'
import { floodFill, stampAt } from '../utils/drawing'

const HANDLE_SIZE = 14

export default function Canvas() {
  const canvasWidth = useStore(s => s.canvasWidth)
  const canvasHeight = useStore(s => s.canvasHeight)
  const layers = useStore(s => s.layers)
  const activeLayerId = useStore(s => s.activeLayerId)
  const activeTool = useStore(s => s.activeTool)
  const activeShape = useStore(s => s.activeShape)
  const brushSize = useStore(s => s.brushSize)
  const brushColor = useStore(s => s.brushColor)
  const fillColor = useStore(s => s.fillColor)
  const shapeFilled = useStore(s => s.shapeFilled)
  const polygonSides = useStore(s => s.polygonSides)
  const starPoints = useStore(s => s.starPoints)
  const starR1 = useStore(s => s.starR1)
  const starR2 = useStore(s => s.starR2)
  const stampTemplate = useStore(s => s.stampTemplate)
  const customStampImage = useStore(s => s.customStampImage)
  const setCanvasSize = useStore(s => s.setCanvasSize)
  const addShapeLayer = useStore(s => s.addShapeLayer)
  const registerLayerCanvas = useStore(s => s.registerLayerCanvas)
  const updateLayerPosition = useStore(s => s.updateLayerPosition)
  const updateLayerSize = useStore(s => s.updateLayerSize)
  const saveUndoState = useStore(s => s.saveUndoState)

  const containerRef = useRef()
  const bgCanvasRef = useRef()
  const previewCanvasRef = useRef()
  const layerCanvasRefs = useRef({})

  // Interaction state
  const isDrawing = useRef(false)
  const lastPos = useRef(null)
  const drawStart = useRef(null)
  const shiftHeld = useRef(false)
  const ctrlHeld = useRef(false)
  const stampActive = useRef(false)

  // Layer resize/move
  const [activeHandle, setActiveHandle] = useState(null) // { layerId, corner: 'nw'|'ne'|'sw'|'se' }
  const [movingLayer, setMovingLayer] = useState(null) // { layerId, startX, startY, origX, origY }
  const resizeStart = useRef(null)

  // Canvas resize marker
  const [resizingCanvas, setResizingCanvas] = useState(false)
  const canvasResizeStart = useRef(null)

  // Stamp cursor
  const [stampPos, setStampPos] = useState(null)

  const getActiveLayer = () => layers.find(l => l.id === activeLayerId)

  const getPos = (e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  // Register layer canvases
  useEffect(() => {
    layers.forEach(layer => {
      if (layer.type === LAYER_TYPES.BACKGROUND) {
        if (bgCanvasRef.current) registerLayerCanvas(layer.id, bgCanvasRef.current)
      } else if (layer.type === LAYER_TYPES.DRAWING) {
        const canvas = layerCanvasRefs.current[layer.id]
        if (canvas) registerLayerCanvas(layer.id, canvas)
      }
    })
  }, [layers])

  // Draw background
  useEffect(() => {
    const layer = layers.find(l => l.id === 'background')
    if (!layer || !bgCanvasRef.current) return
    const ctx = bgCanvasRef.current.getContext('2d')
    ctx.fillStyle = layer.bgColor || '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }, [layers, canvasWidth, canvasHeight])

  // Keyboard listeners
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'Shift') shiftHeld.current = true
      if (e.key === 'Control') ctrlHeld.current = true
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); useStore.getState().undo() }
      if (e.ctrlKey && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) { e.preventDefault(); useStore.getState().redo() }
    }
    const up = (e) => {
      if (e.key === 'Shift') shiftHeld.current = false
      if (e.key === 'Control') ctrlHeld.current = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  const getLayerCanvas = (layerId) => {
    const layer = layers.find(l => l.id === layerId)
    if (!layer) return null
    if (layer.id === 'background') return bgCanvasRef.current
    return layerCanvasRefs.current[layerId] || null
  }

  // ——— DRAWING ———
  const startBrush = (pos) => {
    const layer = getActiveLayer()
    if (!layer || layer.type !== LAYER_TYPES.DRAWING) return
    saveUndoState()
    isDrawing.current = true
    lastPos.current = pos
    const canvas = layerCanvasRefs.current[layer.id]
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = BRUSH_SIZES[brushSize]
    ctx.strokeStyle = brushColor
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    ctx.arc(pos.x - layer.x, pos.y - layer.y, size/4, 0, Math.PI*2)
    ctx.fillStyle = brushColor
    ctx.fill()
  }

  const continueBrush = (pos) => {
    const layer = getActiveLayer()
    if (!layer || !isDrawing.current || layer.type !== LAYER_TYPES.DRAWING) return
    const canvas = layerCanvasRefs.current[layer.id]
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = BRUSH_SIZES[brushSize]
    ctx.strokeStyle = brushColor
    ctx.lineWidth = size
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    const lp = lastPos.current

    let targetPos = pos
    if (shiftHeld.current && lp) {
      const dx = Math.abs(pos.x - lp.x)
      const dy = Math.abs(pos.y - lp.y)
      if (dx > dy) targetPos = { x: pos.x, y: lp.y }
      else targetPos = { x: lp.x, y: pos.y }
    }

    ctx.beginPath()
    ctx.moveTo(lp.x - layer.x, lp.y - layer.y)
    ctx.lineTo(targetPos.x - layer.x, targetPos.y - layer.y)
    ctx.stroke()
    lastPos.current = targetPos
  }

  // ——— SHAPE PREVIEW ———
  const drawShapePreview = (start, end) => {
    const pc = previewCanvasRef.current
    if (!pc) return
    const ctx = pc.getContext('2d')
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    let x1 = start.x, y1 = start.y, x2 = end.x, y2 = end.y
    let rx = Math.min(x1,x2), ry = Math.min(y1,y2)
    let rw = Math.abs(x2-x1), rh = Math.abs(y2-y1)
    if (shiftHeld.current) {
      const s = Math.min(rw,rh); rw=s; rh=s
      if (x2<x1) rx=x1-s
      if (y2<y1) ry=y1-s
    }

    ctx.save()
    ctx.strokeStyle = brushColor
    ctx.fillStyle = fillColor
    ctx.lineWidth = BRUSH_SIZES[brushSize]
    ctx.setLineDash([4, 4])
    ctx.strokeRect(rx, ry, rw, rh)
    ctx.setLineDash([])

    const strokeW = BRUSH_SIZES[brushSize]
    ctx.lineWidth = strokeW
    ctx.strokeStyle = brushColor
    ctx.fillStyle = fillColor
    ctx.beginPath()

    const cx = rx+rw/2, cy = ry+rh/2
    if (activeShape === SHAPES.RECTANGLE) {
      ctx.rect(rx, ry, rw, rh)
    } else if (activeShape === SHAPES.OVAL) {
      ctx.ellipse(cx, cy, rw/2, rh/2, 0, 0, Math.PI*2)
    } else if (activeShape === SHAPES.POLYGON) {
      const r = Math.min(rw,rh)/2
      for (let i=0;i<polygonSides;i++) {
        const a=(i/polygonSides)*Math.PI*2-Math.PI/2
        i===0?ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a))
      }
      ctx.closePath()
    } else if (activeShape === SHAPES.STAR) {
      const base=Math.min(rw,rh)/2
      const r1=base*(starR1/100)
      const r2=base*(starR2/100)
      for (let i=0;i<starPoints*2;i++) {
        const a=(i/(starPoints*2))*Math.PI*2-Math.PI/2
        const r=i%2===0?r1:r2
        i===0?ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a)):ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a))
      }
      ctx.closePath()
    }
    if (shapeFilled) ctx.fill()
    ctx.stroke()
    ctx.restore()
  }

  const clearPreview = () => {
    const pc = previewCanvasRef.current
    if (pc) pc.getContext('2d').clearRect(0, 0, canvasWidth, canvasHeight)
  }

  // ——— FINALIZE SHAPE ———
  const finalizeShape = (start, end) => {
    let x1=start.x, y1=start.y, x2=end.x, y2=end.y
    let rx=Math.min(x1,x2), ry=Math.min(y1,y2)
    let rw=Math.abs(x2-x1), rh=Math.abs(y2-y1)
    if (shiftHeld.current) {
      const s=Math.min(rw,rh); rw=s; rh=s
      if (x2<x1) rx=x1-s
      if (y2<y1) ry=y1-s
    }
    if (rw < 5 || rh < 5) return
    saveUndoState()
    const shapeData = {
      shape: activeShape, filled: shapeFilled,
      fillColor, strokeColor: brushColor, strokeWidth: BRUSH_SIZES[brushSize],
      sides: polygonSides, points: starPoints,
      r1ratio: starR1/100, r2ratio: starR2/100
    }
    addShapeLayer(rx, ry, rw, rh, shapeData)
    clearPreview()
  }

  // ——— STAMP ———
  const doStamp = (pos) => {
    const layer = getActiveLayer()
    if (!layer || layer.type !== LAYER_TYPES.DRAWING) return
    const canvas = layerCanvasRefs.current[layer.id]
    if (!canvas) return
    stampAt(canvas, stampTemplate, customStampImage, pos.x - layer.x, pos.y - layer.y, BRUSH_SIZES[brushSize] * 3, brushColor)
  }

  // ——— FILL ———
  const doFill = (pos) => {
    const layer = getActiveLayer()
    if (!layer || layer.type !== LAYER_TYPES.DRAWING) return
    const canvas = layerCanvasRefs.current[layer.id]
    if (!canvas) return
    saveUndoState()
    floodFill(canvas, Math.round(pos.x - layer.x), Math.round(pos.y - layer.y), fillColor)
  }

  // ——— LAYER HANDLES ———
  const getHandlesForLayer = (layer) => {
    if (layer.id === 'background') return []
    return [
      { id: 'nw', x: layer.x, y: layer.y },
      { id: 'ne', x: layer.x + layer.width, y: layer.y },
      { id: 'sw', x: layer.x, y: layer.y + layer.height },
      { id: 'se', x: layer.x + layer.width, y: layer.y + layer.height },
    ]
  }

  // ——— EVENT HANDLERS ———
  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return
    const pos = getPos(e)

    // Check canvas resize marker
    const markerX = canvasWidth - 10, markerY = canvasHeight - 10
    if (pos.x >= markerX - 10 && pos.x <= markerX + 10 && pos.y >= markerY - 10 && pos.y <= markerY + 10) {
      setResizingCanvas(true)
      canvasResizeStart.current = { mouseX: pos.x, mouseY: pos.y, w: canvasWidth, h: canvasHeight }
      return
    }

    // Check layer handles (active layer only)
    const activeLayer = getActiveLayer()
    if (activeLayer && activeLayer.id !== 'background') {
      const handles = getHandlesForLayer(activeLayer)
      for (const h of handles) {
        if (Math.abs(pos.x - h.x) < HANDLE_SIZE && Math.abs(pos.y - h.y) < HANDLE_SIZE) {
          setActiveHandle({ layerId: activeLayer.id, corner: h.id })
          resizeStart.current = { pos, layer: { ...activeLayer } }
          return
        }
      }
    }

    // Move layer with Ctrl
    if (ctrlHeld.current && activeLayer && activeLayer.id !== 'background') {
      if (pos.x >= activeLayer.x && pos.x <= activeLayer.x + activeLayer.width &&
          pos.y >= activeLayer.y && pos.y <= activeLayer.y + activeLayer.height) {
        setMovingLayer({ layerId: activeLayer.id, startX: pos.x, startY: pos.y, origX: activeLayer.x, origY: activeLayer.y })
        return
      }
    }

    if (activeTool === TOOLS.BRUSH) startBrush(pos)
    else if (activeTool === TOOLS.SHAPE) { drawStart.current = pos; isDrawing.current = true }
    else if (activeTool === TOOLS.STAMP) { doStamp(pos); stampActive.current = true }
    else if (activeTool === TOOLS.FILL) doFill(pos)
  }, [layers, activeLayerId, activeTool, brushColor, fillColor, brushSize, canvasWidth, canvasHeight, activeShape, shapeFilled, polygonSides, starPoints, starR1, starR2, stampTemplate, customStampImage])

  const onMouseMove = useCallback((e) => {
    const pos = getPos(e)

    // Canvas resize
    if (resizingCanvas) {
      const { mouseX, mouseY, w, h } = canvasResizeStart.current
      const nw = Math.max(100, w + pos.x - mouseX)
      const nh = Math.max(100, h + pos.y - mouseY)
      setCanvasSize(nw, nh)
      return
    }

    // Layer resize
    if (activeHandle) {
      const { layer } = resizeStart.current
      const { corner } = activeHandle
      let nx = layer.x, ny = layer.y, nw = layer.width, nh = layer.height

      if (corner === 'nw') { nx = pos.x; ny = pos.y; nw = layer.x + layer.width - pos.x; nh = layer.y + layer.height - pos.y }
      else if (corner === 'ne') { ny = pos.y; nw = pos.x - layer.x; nh = layer.y + layer.height - pos.y }
      else if (corner === 'sw') { nx = pos.x; nw = layer.x + layer.width - pos.x; nh = pos.y - layer.y }
      else if (corner === 'se') { nw = pos.x - layer.x; nh = pos.y - layer.y }

      if (shiftHeld.current) { const s = Math.max(nw, nh); nw = s; nh = s }
      nw = Math.max(10, nw); nh = Math.max(10, nh)
      // Clamp to canvas
      nx = Math.max(0, nx); ny = Math.max(0, ny)
      nw = Math.min(nw, canvasWidth - nx); nh = Math.min(nh, canvasHeight - ny)
      updateLayerSize(activeHandle.layerId, nx, ny, nw, nh)
      return
    }

    // Layer move
    if (movingLayer) {
      const dx = pos.x - movingLayer.startX
      const dy = pos.y - movingLayer.startY
      const layer = layers.find(l => l.id === movingLayer.layerId)
      if (layer) {
        const nx = Math.max(0, Math.min(canvasWidth - layer.width, movingLayer.origX + dx))
        const ny = Math.max(0, Math.min(canvasHeight - layer.height, movingLayer.origY + dy))
        updateLayerPosition(movingLayer.layerId, nx, ny)
      }
      return
    }

    if (activeTool === TOOLS.BRUSH && isDrawing.current) continueBrush(pos)
    else if (activeTool === TOOLS.SHAPE && isDrawing.current && drawStart.current) drawShapePreview(drawStart.current, pos)
    else if (activeTool === TOOLS.STAMP) {
      setStampPos(pos)
      if (stampActive.current) doStamp(pos)
    }
  }, [layers, activeLayerId, activeTool, activeHandle, movingLayer, resizingCanvas, brushColor, brushSize, canvasWidth, canvasHeight, activeShape, shapeFilled, polygonSides, starPoints, starR1, starR2, stampTemplate, customStampImage])

  const onMouseUp = useCallback((e) => {
    const pos = getPos(e)

    if (resizingCanvas) { setResizingCanvas(false); canvasResizeStart.current = null; return }
    if (activeHandle) { setActiveHandle(null); resizeStart.current = null; return }
    if (movingLayer) { setMovingLayer(null); return }

    if (activeTool === TOOLS.BRUSH && isDrawing.current) { isDrawing.current = false }
    else if (activeTool === TOOLS.SHAPE && isDrawing.current && drawStart.current) {
      finalizeShape(drawStart.current, pos)
      isDrawing.current = false
      drawStart.current = null
    } else if (activeTool === TOOLS.STAMP) { stampActive.current = false }
  }, [layers, activeLayerId, activeHandle, movingLayer, resizingCanvas, activeTool, activeShape, shapeFilled, brushColor, fillColor, brushSize, polygonSides, starPoints, starR1, starR2])

  const onMouseLeave = () => {
    setStampPos(null)
    if (activeTool === TOOLS.STAMP) stampActive.current = false
  }

  const getCursor = () => {
    if (activeHandle || resizingCanvas) return 'nwse-resize'
    if (movingLayer) return 'grabbing'
    if (ctrlHeld.current) return 'grab'
    if (activeTool === TOOLS.BRUSH) return 'crosshair'
    if (activeTool === TOOLS.FILL) return 'cell'
    if (activeTool === TOOLS.STAMP) return 'none'
    return 'crosshair'
  }

  const activeLayer = getActiveLayer()

  return (
    <div style={{
      flex: 1, overflow: 'auto', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-start',
      padding: '32px', background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: '24px 24px'
    }}>
      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        style={{
          position: 'relative',
          width: canvasWidth, height: canvasHeight,
          boxShadow: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 64px rgba(0,0,0,0.7), 0 0 80px rgba(124,58,237,0.06)',
          cursor: getCursor(),
          flexShrink: 0,
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        {/* Background canvas */}
        <canvas
          ref={bgCanvasRef}
          width={canvasWidth} height={canvasHeight}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        />

        {/* Drawing + Shape layers (bottom to top) */}
        {[...layers].reverse().map((layer, idx) => {
          if (layer.id === 'background') return null
          if (layer.type === LAYER_TYPES.DRAWING) {
            return (
              <canvas
                key={layer.id}
                ref={el => {
                  if (el) {
                    layerCanvasRefs.current[layer.id] = el
                    registerLayerCanvas(layer.id, el)
                  }
                }}
                width={layer.width} height={layer.height}
                style={{
                  position: 'absolute',
                  left: layer.x, top: layer.y,
                  zIndex: 2 + idx,
                  opacity: layer.visible ? (layer.opacity || 1) : 0,
                  pointerEvents: 'none'
                }}
              />
            )
          }
          if (layer.type === LAYER_TYPES.SHAPE) {
            return (
              <ShapeLayerRenderer
                key={layer.id}
                layer={layer}
                zIndex={2 + idx}
              />
            )
          }
          return null
        })}

        {/* Preview canvas */}
        <canvas
          ref={previewCanvasRef}
          width={canvasWidth} height={canvasHeight}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 999, pointerEvents: 'none' }}
        />

        {/* Active layer handles */}
        {activeLayer && activeLayer.id !== 'background' && (
          <LayerHandles layer={activeLayer} />
        )}

        {/* Stamp cursor */}
        {activeTool === TOOLS.STAMP && stampPos && (
          <div style={{
            position: 'absolute',
            left: stampPos.x - BRUSH_SIZES[brushSize] * 1.5,
            top: stampPos.y - BRUSH_SIZES[brushSize] * 1.5,
            width: BRUSH_SIZES[brushSize] * 3, height: BRUSH_SIZES[brushSize] * 3,
            border: '1.5px dashed rgba(255,255,255,0.5)',
            borderRadius: '50%', pointerEvents: 'none', zIndex: 1000,
            boxShadow: '0 0 8px rgba(0,0,0,0.5)'
          }}/>
        )}

        {/* Canvas resize marker */}
        <div style={{
          position: 'absolute', bottom: 0, right: 0, zIndex: 1001,
          width: '20px', height: '20px', cursor: 'nwse-resize',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
          padding: '3px'
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 10L10 2M6 10L10 6M10 10L10 10" stroke="rgba(124,58,237,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  )
}

// Shape layer renderer using SVG
function ShapeLayerRenderer({ layer, zIndex }) {
  const { shapeData, x, y, width, height, visible, opacity } = layer
  if (!shapeData) return null
  const { shape, filled, fillColor, strokeColor, strokeWidth, sides, points, r1ratio, r2ratio } = shapeData

  const getPath = () => {
    const cx = width/2, cy = height/2
    if (shape === 'rectangle') return `M0,0 H${width} V${height} H0 Z`
    if (shape === 'oval') {
      return `M${cx},0 A${cx},${cy} 0 1,0 ${cx},${height} A${cx},${cy} 0 1,0 ${cx},0`
    }
    if (shape === 'polygon') {
      const r = Math.min(width, height)/2
      const pts = Array.from({length: sides}, (_, i) => {
        const a = (i/sides)*Math.PI*2 - Math.PI/2
        return `${cx + r*Math.cos(a)},${cy + r*Math.sin(a)}`
      })
      return `M${pts.join('L')}Z`
    }
    if (shape === 'star') {
      const base = Math.min(width, height)/2
      const r1 = base * (r1ratio || 1)
      const r2 = base * (r2ratio || 0.5)
      const n = points || 5
      const pts = Array.from({length: n*2}, (_, i) => {
        const a = (i/(n*2))*Math.PI*2 - Math.PI/2
        const r = i%2===0 ? r1 : r2
        return `${cx + r*Math.cos(a)},${cy + r*Math.sin(a)}`
      })
      return `M${pts.join('L')}Z`
    }
    return ''
  }

  return (
    <svg
      style={{ position: 'absolute', left: x, top: y, zIndex, opacity: visible ? (opacity||1) : 0, overflow: 'visible', pointerEvents: 'none' }}
      width={width} height={height} viewBox={`0 0 ${width} ${height}`}
    >
      <path
        d={getPath()}
        fill={filled ? fillColor : 'none'}
        stroke={strokeColor}
        strokeWidth={strokeWidth || 2}
      />
    </svg>
  )
}

function LayerHandles({ layer }) {
  const handles = [
    { id: 'nw', x: layer.x, y: layer.y },
    { id: 'ne', x: layer.x + layer.width, y: layer.y },
    { id: 'sw', x: layer.x, y: layer.y + layer.height },
    { id: 'se', x: layer.x + layer.width, y: layer.y + layer.height },
  ]

  return (
    <>
      {/* Border */}
      <div style={{
        position: 'absolute',
        left: layer.x, top: layer.y, width: layer.width, height: layer.height,
        border: '1px dashed rgba(124,58,237,0.6)',
        pointerEvents: 'none', zIndex: 998,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.3)'
      }}/>
      {/* Handles */}
      {handles.map(h => (
        <div key={h.id} style={{
          position: 'absolute',
          left: h.x - HANDLE_SIZE/2, top: h.y - HANDLE_SIZE/2,
          width: HANDLE_SIZE, height: HANDLE_SIZE,
          background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
          border: '2px solid rgba(255,255,255,0.9)',
          borderRadius: '3px',
          pointerEvents: 'none', zIndex: 999,
          boxShadow: '0 2px 8px rgba(0,0,0,0.5), 0 0 8px rgba(124,58,237,0.4)'
        }}/>
      ))}
    </>
  )
}
