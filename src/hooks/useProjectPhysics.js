import { useCallback, useEffect, useRef } from 'react'
import Matter from 'matter-js'

const { Bodies, Body, Composite, Constraint, Engine, Sleeping, Vector } = Matter
const STEP = 1000 / 60
const DRAG_THRESHOLD = 6

/** Physics owns only the untransformed DOM wrappers. React owns their content. */
export default function useProjectPhysics({ boardRef, cardRefs, projectIds, enabled, paused, onDraggingChange }) {
  const control = useRef(null)
  const pauseRef = useRef(paused)
  const draggingCallback = useRef(onDraggingChange)
  const suppression = useRef(new Map())
  const savedPositions = useRef(new Map())
  draggingCallback.current = onDraggingChange
  const identity = [...projectIds].sort().join('|')

  useEffect(() => {
    pauseRef.current = paused
    control.current?.sync()
  }, [paused])

  useEffect(() => {
    const board = boardRef.current
    if (!enabled || !board || !projectIds.length) return undefined
    const engine = Engine.create({ enableSleeping: true })
    engine.gravity.y = 1
    engine.gravity.scale = 0.001
    const bodies = new Map()
    let walls = []
    let frame = 0
    let lastTime = 0
    let accumulator = 0
    let width = board.clientWidth
    let height = board.clientHeight
    let inView = false
    let keyboardFocus = false
    let drag = null
    let disposed = false

    function paint() {
      for (const [id, body] of bodies) {
        const card = cardRefs.current.get(id)
        if (!card) continue
        card.style.transform = `translate3d(${body.position.x - (body.plugin.domWidth || card.offsetWidth) / 2}px, ${body.position.y - (body.plugin.domHeight || card.offsetHeight) / 2}px, 0) rotate(${body.angle}rad)`
      }
    }

    function makeWalls() {
      if (walls.length) Composite.remove(engine.world, walls)
      const thickness = 100
      walls = [
        Bodies.rectangle(width / 2, height + thickness / 2 - 34, width + 2 * thickness, thickness, { isStatic: true }),
        Bodies.rectangle(-thickness / 2 + 2, height / 2, thickness, height + 2 * thickness, { isStatic: true }),
        Bodies.rectangle(width + thickness / 2 - 2, height / 2, thickness, height + 2 * thickness, { isStatic: true }),
        Bodies.rectangle(width / 2, -thickness / 2 + 2, width + 2 * thickness, thickness, { isStatic: true }),
      ]
      Composite.add(engine.world, walls)
    }

    function clampBody(body) {
      const halfWidth = (body.bounds.max.x - body.bounds.min.x) / 2
      const halfHeight = (body.bounds.max.y - body.bounds.min.y) / 2
      const x = Math.min(width - halfWidth - 4, Math.max(halfWidth + 4, body.position.x))
      const y = Math.min(height - halfHeight - 34, Math.max(halfHeight + 4, body.position.y))
      if (Math.abs(x - body.position.x) > 0.5 || Math.abs(y - body.position.y) > 0.5) {
        const hitSide = Math.abs(x - body.position.x) > 0.5
        Body.setPosition(body, { x, y })
        Body.setVelocity(body, { x: hitSide ? 0 : body.velocity.x, y: 0 })
      }
    }

    function seed(restore = false) {
      const firstCard = cardRefs.current.get(projectIds[0])
      const cardWidth = firstCard?.offsetWidth || 200
      const cardHeight = firstCard?.offsetHeight || 150
      const columns = Math.max(1, Math.min(4, Math.floor((width - 20) / (cardWidth + 12))))
      const stepX = width / columns
      projectIds.forEach((id, index) => {
        const card = cardRefs.current.get(id)
        if (!card) return
        const x = stepX * (index % columns + 0.5)
        const y = 24 + cardHeight / 2 + Math.floor(index / columns) * (cardHeight + 12)
        let body = bodies.get(id)
        if (!body) {
          const saved = restore ? savedPositions.current.get(id) : null
          const center = saved ? { x: saved.x / saved.width * width, y: saved.y / saved.height * height } : { x, y: Math.min(y, height - cardHeight / 2 - 34) }
          body = Bodies.rectangle(center.x, center.y, card.offsetWidth, card.offsetHeight, {
            friction: 0.65, frictionStatic: 1, frictionAir: 0.03, restitution: 0.08, sleepThreshold: 45,
            angle: saved?.angle ?? (index % 2 ? 0.035 : -0.035),
            label: String(id),
          })
          bodies.set(id, body)
          Composite.add(engine.world, body)
          clampBody(body)
        } else {
          Body.setPosition(body, { x, y: Math.min(y, height - cardHeight / 2 - 8) })
          Body.setAngle(body, index % 2 ? 0.035 : -0.035)
          Body.setVelocity(body, { x: 0, y: 0 })
          Body.setAngularVelocity(body, 0)
          clampBody(body)
          Sleeping.set(body, false)
        }
      })
      paint()
    }

    function shouldRun() {
      return !disposed && inView && !document.hidden && !pauseRef.current && !keyboardFocus
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
      lastTime = 0
      accumulator = 0
    }

    function schedule() {
      if (!frame && shouldRun()) frame = requestAnimationFrame(tick)
    }

    function tick(time) {
      frame = 0
      if (!shouldRun()) { lastTime = 0; return }
      accumulator += Math.min(50, lastTime ? time - lastTime : STEP)
      lastTime = time
      let steps = 0
      while (accumulator >= STEP && steps < 3) {
        Engine.update(engine, STEP)
        accumulator -= STEP
        steps += 1
      }
      for (const body of bodies.values()) {
        if (Math.abs(body.angle) > 0.24) {
          Body.setAngle(body, Math.sign(body.angle) * 0.24)
          Body.setAngularVelocity(body, 0)
        }
        clampBody(body)
      }
      paint()
      if (drag?.active || [...bodies.values()].some((body) => !body.isSleeping)) schedule()
      else lastTime = 0
    }

    function wakeAll() {
      for (const body of bodies.values()) Sleeping.set(body, false)
      schedule()
    }

    function sync() {
      if (!shouldRun()) stop()
      else schedule()
    }

    function finishDrag(cancelled = false) {
      if (!drag) return
      const previous = drag
      drag = null
      if (previous.constraint) Composite.remove(engine.world, previous.constraint)
      previous.card?.classList.remove('is-dragging')
      if (previous.active) {
        suppression.current.set(previous.id, performance.now() + 600)
        draggingCallback.current(false)
        if (cancelled) Body.setVelocity(previous.body, { x: 0, y: 0 })
      }
      try {
        if (previous.target.hasPointerCapture(previous.pointerId)) previous.target.releasePointerCapture(previous.pointerId)
      } catch { /* Capture may already be released by the browser. */ }
      wakeAll()
    }

    function coordinates(event) {
      const bounds = board.getBoundingClientRect()
      return { x: event.clientX - bounds.left - board.clientLeft, y: event.clientY - bounds.top - board.clientTop }
    }

    function pointerDown(event, id, handle) {
      if (!event.isPrimary || event.button !== 0 || pauseRef.current || drag || (event.pointerType !== 'mouse' && !handle)) return
      const body = bodies.get(id)
      if (!body) return
      const point = coordinates(event)
      const target = event.currentTarget
      drag = { id, body, card: cardRefs.current.get(id), target, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, anchor: Vector.sub(point, body.position), active: false, constraint: null }
      target.setPointerCapture(event.pointerId)
      keyboardFocus = false
      // Leave ordinary taps alone. Only the touch grip owns touch scrolling.
      if (handle) event.preventDefault()
      sync()
    }

    function pointerMove(event) {
      if (!drag || event.pointerId !== drag.pointerId) return
      if (!drag.active && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < DRAG_THRESHOLD) return
      const point = coordinates(event)
      point.x = Math.min(width - 5, Math.max(5, point.x))
      point.y = Math.min(height - 5, Math.max(5, point.y))
      if (!drag.active) {
        drag.active = true
        drag.constraint = Constraint.create({ pointA: point, bodyB: drag.body, pointB: drag.anchor, stiffness: 0.22, damping: 0.18, length: 0 })
        Composite.add(engine.world, drag.constraint)
        drag.card.classList.add('is-dragging')
        draggingCallback.current(true)
        wakeAll()
      } else drag.constraint.pointA = point
      event.preventDefault()
      Sleeping.set(drag.body, false)
      schedule()
    }

    function pointerUp(event) {
      if (drag?.pointerId === event.pointerId) finishDrag(event.type === 'pointercancel' || event.type === 'lostpointercapture')
    }

    function resize() {
      const nextWidth = board.clientWidth
      const nextHeight = board.clientHeight
      const dimensionsChanged = [...bodies].some(([id, body]) => {
        const card = cardRefs.current.get(id)
        return card && (card.offsetWidth !== body.plugin.domWidth || card.offsetHeight !== body.plugin.domHeight)
      })
      if (!nextWidth || !nextHeight || (width === nextWidth && height === nextHeight && !dimensionsChanged)) return
      finishDrag(true)
      const previousWidth = width
      const previousHeight = height
      width = nextWidth
      height = nextHeight
      makeWalls()
      for (const [id, body] of bodies) {
        const card = cardRefs.current.get(id)
        // Collision size must come from layout geometry, never a rotated bounding box.
        const angle = body.angle
        Body.setAngle(body, 0)
        Body.scale(body, card.offsetWidth / body.plugin.domWidth, card.offsetHeight / body.plugin.domHeight)
        Body.setAngle(body, angle)
        body.plugin.domWidth = card.offsetWidth
        body.plugin.domHeight = card.offsetHeight
        Body.setPosition(body, { x: body.position.x / previousWidth * width, y: body.position.y / previousHeight * height })
        Body.setVelocity(body, { x: 0, y: 0 })
        clampBody(body)
      }
      wakeAll()
      paint()
    }

    function focusIn(event) {
      // Keyboard activation pauses drift. Pointer clicks do not freeze released blocks.
      keyboardFocus = event.target.matches(':focus-visible')
      sync()
    }
    function focusOut() {
      keyboardFocus = false
      sync()
    }
    function visibility() {
      if (document.hidden) finishDrag(true)
      sync()
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (!inView) finishDrag(true)
      sync()
    }, { threshold: 0.02 })
    observer.observe(board)
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(board)
    makeWalls()
    seed(true)
    for (const [id, body] of bodies) {
      const card = cardRefs.current.get(id)
      body.plugin.domWidth = card.offsetWidth
      body.plugin.domHeight = card.offsetHeight
      resizeObserver.observe(card)
    }
    board.addEventListener('pointermove', pointerMove)
    board.addEventListener('pointerup', pointerUp)
    board.addEventListener('pointercancel', pointerUp)
    board.addEventListener('lostpointercapture', pointerUp)
    board.addEventListener('focusin', focusIn)
    board.addEventListener('focusout', focusOut)
    window.addEventListener('blur', finishDrag)
    document.addEventListener('visibilitychange', visibility)

    control.current = {
      pointerDown,
      sync,
      reset() { finishDrag(true); seed(); wakeAll() },
    }
    sync()

    return () => {
      disposed = true
      finishDrag(true)
      stop()
      observer.disconnect()
      resizeObserver.disconnect()
      board.removeEventListener('pointermove', pointerMove)
      board.removeEventListener('pointerup', pointerUp)
      board.removeEventListener('pointercancel', pointerUp)
      board.removeEventListener('lostpointercapture', pointerUp)
      board.removeEventListener('focusin', focusIn)
      board.removeEventListener('focusout', focusOut)
      window.removeEventListener('blur', finishDrag)
      document.removeEventListener('visibilitychange', visibility)
      for (const [id, body] of bodies) savedPositions.current.set(id, { x: body.position.x, y: body.position.y, angle: body.angle, width, height })
      Composite.clear(engine.world, false)
      Engine.clear(engine)
      for (const card of cardRefs.current.values()) card.style.transform = ''
      control.current = null
    }
    // IDs determine physics membership; metadata updates leave body positions untouched.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, identity, boardRef, cardRefs])

  const onPointerDown = useCallback((event, id, handle = false) => {
    // A later intentional click must never inherit suppression from a previous drag.
    suppression.current.delete(id)
    control.current?.pointerDown(event, id, handle)
  }, [])
  const suppressClick = useCallback((event, id) => {
    if (event.detail !== 0 && (suppression.current.get(id) || 0) > performance.now()) {
      event.preventDefault()
      event.stopPropagation()
      return true
    }
    return false
  }, [])
  const reset = useCallback(() => control.current?.reset(), [])
  return { onPointerDown, suppressClick, reset }
}
