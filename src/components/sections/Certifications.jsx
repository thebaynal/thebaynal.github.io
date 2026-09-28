import '../../styles/certifications.css'

export default function Certifications({ certifications = [] }) {
  return (
    <section className="certifications section-wrap" id="certifications" aria-labelledby="certifications-title">
      <div className="section-kicker" data-reveal>
        <span>06 / 07</span>
        <span>Credentials &amp; continued learning</span>
      </div>

      <div className="certifications__heading" data-reveal>
        <h2 className="display-heading" id="certifications-title">
          Proof of<br /><span className="accent-text">progress.</span>
        </h2>
        <p>Four Google course certificates completed. I’m working toward the full Google Cybersecurity Certificate and Cisco Ethical Hacking.</p>
      </div>

      <div className="certifications__grid">
        {certifications.map((certification, index) => {
          const inProgress = certification.status === 'in-progress'
          return (
            <article
              className={`certification-card${inProgress ? ' certification-card--progress' : ''}`}
              key={`${certification.title}-${certification.issuer}`}
              data-reveal
              style={{ '--reveal-delay': `${Math.min(index, 4) * 70}ms` }}
            >
              <div className="certification-card__top">
                <span className="certification-card__number">{String(index + 1).padStart(2, '0')}</span>
                <span className={`certification-card__status${inProgress ? ' certification-card__status--progress' : ''}`}>
                  <span className="certification-card__dot" aria-hidden="true" />
                  {inProgress ? 'In progress' : 'Course completed'}
                </span>
              </div>

              <h3>{certification.title}</h3>

              <div className="certification-card__meta">
                <span>{certification.issuer}</span>
                {certification.date && <span>{certification.date}</span>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
