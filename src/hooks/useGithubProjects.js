import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { discoverRepositories, enrichRepositories, fallbackRepositories, GITHUB_CACHE_TTL, GITHUB_REFRESH_COOLDOWN, readRepositoryCache } from '../lib/github.js'

export default function useGithubProjects(authoredProjects, frozen) {
  const [initial] = useState(readRepositoryCache)
  const [snapshot, setSnapshot] = useState(initial)
  const [pending, setPending] = useState(null)
  const [status, setStatus] = useState(initial ? 'cached' : 'loading')
  const [error, setError] = useState('')
  const [refreshAt, setRefreshAt] = useState(0)
  const [now, setNow] = useState(Date.now)
  const mounted = useRef(false)
  const busy = useRef(false)

  const refresh = useCallback(async () => {
    if (busy.current || Date.now() < refreshAt) return
    busy.current = true
    setStatus('loading')
    setError('')
    setRefreshAt(Date.now() + GITHUB_REFRESH_COOLDOWN)
    try {
      const next = await discoverRepositories()
      if (!mounted.current) return
      setPending(next)
      setStatus('live')
    } catch (failure) {
      if (!mounted.current) return
      setStatus('offline')
      setError(failure.name === 'AbortError' ? 'GitHub took too long to respond.' : failure.message || 'GitHub is unavailable right now.')
    } finally { busy.current = false }
  }, [refreshAt])

  useEffect(() => {
    mounted.current = true
    if (!initial || Date.now() - initial.fetchedAt >= GITHUB_CACHE_TTL) {
      // The service shares its in-flight request across Strict Mode effect replays.
      refresh()
    }
    return () => { mounted.current = false }
    // Initial discovery runs once; explicit refresh handles later requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (pending && !frozen) {
      setSnapshot(pending)
      setPending(null)
    }
  }, [pending, frozen])

  useEffect(() => {
    if (refreshAt <= Date.now()) return undefined
    const interval = setInterval(() => {
      const time = Date.now()
      setNow(time)
      if (time >= refreshAt) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [refreshAt])

  const repositories = useMemo(() => enrichRepositories(snapshot?.repositories || fallbackRepositories(authoredProjects), authoredProjects), [snapshot, authoredProjects])
  return { repositories, status, error, fetchedAt: snapshot?.fetchedAt, updatePending: Boolean(pending), usingFallback: !snapshot, refresh, cooldown: Math.max(0, Math.ceil((refreshAt - now) / 1000)) }
}
