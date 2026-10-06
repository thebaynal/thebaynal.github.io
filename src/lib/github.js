const ACCOUNT = 'thebaynal'
const CACHE_KEY = 'portfolio-github-repositories-v1'
export const GITHUB_CACHE_TTL = 60 * 60 * 1000
export const GITHUB_REFRESH_COOLDOWN = 60 * 1000
let inFlight = null
let blockedUntil = 0

function safeHomepage(value) {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null
  } catch { return null }
}

function normalizeRepository(repo) {
  if (!repo || !Number.isSafeInteger(repo.id) || typeof repo.full_name !== 'string' || repo.private === true) return null
  const [owner, name, extra] = repo.full_name.split('/')
  if (extra || !name || owner.toLowerCase() !== ACCOUNT) return null
  return {
    id: repo.id,
    fullName: repo.full_name,
    name,
    repo: `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`,
    description: typeof repo.description === 'string' ? repo.description : '',
    language: typeof repo.language === 'string' ? repo.language : null,
    stars: Number.isFinite(repo.stargazers_count) ? Math.max(0, repo.stargazers_count) : 0,
    updatedAt: repo.pushed_at && Number.isFinite(Date.parse(repo.pushed_at)) ? repo.pushed_at : null,
    archived: repo.archived === true,
    fork: repo.fork === true,
    topics: Array.isArray(repo.topics) ? repo.topics.filter((topic) => typeof topic === 'string') : [],
    demo: safeHomepage(repo.homepage),
  }
}

export function readRepositoryCache() {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (cached?.version !== 1 || cached.account !== ACCOUNT || !Number.isFinite(cached.fetchedAt) || cached.fetchedAt > Date.now() + 60000 || !Array.isArray(cached.repositories)) return null
    if (!cached.repositories.every((repo) => Number.isSafeInteger(repo.id) && typeof repo.fullName === 'string' && repo.fullName.toLowerCase().startsWith(`${ACCOUNT}/`))) return null
    const repositories = cached.repositories.map((repo) => normalizeRepository({
      id: repo.id, full_name: repo.fullName, description: repo.description, language: repo.language,
      stargazers_count: repo.stars, pushed_at: repo.updatedAt, archived: repo.archived,
      fork: repo.fork, topics: repo.topics, homepage: repo.demo,
    }))
    if (repositories.some((repo) => !repo)) return null
    return { ...cached, repositories }
  } catch { return null }
}

function saveRepositoryCache(value) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(value)) } catch { /* Storage is optional. */ }
}

/** Fetch the whole public collection before replacing a previously complete snapshot. */
export function discoverRepositories() {
  if (inFlight) return inFlight
  if (Date.now() < blockedUntil) return Promise.reject(new Error('GitHub is temporarily limiting requests. The saved projects are still available.'))
  inFlight = (async () => {
    const repositories = new Map()
    let next = `https://api.github.com/users/${ACCOUNT}/repos?type=owner&sort=full_name&direction=asc&per_page=100&page=1`
    const visited = new Set()
    while (next) {
      if (visited.has(next)) throw new Error('GitHub returned an incomplete repository listing.')
      visited.add(next)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 12000)
      let response
      let page
      try {
        response = await fetch(next, { signal: controller.signal, headers: { Accept: 'application/vnd.github+json' } })
        if (!response.ok) {
          if (response.status === 403 || response.status === 429) {
            const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000
            const retry = Number(response.headers.get('retry-after')) * 1000
            blockedUntil = Math.max(Date.now() + GITHUB_REFRESH_COOLDOWN, reset || 0, Date.now() + (retry || 0))
            throw new Error('GitHub is temporarily limiting requests. The saved projects are still available.')
          }
          throw new Error(`GitHub could not load the repository collection (${response.status}).`)
        }
        page = await response.json()
      } finally { clearTimeout(timeout) }
      if (!Array.isArray(page)) throw new Error('GitHub returned an invalid repository collection.')
      for (const value of page) {
        const repo = normalizeRepository(value)
        if (repo) repositories.set(repo.id, repo)
      }
      const link = response.headers.get('link') || ''
      const match = link.match(/<([^>]+)>;\s*rel="next"/)
      if (match) {
        const url = new URL(match[1])
        if (url.origin !== 'https://api.github.com' || url.pathname !== `/users/${ACCOUNT}/repos`) throw new Error('GitHub returned an unexpected pagination link.')
        next = url.href
      } else if (!link && page.length === 100) {
        // A proxy may omit Link. A final empty page still produces a complete result.
        const url = new URL(next)
        url.searchParams.set('page', String(Number(url.searchParams.get('page')) + 1))
        next = url.href
      } else { next = null }
    }
    const value = { version: 1, account: ACCOUNT, fetchedAt: Date.now(), repositories: [...repositories.values()] }
    saveRepositoryCache(value)
    return value
  })().finally(() => { inFlight = null })
  return inFlight
}

export function authoredFullName(project) {
  if (project.fullName) return project.fullName
  try { return new URL(project.repo).pathname.replace(/^\//, '').replace(/\/$/, '') } catch { return '' }
}

export function fallbackRepositories(projects) {
  return projects.map((project) => ({
    id: `curated:${authoredFullName(project).toLowerCase()}`,
    fullName: authoredFullName(project),
    name: project.name,
    repo: project.repo,
    description: project.description,
    language: null,
    stars: null,
    updatedAt: null,
    topics: [],
    demo: safeHomepage(project.demo),
    archived: false,
    fork: false,
  }))
}

export function enrichRepositories(repositories, projects) {
  const authored = new Map(projects.map((project, index) => [authoredFullName(project).toLowerCase(), { project, index }]))
  return repositories.map((repository) => {
    const notes = authored.get(repository.fullName.toLowerCase())
    const project = notes?.project
    return {
      ...repository,
      githubId: Number.isSafeInteger(repository.id) ? repository.id : null,
      // The authored fallback and first live response must share DOM/body identity.
      id: repository.fullName.toLowerCase(),
      demo: safeHomepage(project?.demo) || repository.demo,
      name: project?.name || repository.name,
      category: project?.category || (repository.fork ? 'Public repository · Fork' : 'Public repository'),
      description: project?.description || repository.description || 'A public project from my GitHub collection.',
      overview: project?.overview || project?.description || repository.description || 'An overview has not been added for this repository yet.',
      features: project?.features || [],
      stack: project?.stack || project?.tags || [],
      skillsDeveloped: project?.skillsDeveloped || [],
      authored: Boolean(project),
      authoredIndex: notes?.index ?? Infinity,
    }
  }).sort((a, b) => {
    if (a.authored !== b.authored) return a.authored ? -1 : 1
    if (a.authored) return a.authoredIndex - b.authoredIndex
    return (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0) || a.fullName.localeCompare(b.fullName)
  })
}
