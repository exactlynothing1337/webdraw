export function drawShape(ctx, shape, x1, y1, x2, y2, opts = {}) {
  const { fillColor, strokeColor, strokeWidth = 2, filled = true, polygonSides = 6, starPoints = 5, r1ratio = 1, r2ratio = 0.5, shift = false } = opts
  let rx = Math.min(x1, x2), ry = Math.min(y1, y2)
  let rw = Math.abs(x2 - x1), rh = Math.abs(y2 - y1)

  if (shift) {
    const side = Math.min(rw, rh)
    rw = side; rh = side
    if (x2 < x1) rx = x1 - side
    if (y2 < y1) ry = y1 - side
  }

  ctx.save()
  if (filled && fillColor) ctx.fillStyle = fillColor
  if (strokeColor) { ctx.strokeStyle = strokeColor; ctx.lineWidth = strokeWidth }

  ctx.beginPath()
  if (shape === 'rectangle') {
    ctx.rect(rx, ry, rw, rh)
  } else if (shape === 'oval') {
    ctx.ellipse(rx + rw/2, ry + rh/2, rw/2, rh/2, 0, 0, Math.PI*2)
  } else if (shape === 'polygon') {
    const cx = rx + rw/2, cy = ry + rh/2
    const r = Math.min(rw, rh) / 2
    for (let i = 0; i < polygonSides; i++) {
      const a = (i / polygonSides) * Math.PI * 2 - Math.PI/2
      i === 0 ? ctx.moveTo(cx + r*Math.cos(a), cy + r*Math.sin(a)) : ctx.lineTo(cx + r*Math.cos(a), cy + r*Math.sin(a))
    }
    ctx.closePath()
  } else if (shape === 'star') {
    const cx = rx + rw/2, cy = ry + rh/2
    const base = Math.min(rw, rh) / 2
    const r1 = base * r1ratio
    const r2 = base * r2ratio
    for (let i = 0; i < starPoints*2; i++) {
      const a = (i / (starPoints*2)) * Math.PI * 2 - Math.PI/2
      const r = i % 2 === 0 ? r1 : r2
      i === 0 ? ctx.moveTo(cx + r*Math.cos(a), cy + r*Math.sin(a)) : ctx.lineTo(cx + r*Math.cos(a), cy + r*Math.sin(a))
    }
    ctx.closePath()
  }

  if (filled) ctx.fill()
  else ctx.stroke()
  ctx.restore()

  return { x: rx, y: ry, w: rw, h: rh }
}

export function floodFill(canvas, startX, startY, fillColorHex) {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const w = canvas.width, h = canvas.height

  const idx = (x, y) => (y * w + x) * 4
  const startIdx = idx(startX, startY)
  const targetR = data[startIdx], targetG = data[startIdx+1], targetB = data[startIdx+2], targetA = data[startIdx+3]

  const fillRGB = hexToRGB(fillColorHex)
  if (!fillRGB) return

  if (targetR === fillRGB.r && targetG === fillRGB.g && targetB === fillRGB.b && targetA === 255) return

  const match = (x, y) => {
    const i = idx(x, y)
    return Math.abs(data[i] - targetR) < 30 && Math.abs(data[i+1] - targetG) < 30 && Math.abs(data[i+2] - targetB) < 30 && Math.abs(data[i+3] - targetA) < 30
  }

  const stack = [[startX, startY]]
  const visited = new Uint8Array(w * h)

  while (stack.length) {
    const [x, y] = stack.pop()
    if (x < 0 || x >= w || y < 0 || y >= h) continue
    if (visited[y * w + x]) continue
    if (!match(x, y)) continue
    visited[y * w + x] = 1
    const i = idx(x, y)
    data[i] = fillRGB.r; data[i+1] = fillRGB.g; data[i+2] = fillRGB.b; data[i+3] = 255
    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1])
  }
  ctx.putImageData(imageData, 0, 0)
}

export function hexToRGB(hex) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  return { r, g, b }
}

export function drawStampTemplate(ctx, template, cx, cy, size) {
  ctx.save()
  ctx.translate(cx, cy)
  const s = size / 2
  ctx.beginPath()
  if (template === 'star') {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI/2
      const r = i % 2 === 0 ? s : s * 0.4
      i === 0 ? ctx.moveTo(r*Math.cos(a), r*Math.sin(a)) : ctx.lineTo(r*Math.cos(a), r*Math.sin(a))
    }
    ctx.closePath()
  } else if (template === 'heart') {
    ctx.moveTo(0, s * 0.3)
    ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.2, s * 0.8, 0, s)
    ctx.bezierCurveTo(s * 1.2, s * 0.8, s, -s * 0.5, 0, s * 0.3)
  } else if (template === 'lightning') {
    ctx.moveTo(s * 0.3, -s)
    ctx.lineTo(-s * 0.2, 0)
    ctx.lineTo(s * 0.2, 0)
    ctx.lineTo(-s * 0.3, s)
    ctx.lineTo(s * 0.1, s * 0.1)
    ctx.lineTo(-s * 0.1, s * 0.1)
    ctx.closePath()
  } else if (template === 'flower') {
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2
      ctx.ellipse(Math.cos(a)*s*0.4, Math.sin(a)*s*0.4, s*0.3, s*0.15, a, 0, Math.PI*2)
      ctx.moveTo(0,0)
    }
    ctx.arc(0, 0, s*0.2, 0, Math.PI*2)
  }
  ctx.restore()
}

export function stampAt(canvas, template, customImg, cx, cy, size, color) {
  const ctx = canvas.getContext('2d')
  if (customImg) {
    ctx.drawImage(customImg, cx - size/2, cy - size/2, size, size)
    return
  }
  ctx.save()
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.translate(cx, cy)
  const s = size / 2
  ctx.beginPath()
  if (template === 'star') {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 - Math.PI/2
      const r = i % 2 === 0 ? s : s * 0.4
      i === 0 ? ctx.moveTo(r*Math.cos(a), r*Math.sin(a)) : ctx.lineTo(r*Math.cos(a), r*Math.sin(a))
    }
    ctx.closePath()
    ctx.fill()
  } else if (template === 'heart') {
    ctx.moveTo(0, s * 0.3)
    ctx.bezierCurveTo(-s, -s * 0.5, -s * 1.2, s * 0.8, 0, s)
    ctx.bezierCurveTo(s * 1.2, s * 0.8, s, -s * 0.5, 0, s * 0.3)
    ctx.fill()
  } else if (template === 'lightning') {
    ctx.moveTo(s * 0.3, -s)
    ctx.lineTo(-s * 0.2, 0)
    ctx.lineTo(s * 0.2, 0)
    ctx.lineTo(-s * 0.3, s)
    ctx.lineTo(s * 0.1, s * 0.1)
    ctx.lineTo(-s * 0.1, s * 0.1)
    ctx.closePath()
    ctx.fill()
  } else if (template === 'flower') {
    ctx.fillStyle = color
    for (let i = 0; i < 6; i++) {
      ctx.save()
      const a = (i / 6) * Math.PI * 2
      ctx.rotate(a)
      ctx.beginPath()
      ctx.ellipse(s*0.4, 0, s*0.3, s*0.15, 0, 0, Math.PI*2)
      ctx.fill()
      ctx.restore()
    }
    ctx.beginPath()
    ctx.arc(0, 0, s*0.2, 0, Math.PI*2)
    ctx.fillStyle = '#fff'
    ctx.fill()
  }
  ctx.restore()
}
