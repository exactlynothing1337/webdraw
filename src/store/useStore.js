import { create } from 'zustand'
import { produce } from 'immer'

let layerIdCounter = 0
export const genLayerId = () => `layer_${++layerIdCounter}`

export const LAYER_TYPES = {
  BACKGROUND: 'background',
  DRAWING: 'drawing',
  SHAPE: 'shape',
}

export const TOOLS = {
  BRUSH: 'brush',
  SHAPE: 'shape',
  STAMP: 'stamp',
  FILL: 'fill',
}

export const SHAPES = {
  RECTANGLE: 'rectangle',
  OVAL: 'oval',
  POLYGON: 'polygon',
  STAR: 'star',
}

export const BRUSH_SIZES = [4, 10, 20]
export const STAMP_TEMPLATES = ['star', 'heart', 'lightning', 'flower']

const createBackgroundLayer = (w, h, bgColor) => ({
  id: 'background',
  type: LAYER_TYPES.BACKGROUND,
  name: 'Background',
  x: 0, y: 0,
  width: w, height: h,
  visible: true,
  locked: false,
  opacity: 1,
  bgColor,
  canvas: null,
})

const createDrawingLayer = (x, y, w, h, name) => ({
  id: genLayerId(),
  type: LAYER_TYPES.DRAWING,
  name: name || 'Drawing Layer',
  x, y, width: w, height: h,
  visible: true,
  locked: false,
  opacity: 1,
  canvas: null,
})

const createShapeLayer = (x, y, w, h, shapeData) => ({
  id: genLayerId(),
  type: LAYER_TYPES.SHAPE,
  name: `Shape (${shapeData.shape})`,
  x, y, width: w, height: h,
  visible: true,
  locked: false,
  opacity: 1,
  shapeData,
})

export const useStore = create((set, get) => ({
  // Canvas settings
  canvasWidth: 800,
  canvasHeight: 600,
  canvasInitialized: false,
  showCanvasDialog: true,

  // Layers (top to bottom order for rendering: first in array = top)
  layers: [],
  activeLayerId: null,

  // Tools
  activeTool: TOOLS.BRUSH,
  activeShape: SHAPES.RECTANGLE,
  brushSize: 0, // index into BRUSH_SIZES
  brushColor: '#7c3aed',
  fillColor: '#a855f7',
  shapeFilled: true,
  polygonSides: 6,
  starPoints: 5,
  starR1: 60,
  starR2: 30,
  stampTemplate: 'star',
  customStampImage: null,
  showFillColor: true, // toggle between brush/fill color in picker

  // Undo/Redo
  undoStack: [], // max 3
  redoStack: [],

  // Resize drag state
  resizingLayerId: null,
  resizeHandle: null,

  // Moving layer
  movingLayerId: null,

  // Color picker
  showColorPicker: false,
  recentColors: ['#7c3aed', '#06b6d4', '#ef4444', '#22c55e', '#f59e0b', '#f1f0ff'],

  // Shape preview
  shapePreview: null,

  // Canvas resize marker
  canvasResizing: false,

  initCanvas(width, height, bgColor) {
    const bg = createBackgroundLayer(width, height, bgColor)
    const draw = createDrawingLayer(0, 0, width, height, 'Layer 1')
    set({
      canvasWidth: width,
      canvasHeight: height,
      canvasInitialized: true,
      showCanvasDialog: false,
      layers: [draw, bg],
      activeLayerId: draw.id,
      undoStack: [],
      redoStack: [],
    })
  },

  setCanvasSize(width, height) {
    set(produce(state => {
      state.canvasWidth = width
      state.canvasHeight = height
      const bg = state.layers.find(l => l.id === 'background')
      if (bg) { bg.width = width; bg.height = height }
    }))
  },

  setActiveTool(tool) { set({ activeTool: tool }) },
  setActiveShape(shape) { set({ activeShape: shape }) },
  setBrushSize(idx) { set({ brushSize: idx }) },
  setBrushColor(c) {
    set(produce(state => {
      state.brushColor = c
      if (!state.recentColors.includes(c)) {
        state.recentColors.unshift(c)
        state.recentColors = state.recentColors.slice(0, 12)
      }
    }))
  },
  setFillColor(c) {
    set(produce(state => {
      state.fillColor = c
      if (!state.recentColors.includes(c)) {
        state.recentColors.unshift(c)
        state.recentColors = state.recentColors.slice(0, 12)
      }
    }))
  },
  setShapeFilled(v) { set({ shapeFilled: v }) },
  setPolygonSides(n) { set({ polygonSides: Math.max(3, n) }) },
  setStarPoints(n) { set({ starPoints: Math.max(3, n) }) },
  setStarR1(v) { set({ starR1: v }) },
  setStarR2(v) { set({ starR2: v }) },
  setStampTemplate(t) { set({ stampTemplate: t }) },
  setCustomStampImage(img) { set({ customStampImage: img }) },
  setShowFillColor(v) { set({ showFillColor: v }) },
  setShapePreview(p) { set({ shapePreview: p }) },

  setActiveLayer(id) { set({ activeLayerId: id }) },

  registerLayerCanvas(id, canvas) {
    set(produce(state => {
      const l = state.layers.find(l => l.id === id)
      if (l) l.canvas = canvas
    }))
  },

  addDrawingLayer() {
    const { canvasWidth, canvasHeight } = get()
    const layer = createDrawingLayer(0, 0, canvasWidth, canvasHeight, `Layer ${get().layers.length}`)
    set(produce(state => {
      const bgIdx = state.layers.findIndex(l => l.id === 'background')
      state.layers.splice(bgIdx, 0, layer)
    }))
    set({ activeLayerId: layer.id })
    return layer.id
  },

  addShapeLayer(x, y, w, h, shapeData) {
    const layer = createShapeLayer(x, y, w, h, shapeData)
    set(produce(state => {
      const activeIdx = state.layers.findIndex(l => l.id === state.activeLayerId)
      const insertAt = activeIdx >= 0 ? activeIdx : 0
      state.layers.splice(insertAt, 0, layer)
    }))
    set({ activeLayerId: layer.id })
    return layer.id
  },

  removeLayer(id) {
    if (id === 'background') return
    set(produce(state => {
      state.layers = state.layers.filter(l => l.id !== id)
      if (state.activeLayerId === id) {
        state.activeLayerId = state.layers.find(l => l.id !== 'background')?.id || null
      }
    }))
  },

  moveLayerUp(id) {
    if (id === 'background') return
    set(produce(state => {
      const idx = state.layers.findIndex(l => l.id === id)
      if (idx > 0 && state.layers[idx - 1].id !== 'background') {
        ;[state.layers[idx - 1], state.layers[idx]] = [state.layers[idx], state.layers[idx - 1]]
      }
    }))
  },

  moveLayerDown(id) {
    if (id === 'background') return
    set(produce(state => {
      const idx = state.layers.findIndex(l => l.id === id)
      if (idx < state.layers.length - 2) {
        ;[state.layers[idx], state.layers[idx + 1]] = [state.layers[idx + 1], state.layers[idx]]
      }
    }))
  },

  updateLayerPosition(id, x, y) {
    set(produce(state => {
      const l = state.layers.find(l => l.id === id)
      if (l) { l.x = x; l.y = y }
    }))
  },

  updateLayerSize(id, x, y, w, h) {
    set(produce(state => {
      const l = state.layers.find(l => l.id === id)
      if (l) { l.x = x; l.y = y; l.width = w; l.height = h }
    }))
  },

  updateLayerOpacity(id, opacity) {
    set(produce(state => {
      const l = state.layers.find(l => l.id === id)
      if (l) l.opacity = opacity
    }))
  },

  toggleLayerVisible(id) {
    set(produce(state => {
      const l = state.layers.find(l => l.id === id)
      if (l) l.visible = !l.visible
    }))
  },

  // Undo/Redo
  saveUndoState() {
    const { layers, undoStack } = get()
    const snapshot = layers.map(l => ({
      ...l,
      imageData: l.canvas ? (() => {
        try { return l.canvas.getContext('2d').getImageData(0, 0, l.width, l.height) } catch { return null }
      })() : null
    }))
    set(produce(state => {
      state.undoStack.push(snapshot)
      if (state.undoStack.length > 3) state.undoStack.shift()
      state.redoStack = []
    }))
  },

  undo() {
    const { undoStack, redoStack, layers } = get()
    if (!undoStack.length) return
    const current = layers.map(l => ({
      ...l,
      imageData: l.canvas ? (() => {
        try { return l.canvas.getContext('2d').getImageData(0, 0, l.width, l.height) } catch { return null }
      })() : null
    }))
    const prev = undoStack[undoStack.length - 1]
    set(produce(state => {
      state.redoStack.push(current)
      state.undoStack.pop()
    }))
    get()._restoreSnapshot(prev)
  },

  redo() {
    const { redoStack, layers } = get()
    if (!redoStack.length) return
    const current = layers.map(l => ({
      ...l,
      imageData: l.canvas ? (() => {
        try { return l.canvas.getContext('2d').getImageData(0, 0, l.width, l.height) } catch { return null }
      })() : null
    }))
    const next = redoStack[redoStack.length - 1]
    set(produce(state => {
      state.undoStack.push(current)
      if (state.undoStack.length > 3) state.undoStack.shift()
      state.redoStack.pop()
    }))
    get()._restoreSnapshot(next)
  },

  _restoreSnapshot(snapshot) {
    set(produce(state => {
      state.layers = snapshot.map(s => {
        const existing = state.layers.find(l => l.id === s.id)
        return { ...s, canvas: existing?.canvas || null }
      })
    }))
    // Restore canvas content after state update
    setTimeout(() => {
      snapshot.forEach(s => {
        const l = get().layers.find(l => l.id === s.id)
        if (l?.canvas && s.imageData) {
          const ctx = l.canvas.getContext('2d')
          ctx.clearRect(0, 0, l.canvas.width, l.canvas.height)
          ctx.putImageData(s.imageData, 0, 0)
        }
      })
    }, 0)
  },

  // Save project
  saveProject() {
    const { layers, canvasWidth, canvasHeight, brushColor, fillColor } = get()
    const data = {
      version: '1.0',
      canvasWidth, canvasHeight,
      brushColor, fillColor,
      layers: layers.map(l => {
        const base = { id: l.id, type: l.type, name: l.name, x: l.x, y: l.y, width: l.width, height: l.height, visible: l.visible, opacity: l.opacity }
        if (l.type === LAYER_TYPES.BACKGROUND) base.bgColor = l.bgColor
        if (l.type === LAYER_TYPES.SHAPE) base.shapeData = l.shapeData
        if (l.canvas) {
          try { base.canvasData = l.canvas.toDataURL('image/png') } catch {}
        }
        return base
      })
    }
    const str = JSON.stringify(data, null, 2)
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const fname = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.sdp`
    const blob = new Blob([str], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = fname
    a.click()
  },

  loadProject(jsonStr) {
    try {
      const data = JSON.parse(jsonStr)
      set(produce(state => {
        state.canvasWidth = data.canvasWidth || 800
        state.canvasHeight = data.canvasHeight || 600
        state.brushColor = data.brushColor || '#7c3aed'
        state.fillColor = data.fillColor || '#a855f7'
        state.canvasInitialized = true
        state.showCanvasDialog = false
        state.undoStack = []
        state.redoStack = []
        state.layers = data.layers.map(l => ({ ...l, canvas: null }))
        state.activeLayerId = data.layers.find(l => l.type !== LAYER_TYPES.BACKGROUND)?.id || null
      }))
      // Restore canvas images
      setTimeout(() => {
        data.layers.forEach(l => {
          if (l.canvasData) {
            const layer = get().layers.find(ll => ll.id === l.id)
            if (layer?.canvas) {
              const img = new Image()
              img.onload = () => {
                const ctx = layer.canvas.getContext('2d')
                ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height)
                ctx.drawImage(img, 0, 0)
              }
              img.src = l.canvasData
            }
          }
        })
      }, 100)
    } catch (e) {
      console.error('Failed to load project', e)
    }
  },

  saveJPEG() {
    const { layers, canvasWidth, canvasHeight } = get()
    const offscreen = document.createElement('canvas')
    offscreen.width = canvasWidth
    offscreen.height = canvasHeight
    const ctx = offscreen.getContext('2d')
    // Draw from bottom to top (reverse layer order)
    const reversed = [...layers].reverse()
    reversed.forEach(layer => {
      if (!layer.visible) return
      ctx.save()
      ctx.globalAlpha = layer.opacity
      if (layer.type === LAYER_TYPES.BACKGROUND) {
        ctx.fillStyle = layer.bgColor || '#ffffff'
        ctx.fillRect(0, 0, canvasWidth, canvasHeight)
      } else if (layer.canvas) {
        ctx.drawImage(layer.canvas, layer.x, layer.y)
      } else if (layer.type === LAYER_TYPES.SHAPE && layer.shapeData) {
        // Draw shape vector
        drawShapeToContext(ctx, layer)
      }
      ctx.restore()
    })
    const now = new Date()
    const pad = n => String(n).padStart(2, '0')
    const fname = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.jpg`
    const a = document.createElement('a')
    a.href = offscreen.toDataURL('image/jpeg', 0.95)
    a.download = fname
    a.click()
  },
}))

function drawShapeToContext(ctx, layer) {
  const { shapeData, x, y, width, height } = layer
  if (!shapeData) return
  ctx.save()
  ctx.translate(x, y)
  const { shape, fillColor, strokeColor, strokeWidth, filled } = shapeData
  if (filled && fillColor) { ctx.fillStyle = fillColor }
  if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = strokeWidth || 2 }
  ctx.beginPath()
  if (shape === 'rectangle') {
    ctx.rect(0, 0, width, height)
  } else if (shape === 'oval') {
    ctx.ellipse(width/2, height/2, width/2, height/2, 0, 0, Math.PI*2)
  } else if (shape === 'polygon') {
    const sides = shapeData.sides || 6
    const cx = width/2, cy = height/2
    const r = Math.min(width, height)/2
    for (let i = 0; i < sides; i++) {
      const a = (i / sides) * Math.PI * 2 - Math.PI/2
      i === 0 ? ctx.moveTo(cx + r*Math.cos(a), cy + r*Math.sin(a)) : ctx.lineTo(cx + r*Math.cos(a), cy + r*Math.sin(a))
    }
    ctx.closePath()
  } else if (shape === 'star') {
    const pts = shapeData.points || 5
    const cx = width/2, cy = height/2
    const r1 = (Math.min(width,height)/2) * (shapeData.r1ratio || 1)
    const r2 = (Math.min(width,height)/2) * (shapeData.r2ratio || 0.5)
    for (let i = 0; i < pts*2; i++) {
      const a = (i / (pts*2)) * Math.PI * 2 - Math.PI/2
      const r = i % 2 === 0 ? r1 : r2
      i === 0 ? ctx.moveTo(cx + r*Math.cos(a), cy + r*Math.sin(a)) : ctx.lineTo(cx + r*Math.cos(a), cy + r*Math.sin(a))
    }
    ctx.closePath()
  }
  if (filled) ctx.fill()
  else ctx.stroke()
  ctx.restore()
}
