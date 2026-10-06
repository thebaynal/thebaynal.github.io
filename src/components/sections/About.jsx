export default function About({ about }) {
  return (
    <section className="about section-wrap" id="about" aria-labelledby="about-title">
      <p className="section-label" data-reveal>Behind the projects</p>
      <div className="about__content">
        <h2 className="display-heading" id="about-title" data-reveal>A little<br />about me.</h2>
        <div className="about__copy" data-reveal style={{ '--reveal-delay': '100ms' }}>
          {about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <ul className="about__facts">{about.facts.map((fact) => <li key={fact}>{fact}</li>)}</ul>
        </div>
      </div>
    </section>
  )
}
