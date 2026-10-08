import { test, expect } from '@playwright/test'

const known = ['UsTogether', 'MaScan_QR_Attendance_Checker', 'taglish_grammar_correction', '3D-Image-Projection-Using-Linear-Algebra', 'LexicalAnalyzerVisualizer']
function repos(count = 12) {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 100,
    name: known[index] || `experiment-${String(index + 1).padStart(3, '0')}`,
    full_name: `thebaynal/${known[index] || `experiment-${String(index + 1).padStart(3, '0')}`}`,
    description: `Repository ${index + 1} description`,
    private: false,
    language: index % 2 ? 'Python' : 'JavaScript',
    stargazers_count: index,
    pushed_at: new Date(Date.UTC(2026, 8, 1 + index % 28)).toISOString(),
    fork: index === 7,
    archived: index === 8,
    topics: ['experiment'],
  }))
}

async function mockGithub(page, values = repos()) {
  let requests = 0
  await page.route('https://api.github.com/users/thebaynal/repos**', async (route) => {
    requests++
    const url = new URL(route.request().url())
    const offset = (Number(url.searchParams.get('page') || 1) - 1) * 100
    const headers = offset + 100 < values.length ? { 'access-control-expose-headers': 'link', link: `<https://api.github.com/users/thebaynal/repos?per_page=100&page=${offset / 100 + 2}>; rel="next"` } : {}
    await route.fulfill({ status: 200, contentType: 'application/json', headers, body: JSON.stringify(values.slice(offset, offset + 100)) })
  })
  return () => requests
}

async function openList(page) {
  await page.locator('#work').scrollIntoViewIfNeeded()
  const toggle = page.getByRole('button', { name: 'List view', exact: true })
  if (await toggle.count()) await toggle.click()
}

test('new visual hierarchy, default theme, saved dark theme, and portrait', async ({ page }) => {
  await mockGithub(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Divino Al Ricafort.')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.getByAltText('Divino Al Ricafort speaking at an event')).toBeVisible()
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
})

test('saved theme is applied before the React entry module loads', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('portfolio-theme', 'dark'))
  await mockGithub(page)
  let release
  const entry = new Promise((resolve) => { release = resolve })
  await page.route('**/src/main.jsx*', async (route) => {
    await entry
    await route.continue()
  })
  try {
    await page.goto('/', { waitUntil: 'commit' })
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#181d1a')
    await expect(page.locator('#root > *')).toHaveCount(0)
    await expect(page.locator('html')).not.toHaveAttribute('data-theme-transition', 'active')
  } finally { release() }
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible()
})

test('rapid theme clicks preserve the final state and clear their animation marker', async ({ page }) => {
  await mockGithub(page)
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Switch to dark theme' })).toBeVisible()
  const result = await page.locator('.theme-toggle').evaluate((button) => {
    button.click()
    button.click()
    button.click()
    return {
      theme: document.documentElement.dataset.theme,
      saved: localStorage.getItem('portfolio-theme'),
      transition: document.documentElement.dataset.themeTransition,
      color: document.querySelector('meta[name="theme-color"]').content,
    }
  })
  expect(result).toEqual({ theme: 'dark', saved: 'dark', transition: 'active', color: '#181d1a' })
  await expect(page.getByRole('button', { name: 'Switch to light theme' })).toBeVisible()
  await expect(page.locator('.theme-toggle svg')).toHaveCount(1)
  await expect(page.locator('html')).not.toHaveAttribute('data-theme-transition', 'active')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('html')).not.toHaveAttribute('data-theme-transition', 'active')
})

test('theme switching still works when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Storage disabled') }
    Storage.prototype.setItem = () => { throw new Error('Storage disabled') }
  })
  await mockGithub(page)
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.getByRole('button', { name: 'Switch to light theme' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#ffffff')
})

test('reduced motion switches themes immediately and clears an active transition', async ({ page }) => {
  await mockGithub(page)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const reduced = await page.locator('.theme-toggle').evaluate((button) => {
    button.click()
    return { theme: document.documentElement.dataset.theme, marker: document.documentElement.dataset.themeTransition || null }
  })
  expect(reduced).toEqual({ theme: 'dark', marker: null })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const animated = await page.locator('.theme-toggle').evaluate((button) => {
    button.click()
    return document.documentElement.dataset.themeTransition
  })
  expect(animated).toBe('active')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('html')).not.toHaveAttribute('data-theme-transition', 'active')
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('complete GitHub pagination, eight-body pages, and whole-collection search', async ({ page }) => {
  const calls = await mockGithub(page, repos(106))
  await page.goto('/')
  await expect(page.locator('.project-block')).toHaveCount(8)
  await expect.poll(calls).toBe(2)
  await page.locator('#project-search').fill('experiment-106')
  await expect(page.locator('.project-block')).toHaveCount(1)
  await expect(page.locator('.project-block__name')).toHaveText('experiment 106')
  await page.locator('.project-block__open').click()
  await expect(page.getByRole('dialog')).toContainText('Personal learning notes haven’t been added')
  await expect(page.getByRole('dialog')).toContainText('Primary language on GitHub:')
})

test('modal includes authored details, confines focus, and restores the trigger', async ({ page }) => {
  await mockGithub(page)
  await page.goto('/')
  await openList(page)
  const opener = page.getByRole('button', { name: 'View UsTogether project details' })
  await opener.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await expect(dialog).toContainText('Tech stack')
  await expect(dialog).toContainText('Skills developed')
  await expect(dialog).toContainText('Composing reusable React interfaces')
  await expect(dialog.getByRole('link', { name: 'Open repository' })).toHaveAttribute('href', 'https://github.com/thebaynal/UsTogether')
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab')
  await expect.poll(() => page.evaluate(() => Boolean(document.activeElement.closest('dialog')))).toBe(true)
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
})

test('project details animate on desktop and mobile and close safely during entry', async ({ page }) => {
  await mockGithub(page)
  await page.goto('/')
  await openList(page)
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 })
    const opener = page.getByRole('button', { name: 'View UsTogether project details' })
    await opener.click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect.poll(() => dialog.evaluate((element) => element.getAnimations().some((animation) => animation.playState === 'running')), { intervals: [10, 20, 40] }).toBe(true)
    await expect(page.getByRole('button', { name: 'Close project details' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(page.locator('.project-dialog--closing')).toHaveAttribute('open', '')
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden')
    await page.keyboard.press('Escape') // Repeated dismissal must not restart the exit.
    await expect(dialog).toHaveCount(0)
    await expect(opener).toBeFocused()
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden')
  }
})

test('project dismissal completes if animations are disabled or motion preference changes', async ({ page }) => {
  await mockGithub(page)
  await page.goto('/')
  await openList(page)
  const opener = page.getByRole('button', { name: 'View UsTogether project details' })
  await opener.click()
  await page.addStyleTag({ content: '.project-dialog, .project-dialog::backdrop { animation: none !important; }' })
  await page.getByRole('button', { name: 'Close project details' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(opener).toBeFocused()
  await opener.click()
  await page.keyboard.press('Escape')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(opener).toBeFocused()
})

test('physics falls and dragging moves a block without activating it', async ({ page }) => {
  await mockGithub(page, repos(1))
  await page.goto('/')
  const board = page.locator('.project-board')
  await board.scrollIntoViewIfNeeded()
  const block = page.locator('.project-block')
  const start = await block.boundingBox()
  await expect.poll(async () => (await block.boundingBox()).y).toBeGreaterThan(start.y + 70)
  const bounds = await block.boundingBox()
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2)
  await page.mouse.down()
  await page.mouse.move(bounds.x + bounds.width / 2 + 130, bounds.y - 140, { steps: 20 })
  const dragged = await block.boundingBox()
  await page.mouse.up()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  expect(Math.abs(dragged.x - bounds.x) + Math.abs(dragged.y - bounds.y)).toBeGreaterThan(40)
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click()
  await page.locator('.project-block__open').click()
  await expect(page.getByRole('dialog')).toBeVisible()
})

test('blocks collide and form a stack when dropped onto each other', async ({ page }) => {
  await mockGithub(page, repos(2))
  await page.goto('/')
  await page.locator('.project-board').scrollIntoViewIfNeeded()
  const first = page.locator('.project-block').nth(0)
  const second = page.locator('.project-block').nth(1)
  await expect.poll(async () => (await first.boundingBox()).y).toBeGreaterThan((await page.locator('.project-board').boundingBox()).y + 250)
  const a = await first.boundingBox()
  const b = await second.boundingBox()
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.mouse.move(a.x + a.width / 2, a.y - b.height / 2 - 30, { steps: 30 })
  await page.mouse.up()
  await expect.poll(async () => {
    const x = await first.boundingBox()
    const y = await second.boundingBox()
    return Math.abs(y.y + y.height - x.y)
  }, { timeout: 10000 }).toBeLessThan(28)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('reduced motion disables physics and responds to preference changes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await mockGithub(page)
  await page.goto('/')
  await expect(page.locator('.project-board')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'View UsTogether project details' })).toBeVisible()
  await page.getByRole('button', { name: 'View UsTogether project details' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(await page.getByRole('dialog').evaluate((element) => element.getAnimations().length)).toBe(0)
  expect(await page.locator('.project-dialog__body').evaluate((element) => element.getAnimations().length)).toBe(0)
  await page.keyboard.press('Escape')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const gravity = page.getByRole('button', { name: 'Gravity view', exact: true })
  if (await gravity.count()) await gravity.click()
  await expect(page.locator('.project-board')).toBeVisible()
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.project-board')).toHaveCount(0)
})

test('offline cold load keeps authored projects and storage can be unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error('Disabled') }
    Storage.prototype.setItem = () => { throw new Error('Disabled') }
  })
  await page.route('https://api.github.com/**', (route) => route.abort())
  await page.goto('/')
  await expect(page.locator('.project-block')).toHaveCount(5)
  await expect(page.locator('.project-connection')).toContainText(/unavailable|fetch|saved|offline/i)
  await openList(page)
  await page.getByRole('button', { name: 'View MaScan project details' }).click()
  await expect(page.getByRole('dialog')).toContainText('PDF attendance reports')
})

test('a successful empty response produces an empty state', async ({ page }) => {
  await mockGithub(page, [])
  await page.goto('/')
  await expect(page.locator('.project-block')).toHaveCount(0)
  await expect(page.locator('#work')).toContainText(/no public repositories/i)
})

test('later-page rate limit retains complete stale cache rather than partial results', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('portfolio-github-repositories-v1', JSON.stringify({
    version: 1, account: 'thebaynal', fetchedAt: Date.now() - 7200000,
    repositories: [{ id: 99, fullName: 'thebaynal/cached-project', name: 'cached-project', description: 'Complete saved project', repo: 'https://github.com/thebaynal/cached-project', topics: [], language: 'Python', stars: 2, updatedAt: null, fork: false, archived: false }],
  })))
  await page.route('https://api.github.com/users/thebaynal/repos**', (route) => {
    const pageNumber = new URL(route.request().url()).searchParams.get('page')
    return route.fulfill(pageNumber === '2' ? { status: 403, body: '{}' } : { status: 200, contentType: 'application/json', headers: { 'access-control-expose-headers': 'link', link: '<https://api.github.com/users/thebaynal/repos?page=2>; rel="next"' }, body: JSON.stringify(repos()) })
  })
  await page.goto('/')
  await expect(page.locator('.project-block__name')).toHaveText('cached project')
  await expect(page.locator('.project-connection__error')).toContainText(/limiting/i)
  const cache = await page.evaluate(() => JSON.parse(localStorage.getItem('portfolio-github-repositories-v1')))
  expect(cache.repositories).toHaveLength(1)
})

test('discovery completing during a dialog preserves project identity and focus', async ({ page }) => {
  let release
  const pending = new Promise((resolve) => { release = resolve })
  await page.route('https://api.github.com/users/thebaynal/repos**', async (route) => {
    await pending
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(repos()) })
  })
  await page.goto('/')
  await openList(page)
  await page.getByRole('button', { name: 'View UsTogether project details' }).click()
  release()
  await expect(page.getByRole('dialog')).toContainText('UsTogether')
  await expect(page.getByRole('button', { name: 'Close project details' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'View UsTogether project details' })).toBeFocused()
})

test('320px layout, touch handles, both themes, resize bounds, and page scrolling', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 720 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  await mockGithub(page, repos(5))
  await page.goto('http://127.0.0.1:5173/')
  await page.locator('.project-board').scrollIntoViewIfNeeded()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(await page.locator('.project-block__grip').first().evaluate((element) => getComputedStyle(element).touchAction)).toBe('none')
  expect(await page.locator('.project-board').evaluate((element) => getComputedStyle(element).touchAction)).not.toBe('none')
  const scrollStart = await page.evaluate(() => scrollY)
  await page.mouse.wheel(0, 220)
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollStart)
  await page.getByRole('button', { name: 'Switch to dark theme' }).click()
  await page.setViewportSize({ width: 768, height: 900 })
  await page.locator('.project-board').scrollIntoViewIfNeeded()
  await expect.poll(async () => {
    const arena = await page.locator('.project-board').boundingBox()
    const cards = await page.locator('.project-block').all()
    for (const card of cards) {
      const bounds = await card.boundingBox()
      if (bounds.x < arena.x - 2 || bounds.y < arena.y - 2 || bounds.x + bounds.width > arena.x + arena.width + 2 || bounds.y + bounds.height > arena.y + arena.height + 2) return false
    }
    return true
  }).toBe(true)
  await context.close()
})

test('200 percent zoom-equivalent reflow has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 720, height: 500 })
  await mockGithub(page)
  await page.goto('/')
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await openList(page)
  await page.getByRole('button', { name: 'View UsTogether project details' }).click()
  await expect(page.getByRole('button', { name: 'Close project details' })).toBeVisible()
})

test('real touch drag, native swipe scrolling, cancellation, pause, and reset', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  await mockGithub(page, repos(1))
  await page.goto('http://127.0.0.1:5173/')
  await page.locator('.project-board').scrollIntoViewIfNeeded()
  const block = page.locator('.project-block')
  await expect.poll(async () => {
    const card = await block.boundingBox()
    const arena = await page.locator('.project-board').boundingBox()
    return Math.abs(card.y + card.height - (arena.y + arena.height - 36))
  }).toBeLessThan(4)
  await page.locator('.project-block__grip').scrollIntoViewIfNeeded()
  await expect(page.locator('.project-block__grip')).toHaveAttribute('aria-hidden', 'true')
  expect(await page.locator('.project-block__grip').evaluate((element) => element.tabIndex)).toBe(-1)
  const session = await context.newCDPSession(page)
  const grip = await page.locator('.project-block__grip').boundingBox()
  const start = await block.boundingBox()
  const point = { x: grip.x + grip.width / 2, y: grip.y + grip.height / 2 }
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [point] })
  for (let i = 1; i <= 12; i++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: point.x - i * 4, y: point.y - i * 12 }] })
    await page.waitForTimeout(20) // Allow physical constraint updates between real touch events.
    if (i === 3) await expect(page.locator('.is-dragging')).toHaveCount(1)
  }
  const moved = await block.boundingBox()
  await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
  expect(start.y - moved.y).toBeGreaterThan(40)
  await expect(page.locator('.is-dragging')).toHaveCount(0)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.locator('.project-board').scrollIntoViewIfNeeded()
  const arena = await page.locator('.project-board').boundingBox()
  const scrollStart = await page.evaluate(() => scrollY)
  const swipeY = Math.min(600, Math.max(230, arena.y + 220))
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 30, y: swipeY }] })
  for (let i = 1; i <= 8; i++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 30, y: swipeY - i * 20 }] })
    await page.waitForTimeout(20)
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(scrollStart + 30)
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click()
  const stoppedTransform = await block.evaluate((element) => element.style.transform)
  await page.waitForTimeout(150) // Several animation frames must pass without advancing paused physics.
  expect(await block.evaluate((element) => element.style.transform)).toBe(stoppedTransform)
  await page.getByRole('button', { name: 'Reset blocks' }).click()
  await expect.poll(() => block.evaluate((element) => element.style.transform)).not.toBe(stoppedTransform)
  await expect(page.getByRole('button', { name: 'Resume motion', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('#project-move-select')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Move selected project/ })).toHaveCount(0)
  await context.close()
})

test('incoming GitHub collection waits for an active drag to finish', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('portfolio-github-repositories-v1', JSON.stringify({
    version: 1, account: 'thebaynal', fetchedAt: Date.now() - 7200000,
    repositories: [{ id: 100, fullName: 'thebaynal/UsTogether', name: 'UsTogether', description: 'Saved timeline', repo: 'https://github.com/thebaynal/UsTogether', topics: [], language: 'TypeScript', stars: 2, updatedAt: null, fork: false, archived: false }],
  })))
  let release
  const pending = new Promise((resolve) => { release = resolve })
  await page.route('https://api.github.com/users/thebaynal/repos**', async (route) => {
    await pending
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(repos()) })
  })
  await page.goto('/')
  await page.locator('.project-board').scrollIntoViewIfNeeded()
  const box = await page.locator('.project-block').boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 60, { steps: 10 })
  await expect(page.locator('.is-dragging')).toHaveCount(1)
  release()
  await expect(page.locator('.project-connection__status')).toContainText('Connected')
  await expect(page.locator('.project-block')).toHaveCount(1)
  await page.mouse.up()
  await expect(page.locator('.project-block')).toHaveCount(8)
  await expect(page.getByRole('dialog')).toHaveCount(0)
})

test('resetting eight blocks while paused keeps them above the mobile floor', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockGithub(page, repos(8))
  await page.goto('/')
  await expect(page.locator('.project-block')).toHaveCount(8)
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click()
  await page.getByRole('button', { name: 'Reset blocks' }).click()
  const arena = await page.locator('.project-board').boundingBox()
  for (const card of await page.locator('.project-block').all()) {
    const bounds = await card.boundingBox()
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(arena.y + arena.height - 31)
  }
})
