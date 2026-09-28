import { useState } from 'react'

export default function About({ about }) {
  const [factIndex, setFactIndex] = useState(0)
  const facts = about.facts || [about.note]

  return (
    <section className="about section-wrap" id="about" aria-labelledby="about-title">
      <div className="section-kicker" data-reveal><span>03 / 07</span><span>{about.eyebrow}</span></div>
      <div className="about__content">
        <h2 className="display-heading" id="about-title" data-reveal>{about.title.split('\n').map((line) => <span key={line}>{line}</span>)}</h2>
        <div className="about__copy" data-reveal style={{ '--reveal-delay': '100ms' }}>
          {about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <div className="about__note">
            <button type="button" onClick={() => setFactIndex((index) => (index + 1) % facts.length)} aria-label="Show another project detail" title="Show another project detail"><span aria-hidden="true">✳</span></button>
            <div className="about__note-copy" aria-live="polite"><span>THE CURIOSITY FILE · {String(factIndex + 1).padStart(2, '0')} / {String(facts.length).padStart(2, '0')}</span><p key={factIndex}>{facts[factIndex]}</p></div>
            <span className="about__note-next" aria-hidden="true">↻</span>
          </div>
        </div>
      </div>
    </section>
  )
}
