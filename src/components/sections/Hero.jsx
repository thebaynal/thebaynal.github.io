export default function Hero({ profile }) {
  const nameParts = profile.name.trim().split(/\s+/)
  const firstNames = nameParts.slice(0, -1).join(' ')
  const familyName = nameParts.at(-1)
  const github = profile.socialLinks.find((link) => link.label === 'GitHub')?.href || 'https://github.com/thebaynal'

  return (
    <section className="hero page-shell" aria-labelledby="hero-title">
      <p className="hero__pretitle"><span>Computer science student</span><span aria-hidden="true">/</span><span>Philippines</span></p>
      <h1 className="hero__title" id="hero-title" aria-label={profile.name}><span>{firstNames}{' '}</span><span>{familyName}<span className="hero__period">.</span></span></h1>
      <div className="hero__stage">
        <div className="hero__visual">
          <figure className="hero__portrait">
            <img src="./images/divinoalricafort-cutout.png" width="1129" height="1393" fetchPriority="high" alt={`${profile.name} speaking at an event`} />
            <figcaption><span>Camarines Sur, Philippines</span><span>Computer science, in practice.</span></figcaption>
          </figure>
        </div>
        <div className="hero__headline-wrap">
          <p className="hero__intro">{profile.intro}</p>
          <div className="hero__actions">
            <a className="button button--dark" href="#work">Explore my projects <span aria-hidden="true">↓</span></a>
            <a className="text-link" href={github} target="_blank" rel="noopener noreferrer">GitHub / thebaynal <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <aside className="hero__focus" aria-label="Areas of focus">
          <p className="hero__focus-label">Areas of focus</p>
          <ul className="hero__interests">{profile.focusAreas.map((area) => <li key={area}>{area}</li>)}</ul>
        </aside>
      </div>
      <div className="hero__bottom">
        <span>A few things I’ve made. A lot I’m still learning.</span>
        <a href="#work">Pick up a project below <span aria-hidden="true">↘</span></a>
      </div>
    </section>
  )
}
