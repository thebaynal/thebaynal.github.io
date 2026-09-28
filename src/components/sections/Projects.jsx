function ProjectArtwork({ project }) {
  return (
    <div className={`project-art ${project.art}`} aria-hidden="true">
      <span className="project-art__orbit project-art__orbit--one" />
      <span className="project-art__orbit project-art__orbit--two" />
      <span className="project-art__symbol">{project.symbol}</span>
      <span className="project-art__caption">SELECTED<br />WORK · {project.number}</span>
    </div>
  )
}

export default function Projects({ projects }) {
  return (
    <section className="projects section-wrap" id="work" aria-labelledby="projects-title">
      <div className="section-kicker" data-reveal><span>04 / 07</span><span>Projects from my repositories</span></div>
      <div className="section-heading-row" data-reveal>
        <h2 className="display-heading" id="projects-title">Selected<br /><span>work<span className="accent-text">.</span></span></h2>
        <p className="section-heading-note">Interfaces, language AI, developer tools,<br />and graphics built through practice.</p>
      </div>
      <div className="project-grid">
        {projects.map((project, index) => (
          <article className="project-card" key={project.number} data-reveal style={{ '--reveal-delay': `${(index % 3) * 70}ms` }}>
            <ProjectArtwork project={project} />
            <div className="project-card__meta"><span>{project.number} / {String(projects.length).padStart(2, '0')}</span><span>{project.category}</span></div>
            <div className="project-card__heading"><h3>{project.name}</h3></div>
            <p className="project-card__description">{project.description}</p>
            <ul className="tag-list" aria-label={`${project.name} topics`}>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            {project.repo && (
              <div className="project-card__links">
                <a href={project.repo} target="_blank" rel="noopener noreferrer">View repository <span aria-hidden="true">↗</span></a>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
