import { useEffect, useRef } from 'react'
import '../../styles/cursor-mesh.css'

const TRAIL_LIFETIME = 900
const MAX_POINTS = 28
const MIN_DISTANCE = 7

/** Decorative canvas; it never receives focus or pointer input. */
export default function CursorMesh() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d', { alpha: true })
    if (!canvas || !context) return undefined

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const points = []
    let frame = 0
    let width = 0
    let height = 0
    let enabled = false

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      points.length = 0
      context.clearRect(0, 0, width, height)
    }

    function draw(now) {
      frame = 0
      context.clearRect(0, 0, width, height)

      while (points.length && now - points[0].time > TRAIL_LIFETIME) points.shift()
      if (!points.length) return

      const color = getComputedStyle(canvas).color
      const vertices = points.map((point, index) => {
        const previous = points[Math.max(0, index - 1)]
        const next = points[Math.min(points.length - 1, index + 1)]
        const directionX = next.x - previous.x
        const directionY = next.y - previous.y
        const length = Math.hypot(directionX, directionY) || 1
        const fade = Math.max(0, 1 - (now - point.time) / TRAIL_LIFETIME)
        const taper = (index + 1) / points.length
        const spread = (3 + 13 * taper) * fade
        const normalX = -directionY / length
        const normalY = directionX / length

        return {
          center: point,
          left: { x: point.x + normalX * spread, y: point.y + normalY * spread },
          right: { x: point.x - normalX * spread, y: point.y - normalY * spread },
          alpha: fade * (0.25 + 0.75 * taper),
        }
      })

      context.strokeStyle = color
      context.lineWidth = 0.75
      for (let index = 1; index < vertices.length; index += 1) {
        const previous = vertices[index - 1]
        const current = vertices[index]
        context.globalAlpha = Math.min(previous.alpha, current.alpha) * 0.38
        context.beginPath()
        context.moveTo(previous.left.x, previous.left.y)
        context.lineTo(current.left.x, current.left.y)
        context.lineTo(previous.right.x, previous.right.y)
        context.lineTo(current.right.x, current.right.y)
        context.lineTo(current.left.x, current.left.y)
        context.moveTo(previous.center.x, previous.center.y)
        context.lineTo(current.center.x, current.center.y)
        context.stroke()
      }

      for (let index = 0; index < vertices.length; index += 3) {
        const vertex = vertices[index]
        context.globalAlpha = vertex.alpha * 0.55
        context.fillStyle = color
        context.beginPath()
        context.arc(vertex.center.x, vertex.center.y, 1.1, 0, Math.PI * 2)
        context.fill()
      }

      context.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }

    function onPointerMove(event) {
      if (!enabled || event.pointerType !== 'mouse' || !event.isPrimary) return
      const now = performance.now()
      const last = points[points.length - 1]
      const distance = last ? Math.hypot(event.clientX - last.x, event.clientY - last.y) : Infinity
      if (distance < MIN_DISTANCE) return
      if (distance > 180) points.length = 0

      points.push({ x: event.clientX, y: event.clientY, time: now })
      if (points.length > MAX_POINTS) points.shift()
      if (!frame) frame = requestAnimationFrame(draw)
    }

    function syncEnabled() {
      const shouldEnable = finePointer.matches && !reducedMotion.matches && !document.hidden
      if (enabled === shouldEnable) return
      enabled = shouldEnable
      if (!enabled) stop()
    }

    resize()
    syncEnabled()
    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', syncEnabled)
    finePointer.addEventListener('change', syncEnabled)
    reducedMotion.addEventListener('change', syncEnabled)

    return () => {
      stop()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', syncEnabled)
      finePointer.removeEventListener('change', syncEnabled)
      reducedMotion.removeEventListener('change', syncEnabled)
    }
  }, [])

  return <canvas ref={canvasRef} className="cursor-mesh" aria-hidden="true" />
}
