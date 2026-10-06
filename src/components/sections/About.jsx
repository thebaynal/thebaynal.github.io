export default function About({ about }) {
  return (
    <section className="about section-wrap" id="about" aria-labelledby="about-title">
      <p className="section-label" data-reveal>{about.eyebrow}</p>
      <div className="about__content">
        <h2 className="display-heading" id="about-title" data-reveal>{about.title.split('\n').map((line) => <span key={line}>{line}{' '}</span>)}</h2>
        <div className="about__copy" data-reveal style={{ '--reveal-delay': '100ms' }}>
          {about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <dl className="about__facts">{about.facts.map((fact) => <div key={fact.area}><dt>{fact.area}</dt><dd>{fact.detail}</dd></div>)}</dl>
        </div>
      </div>
    </section>
  )
}
