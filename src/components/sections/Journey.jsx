export default function Journey({ journey }) {
  return (
    <section className="journey section-wrap" id="journey" aria-labelledby="journey-title">
      <div className="section-kicker" data-reveal><span>05 / 06</span><span>A few chapters so far</span></div>
      <div className="section-heading-row journey__heading" data-reveal>
        <h2 className="display-heading" id="journey-title">The long<br /><span>way <span className="accent-text">round.</span></span></h2>
        <p className="section-heading-note">School, good people, happy accidents,<br />and the work that keeps me moving.</p>
      </div>
      <div className="timeline">
        {journey.map((item) => (
          <article className="timeline-item" key={`${item.year}-${item.title}`} data-reveal>
            <div className="timeline-item__marker"><span>{item.mark}</span><i aria-hidden="true" /></div>
            <div className="timeline-item__main">
              <div className="timeline-item__label"><span>{item.type}</span>{item.year && <span>{item.year}</span>}</div>
              <h3>{item.title}</h3>
              <p className="timeline-item__place">{item.place}</p>
              <p className="timeline-item__detail">{item.detail}</p>
              {item.source && <a className="timeline-item__source" href={item.source} target="_blank" rel="noopener noreferrer">{item.sourceLabel || 'Read source'} <span aria-hidden="true">↗</span></a>}
            </div>
            <span className="timeline-item__arrow" aria-hidden="true">↗</span>
          </article>
        ))}
      </div>
      <div className="journey__aside" data-reveal><span aria-hidden="true">✳</span> Still writing the next chapter.</div>
    </section>
  )
}
