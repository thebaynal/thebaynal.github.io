export default function Certifications({ certifications = [] }) {
  return (
    <section className="certifications section-wrap" id="certifications" aria-labelledby="certifications-title">
      <p className="section-label" data-reveal>Credentials</p>

      <div className="certifications__heading" data-reveal>
        <h2 className="display-heading" id="certifications-title">
          Still studying.
        </h2>
        <p>Four Google courses and Cisco Ethical Hacking completed. The full Google Cybersecurity Certificate is in progress.</p>
      </div>

      <div className="certifications__grid">
        {certifications.map((certification) => {
          const inProgress = certification.status === 'in-progress'
          return (
            <article
              className={`certification-card${inProgress ? ' certification-card--progress' : ''}`}
              key={`${certification.title}-${certification.issuer}`}
              data-reveal
            >
              <div className="certification-card__top">
                <span className={`certification-card__status${inProgress ? ' certification-card__status--progress' : ''}`}>
                  {inProgress ? 'In progress' : 'Completed'}
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
