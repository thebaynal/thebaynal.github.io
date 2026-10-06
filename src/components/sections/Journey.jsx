export default function Journey({ journey }) {
  return (
    <section className="journey section-wrap" id="journey" aria-labelledby="journey-title">
      <p className="section-label" data-reveal>Education &amp; experience</p>
      <div className="section-heading-row journey__heading" data-reveal>
        <h2 className="display-heading" id="journey-title">Along the way.</h2>
        <p className="section-heading-note">Milestones from study, national competition,<br />and collaborative challenges.</p>
      </div>
      <div className="timeline">
        {journey.map((item) => (
          <article className="timeline-item" key={`${item.year}-${item.title}`} data-reveal>
            <div className="timeline-item__marker">{item.year || '—'}</div>
            <div className="timeline-item__main">
              <div className="timeline-item__label">{item.type}</div>
              <h3>{item.title}</h3>
              <p className="timeline-item__place">{item.place}</p>
              <p className="timeline-item__detail">{item.detail}</p>
              {item.source && <a className="timeline-item__source" href={item.source} target="_blank" rel="noopener noreferrer">{item.sourceLabel || 'Read source'} <span aria-hidden="true">↗</span></a>}
            </div>
            <span className="timeline-item__arrow" aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
    </section>
  )
}
