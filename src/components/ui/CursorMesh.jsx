import { useEffect, useRef } from 'react'
import '../../styles/cursor-mesh.css'

const GRID = 74
const JITTER = 13
const HEAD_RADIUS = 220
const TRAIL_RADIUS = 145
const TRAIL_LIFE = 850
const MAX_TRAIL = 22

function noise(row, column, axis) {
  const value = Math.sin(row * 127.1 + column * 311.7 + axis * 74.7) * 43758.5453
  return (value - Math.floor(value)) * 2 - 1
}

/** Decorative canvas that reveals a fixed mesh through a soft cursor mask. */
export default function CursorMesh() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return undefined

    const meshCanvas = document.createElement('canvas')
    const meshContext = meshCanvas.getContext('2d', { alpha: true })
    if (!meshContext) return undefined

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const trail = []
    const target = { x: 0, y: 0 }
    const follower = { x: 0, y: 0 }
    let width = 0
    let height = 0
    let pixelRatio = 1
    let frame = 0
    let lastFrame = 0
    let enabled = false
    let pointerInside = false
    let pointerSeen = false
    let pointerLeftAt = 0

    function buildMesh() {
      meshContext.clearRect(0, 0, width, height)
      const style = getComputedStyle(canvas)
      const lineOpacity = Number.parseFloat(style.getPropertyValue('--cursor-mesh-line-opacity')) || 0.3
      const rows = Math.ceil(height / GRID) + 3
      const columns = Math.ceil(width / GRID) + 3
      const points = Array.from({ length: rows }, (_, row) =>
        Array.from({ length: columns }, (_, column) => ({
          x: (column - 1) * GRID + noise(row, column, 1) * JITTER,
          y: (row - 1) * GRID + noise(row, column, 2) * JITTER,
        })),
      )

      meshContext.strokeStyle = style.color
      meshContext.lineWidth = 0.8
      meshContext.globalAlpha = lineOpacity
      meshContext.beginPath()
      for (let row = 0; row < rows - 1; row += 1) {
        for (let column = 0; column < columns - 1; column += 1) {
          const topLeft = points[row][column]
          const topRight = points[row][column + 1]
          const bottomLeft = points[row + 1][column]
          const bottomRight = points[row + 1][column + 1]
          meshContext.moveTo(topLeft.x, topLeft.y)
          meshContext.lineTo(topRight.x, topRight.y)
          meshContext.moveTo(topLeft.x, topLeft.y)
          meshContext.lineTo(bottomLeft.x, bottomLeft.y)
          if ((row + column) % 2) {
            meshContext.moveTo(topLeft.x, topLeft.y)
            meshContext.lineTo(bottomRight.x, bottomRight.y)
          } else {
            meshContext.moveTo(topRight.x, topRight.y)
            meshContext.lineTo(bottomLeft.x, bottomLeft.y)
          }
          if (row === rows - 2) {
            meshContext.moveTo(bottomLeft.x, bottomLeft.y)
            meshContext.lineTo(bottomRight.x, bottomRight.y)
          }
          if (column === columns - 2) {
            meshContext.moveTo(topRight.x, topRight.y)
            meshContext.lineTo(bottomRight.x, bottomRight.y)
          }
        }
      }
      meshContext.stroke()

      meshContext.globalAlpha = lineOpacity * 1.45
      meshContext.fillStyle = style.color
      for (let row = 0; row < rows; row += 2) {
        for (let column = 0; column < columns; column += 2) {
          const point = points[row][column]
          meshContext.beginPath()
          meshContext.arc(point.x, point.y, 1.15, 0, Math.PI * 2)
          meshContext.fill()
        }
      }
      meshContext.globalAlpha = 1
    }

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      meshCanvas.width = canvas.width
      meshCanvas.height = canvas.height
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      meshContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      buildMesh()
      if (pointerSeen) schedule()
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      lastFrame = 0
      trail.length = 0
      context.clearRect(0, 0, width, height)
    }

    function schedule() {
      if (enabled && !frame) frame = requestAnimationFrame(draw)
    }

    function reveal(x, y, radius, opacity) {
      const gradient = context.createRadialGradient(x, y, 0, x, y, radius)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`)
      gradient.addColorStop(0.38, `rgba(255, 255, 255, ${opacity * 0.6})`)
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      context.fillStyle = gradient
      context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    }

    function draw(now) {
      frame = 0
      const elapsed = Math.min(now - (lastFrame || now), 48)
      lastFrame = now
      context.clearRect(0, 0, width, height)
      while (trail.length && now - trail[0].time > TRAIL_LIFE) trail.shift()

      const distance = Math.hypot(target.x - follower.x, target.y - follower.y)
      if (pointerInside && distance > 0.3) {
        const easing = 1 - Math.pow(0.8, elapsed / 16)
        follower.x += (target.x - follower.x) * easing
        follower.y += (target.y - follower.y) * easing
        const last = trail[trail.length - 1]
        const moved = last ? Math.hypot(follower.x - last.x, follower.y - last.y) : Infinity
        if (moved > 18 || (last && now - last.time > 55 && moved > 4)) {
          trail.push({ x: follower.x, y: follower.y, time: now })
          if (trail.length > MAX_TRAIL) trail.shift()
        }
      }

      const headOpacity = pointerInside ? 0.88 : Math.max(0, 0.88 * (1 - (now - pointerLeftAt) / 550))
      let minX = width
      let minY = height
      let maxX = 0
      let maxY = 0
      function expandBounds(x, y, radius) {
        minX = Math.min(minX, x - radius)
        minY = Math.min(minY, y - radius)
        maxX = Math.max(maxX, x + radius)
        maxY = Math.max(maxY, y + radius)
      }

      for (const point of trail) {
        const life = 1 - (now - point.time) / TRAIL_LIFE
        const opacity = Math.max(0, life * life * 0.1)
        if (opacity > 0) {
          reveal(point.x, point.y, TRAIL_RADIUS, opacity)
          expandBounds(point.x, point.y, TRAIL_RADIUS)
        }
      }
      if (headOpacity > 0) {
        reveal(follower.x, follower.y, HEAD_RADIUS, headOpacity)
        expandBounds(follower.x, follower.y, HEAD_RADIUS)
      }

      // Source-in paints the cached geometry only inside the radial alpha mask.
      minX = Math.max(0, Math.floor(minX))
      minY = Math.max(0, Math.floor(minY))
      maxX = Math.min(width, Math.ceil(maxX))
      maxY = Math.min(height, Math.ceil(maxY))
      if (maxX > minX && maxY > minY) {
        context.globalCompositeOperation = 'source-in'
        context.drawImage(
          meshCanvas,
          minX * pixelRatio, minY * pixelRatio,
          (maxX - minX) * pixelRatio, (maxY - minY) * pixelRatio,
          minX, minY, maxX - minX, maxY - minY,
        )
        context.globalCompositeOperation = 'source-over'
      }

      if ((pointerInside && distance > 0.3) || trail.length || (!pointerInside && headOpacity > 0)) schedule()
    }

    function onPointerMove(event) {
      if (!enabled || event.pointerType !== 'mouse' || !event.isPrimary) return
      target.x = event.clientX
      target.y = event.clientY
      if (!pointerInside || Math.hypot(target.x - follower.x, target.y - follower.y) > 300) {
        follower.x = target.x
        follower.y = target.y
        trail.length = 0
      }
      pointerInside = true
      pointerSeen = true
      schedule()
    }

    function onPointerLeave() {
      if (!pointerInside) return
      pointerInside = false
      pointerLeftAt = performance.now()
      schedule()
    }

    function syncEnabled() {
      const shouldEnable = finePointer.matches && !reducedMotion.matches && !document.hidden
      if (enabled === shouldEnable) return
      enabled = shouldEnable
      if (!enabled) {
        pointerInside = false
        pointerSeen = false
        stop()
      }
    }

    const themeObserver = new MutationObserver(() => {
      buildMesh()
      if (pointerSeen) schedule()
    })

    resize()
    syncEnabled()
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('blur', onPointerLeave)
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    document.addEventListener('visibilitychange', syncEnabled)
    finePointer.addEventListener('change', syncEnabled)
    reducedMotion.addEventListener('change', syncEnabled)

    return () => {
      stop()
      themeObserver.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('blur', onPointerLeave)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
      document.removeEventListener('visibilitychange', syncEnabled)
      finePointer.removeEventListener('change', syncEnabled)
      reducedMotion.removeEventListener('change', syncEnabled)
    }
  }, [])

  return <canvas ref={canvasRef} className="cursor-mesh" aria-hidden="true" />
}
