import { useEffect, useMemo, useRef, useState } from 'react'
import ProjectBoard from '../projects/ProjectBoard.jsx'
import ProjectDialog from '../projects/ProjectDialog.jsx'
import useGithubProjects from '../../hooks/useGithubProjects.js'
import '../../styles/projects.css'

const PAGE_SIZE = 8

export default function Projects({ projects }) {
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [view, setView] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'list' : 'play')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [motionPaused, setMotionPaused] = useState(false)
  const [keyboardInteracting, setKeyboardInteracting] = useState(false)
  const [selected, setSelected] = useState(null)
  const returnFocus = useRef(null)
  const restorePending = useRef(false)
  const github = useGithubProjects(projects, dragging || keyboardInteracting || Boolean(selected))

  useEffect(() => {
    if (selected || github.updatePending || !restorePending.current) return
    restorePending.current = false
    const active = document.activeElement
    // A refresh may remove a repository immediately after its dialog closes.
    if (active === document.body || active === returnFocus.current || active?.closest('.project-dialog')) {
      const target = returnFocus.current?.isConnected ? returnFocus.current : document.getElementById('project-search')
      target?.focus({ preventScroll: true })
    }
  }, [selected, github.updatePending, github.repositories])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    function sync() {
      setReducedMotion(media.matches)
      if (media.matches) setView('list')
    }
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return github.repositories.filter((project) => !term || [project.name, project.fullName, project.description, project.language, ...project.stack, ...project.topics].join(' ').toLowerCase().includes(term))
  }, [github.repositories, query])
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE)
  const currentPage = Math.min(page, Math.max(0, pageCount - 1))
  const pageProjects = useMemo(() => filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE), [filtered, currentPage])

  function openProject(project, trigger) {
    returnFocus.current = trigger
    setSelected(project)
  }

  const connectionText = github.status === 'loading' ? 'Checking GitHub…' : github.status === 'live' ? 'Connected to GitHub' : github.status === 'cached' ? 'Saved GitHub collection' : github.usingFallback ? 'Showing five project notes · GitHub unavailable' : 'Showing saved collection · GitHub unavailable'

  return (
    <section className="projects section-wrap" id="work" aria-labelledby="projects-title" onFocusCapture={(event) => {
      if (event.target.closest('.project-block, .project-full-list') && event.target.matches(':focus-visible')) setKeyboardInteracting(true)
    }} onBlurCapture={() => {
      queueMicrotask(() => {
        const active = document.activeElement
        if (!active?.closest('.project-block, .project-full-list, .project-dialog')) setKeyboardInteracting(false)
      })
    }}>
      <p className="section-label">Projects / from my GitHub</p>
      <div className="project-section-heading"><div><h2 id="projects-title">Things I’ve<br /><span>built.</span></h2></div><p>Every public repository, in one place.<br />Open a block for the details.</p></div>
      <div className="project-connection"><div><a href="https://github.com/thebaynal" target="_blank" rel="noopener noreferrer">github.com/thebaynal <span aria-hidden="true">↗</span></a><span className={`project-connection__status project-connection__status--${github.status}`} role="status">{connectionText}</span></div><button type="button" onClick={github.refresh} disabled={github.status === 'loading' || github.cooldown > 0} title={github.cooldown > 0 ? `Refresh available in ${github.cooldown} seconds` : 'Discover new public repositories'}>Refresh <span aria-hidden="true">↻</span>{github.cooldown > 0 && <span className="project-connection__cooldown"> {github.cooldown}s</span>}</button></div>
      {github.error && <p className="project-connection__error">{github.error} {github.usingFallback ? 'The full collection will return when the connection succeeds.' : 'Your saved collection is still here.'}</p>}
      <div className="project-toolbar"><label className="project-search" htmlFor="project-search"><span>Find a project</span><input id="project-search" type="search" value={query} placeholder="Name, language, or technology" onChange={(event) => { setQuery(event.target.value); setPage(0) }} /></label><div className="project-view-toggle" role="group" aria-label="Project view"><button type="button" aria-pressed={view === 'play'} disabled={reducedMotion} title={reducedMotion ? 'Motion is disabled by your device preference' : 'Interactive blocks'} onClick={() => setView('play')}>Gravity view <span aria-hidden="true">▧</span></button><button type="button" aria-pressed={view === 'list'} onClick={() => setView('list')}>List view <span aria-hidden="true">☰</span></button></div></div>
      <div className="project-results-summary" aria-live="polite" aria-atomic="true"><span>{filtered.length} {filtered.length === 1 ? 'repository' : 'repositories'}{query.trim() ? ' found' : ''}</span>{view === 'play' && filtered.length > 0 && <span>Blocks {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, filtered.length)}</span>}{reducedMotion && <span>Motion off · all projects remain available</span>}</div>
      {filtered.length === 0 ? <div className="project-empty"><h3>No projects found.</h3><p>{query ? 'Try another name or technology.' : 'There are no public repositories in this collection yet.'}</p>{query && <button type="button" onClick={() => { setQuery(''); setPage(0) }}>Clear search</button>}</div> : view === 'play' ? <>
        <ProjectBoard projects={pageProjects} onOpen={openProject} onDraggingChange={setDragging} paused={motionPaused || Boolean(selected)} motionPaused={motionPaused} onToggleMotion={() => setMotionPaused((value) => !value)} />
        {pageCount > 1 && <nav className="project-pagination" aria-label="Project blocks pages"><button type="button" disabled={currentPage === 0 || dragging} onClick={() => setPage(currentPage - 1)}>← Previous blocks</button><span>Page {currentPage + 1} / {pageCount}</span><button type="button" disabled={currentPage === pageCount - 1 || dragging} onClick={() => setPage(currentPage + 1)}>Next blocks →</button></nav>}
      </> : <ul className="project-full-list" aria-label="All matching public repositories">{filtered.map((project, index) => <li key={project.id}><button type="button" aria-haspopup="dialog" aria-label={`View ${project.name} project details`} onClick={(event) => openProject(project, event.currentTarget)}><span className="project-full-list__number">{String(index + 1).padStart(2, '0')}</span><span className="project-full-list__copy"><strong>{project.name}</strong><span>{project.description}</span></span><span className="project-full-list__language">{project.language || project.stack[0] || 'Repository'}{project.archived && <small>Archived</small>}{project.fork && <small>Fork</small>}</span><span className="project-full-list__arrow" aria-hidden="true">↗</span></button></li>)}</ul>}
      <p className="project-section-footnote">Public repositories include forks and archived work. Detailed project notes are written by me.</p>
      {selected && <ProjectDialog project={selected} onClose={() => { restorePending.current = true; setSelected(null) }} returnFocus={returnFocus.current} />}
    </section>
  )
}
