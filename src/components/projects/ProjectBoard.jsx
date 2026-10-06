import { useMemo, useRef } from 'react'
import useProjectPhysics from '../../hooks/useProjectPhysics.js'

const COLORS = ['blue', 'orange', 'yellow', 'pale', 'yellow', 'blue', 'pale', 'orange']

function blockTitle(project) {
  if (project.authored) return project.name
  if (project.fullName.toLowerCase() === 'thebaynal/thebaynal.github.io') return 'Personal website'
  return project.name.replace(/[-_]+/g, ' ')
}

function ProjectMotif({ project }) {
  const fullName = project.fullName.toLowerCase()
  if (fullName.endsWith('/ustogether')) return <span className="project-block__motif project-motif--memory" aria-hidden="true" />
  if (fullName.endsWith('/mascan_qr_attendance_checker') || fullName.endsWith('/qr-attendance-checker')) return <span className="project-block__motif project-motif--scan" aria-hidden="true" />
  if (fullName.endsWith('/taglish_grammar_correction')) return <span className="project-block__motif project-motif--language" aria-hidden="true"><del>kamusta</del><b>kumusta</b></span>
  if (fullName.endsWith('/3d-image-projection-using-linear-algebra')) return <span className="project-block__motif project-motif--cube" aria-hidden="true"><i /></span>
  if (fullName.endsWith('/lexicalanalyzervisualizer')) return <span className="project-block__motif project-motif--lexer" aria-hidden="true"><i>int</i><i>x</i><i>;</i></span>
  return <span className="project-block__motif project-motif--file" aria-hidden="true">{'{ }'}</span>
}

export default function ProjectBoard({ projects, onOpen, onDraggingChange, paused, motionPaused, onToggleMotion }) {
  const boardRef = useRef(null)
  const cardRefs = useRef(new Map())
  const ids = useMemo(() => projects.map((project) => project.id), [projects])
  const physics = useProjectPhysics({ boardRef, cardRefs, projectIds: ids, enabled: true, paused, onDraggingChange })

  return (
    <div className="project-playground">
      <div className="project-board-caption">
        <p id="project-board-instructions">Drag a block. Click for project details.</p>
        <span className="project-board-caption__touch">On touch, use the dotted grip.</span>
      </div>
      <div className="project-board" ref={boardRef} aria-label="Draggable project blocks" aria-describedby="project-board-instructions">
        <span className="project-board__stamp" aria-hidden="true">PICK UP<br />A PROJECT ↗</span>
        {projects.map((project, index) => (
          <article key={project.id} className={`project-block project-block--${COLORS[index % COLORS.length]}`} data-project-id={project.id} ref={(element) => {
            if (element) cardRefs.current.set(project.id, element)
            else cardRefs.current.delete(project.id)
          }}>
            <button type="button" className="project-block__open" aria-label={`View ${project.name} project details`} aria-haspopup="dialog" onPointerDown={(event) => physics.onPointerDown(event, project.id)} onClick={(event) => {
              if (!physics.suppressClick(event, project.id)) onOpen(project, event.currentTarget)
            }}>
              <span className="project-block__index">{String(index + 1).padStart(2, '0')} <span aria-hidden="true">↗</span></span>
              <ProjectMotif project={project} />
              <span className="project-block__name" title={project.name}>{blockTitle(project)}</span>
              <span className="project-block__language">{project.language || project.stack[0] || 'Repository'}{project.archived ? ' · Archived' : project.fork ? ' · Fork' : ''}</span>
            </button>
            <span className="project-block__grip" aria-hidden="true" title="Drag this block" onPointerDown={(event) => physics.onPointerDown(event, project.id, true)}>⠿</span>
          </article>
        ))}
        <div className="project-board__floor" aria-hidden="true"><span>DROP ZONE</span><span>↑ Pick something up</span></div>
      </div>
      <div className="project-board-controls" role="group" aria-label="Project motion controls">
        <button className="project-reset" type="button" onClick={physics.reset}>Reset blocks <span aria-hidden="true">↺</span></button>
        <button className="project-pause" type="button" onClick={onToggleMotion} aria-pressed={motionPaused}>{motionPaused ? 'Resume motion' : 'Pause motion'}</button>
      </div>
    </div>
  )
}
