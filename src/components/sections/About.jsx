export default function About({ about }) {
  return (
    <section className="about section-wrap" id="about" aria-labelledby="about-title">
      <div className="section-kicker" data-reveal><span>02 / 06</span><span>{about.eyebrow}</span></div>
      <div className="about__content">
        <h2 className="display-heading" id="about-title" data-reveal>{about.title.split('\n').map((line) => <span key={line}>{line}</span>)}</h2>
        <div className="about__copy" data-reveal style={{ '--reveal-delay': '100ms' }}>
          {about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="about__note"><span aria-hidden="true">✳</span>{about.note}</div>
        </div>
      </div>
    </section>
  )
}
