import HeroSculpture from '../ui/HeroSculpture.jsx'

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
        <div className="hero__headline-wrap">
          <p className="hero__intro">{profile.intro}</p>
          <p className="hero__interests">Software development <span aria-hidden="true">/</span> Cybersecurity <span aria-hidden="true">/</span> Applied AI</p>
          <div className="hero__actions">
            <a className="button button--dark" href="#work">Explore my projects <span aria-hidden="true">↓</span></a>
            <a className="text-link" href={github} target="_blank" rel="noopener noreferrer">GitHub / thebaynal <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="hero__visual">
          <HeroSculpture />
          <figure className="hero__portrait">
            <img src="./images/divinoalricafort.png" alt={`${profile.name} speaking at an event`} />
            <figcaption>Camarines Sur, Philippines<br /><span>Computer science, in practice.</span></figcaption>
          </figure>
        </div>
      </div>
      <div className="hero__bottom">
        <span>A few things I’ve made. A lot I’m still learning.</span>
        <a href="#work">Pick up a project below <span aria-hidden="true">↘</span></a>
      </div>
    </section>
  )
}
