import { useEffect, useRef } from 'react'

function formatDate(value) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'Asia/Manila' }).format(new Date(value))
}

export default function ProjectDialog({ project, onClose, returnFocus }) {
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    closeRef.current.focus({ preventScroll: true })
    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
      queueMicrotask(() => {
        if (document.querySelector('dialog[open]')) return
        const target = returnFocus?.isConnected ? returnFocus : document.getElementById('project-search')
        target?.focus({ preventScroll: true })
      })
    }
  }, [returnFocus])

  return (
    <dialog ref={dialogRef} className="project-dialog" aria-labelledby="project-dialog-title" aria-describedby="project-dialog-description" onKeyDown={(event) => {
      if (event.key !== 'Tab') return
      const controls = [...dialogRef.current.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')].filter((element) => element.getClientRects().length > 0)
      if (!controls.length) return
      event.preventDefault()
      const current = controls.indexOf(document.activeElement)
      const next = current < 0 ? (event.shiftKey ? controls.length - 1 : 0) : (current + (event.shiftKey ? -1 : 1) + controls.length) % controls.length
      controls[next].focus()
    }} onCancel={(event) => { event.preventDefault(); onCloseRef.current() }} onClick={(event) => {
      if (event.target !== dialogRef.current) return
      const bounds = dialogRef.current.getBoundingClientRect()
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onCloseRef.current()
    }}>
      <div className="project-dialog__topline"><span>{project.authored ? 'PROJECT NOTES' : 'FROM MY GITHUB'}</span><button ref={closeRef} type="button" onClick={onClose} aria-label="Close project details">Close <span aria-hidden="true">×</span></button></div>
      <div className="project-dialog__body">
        <p className="project-dialog__category">{project.category}{project.archived ? ' · Archived' : ''}</p>
        <h2 id="project-dialog-title">{project.name}</h2>
        <p id="project-dialog-description" className="project-dialog__overview">{project.overview}</p>
        {project.features.length > 0 && <section className="project-dialog__features" aria-labelledby="project-features-title"><h3 id="project-features-title">What it does</h3><ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>}
        <div className="project-dialog__columns">
          <section aria-labelledby="project-stack-title"><h3 id="project-stack-title">Tech stack</h3>{project.stack.length ? <ul className="project-stack">{project.stack.map((technology) => <li key={technology}>{technology}</li>)}</ul> : <p className="project-dialog__missing">A detailed tech stack hasn’t been documented here yet.</p>}{project.language && <p className="project-dialog__primary-language">Primary language on GitHub: <strong>{project.language}</strong></p>}</section>
          <section aria-labelledby="project-skills-title"><h3 id="project-skills-title">Skills developed</h3>{project.skillsDeveloped.length ? <ul className="project-skills">{project.skillsDeveloped.map((skill) => <li key={skill}>{skill}</li>)}</ul> : <p className="project-dialog__missing">Personal learning notes haven’t been added for this repository yet.</p>}</section>
        </div>
        <div className="project-dialog__metadata"><span>{project.fullName}</span>{project.stars !== null && <span>{project.stars} {project.stars === 1 ? 'star' : 'stars'}</span>}{project.updatedAt && <span>Last code update {formatDate(project.updatedAt)}</span>}</div>
        <div className="project-dialog__links"><a href={project.repo} target="_blank" rel="noopener noreferrer">Open repository <span aria-hidden="true">↗</span></a>{project.demo && <a className="project-dialog__demo" href={project.demo} target="_blank" rel="noopener noreferrer">Visit project link <span aria-hidden="true">↗</span></a>}</div>
      </div>
    </dialog>
  )
}
