export default function Hero({ profile }) {
  return (
    <section className="hero page-shell" aria-labelledby="hero-title">
      <div className="hero__stage">
        <div className="hero__headline-wrap">
          <p className="hero__pretitle"><span className="hero__status" aria-hidden="true" /> Computer science student / Philippines</p>
          <h1 id="hero-title"><span>Divino Al</span><span>Ricafort<span className="hero__period">.</span></span></h1>
          <p className="hero__intro">{profile.intro}</p>
          <p className="hero__interests">Software development <span aria-hidden="true">/</span> Cybersecurity <span aria-hidden="true">/</span> Applied AI</p>
          <div className="hero__actions">
            <a className="button button--dark" href="#work">Explore my projects <span aria-hidden="true">↓</span></a>
            <a className="text-link" href="https://github.com/thebaynal" target="_blank" rel="noopener noreferrer">GitHub / thebaynal <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <figure className="hero__portrait">
          <img src="./images/divinoalricafort.png" alt={`${profile.name} speaking at an event`} />
          <figcaption>Camarines Sur<br /><strong>Computer Science</strong></figcaption>
        </figure>
      </div>
      <div className="hero__bottom">
        <span>A few things I’ve made. A lot I’m still learning.</span>
        <a href="#work">Pick up a project below <span aria-hidden="true">↘</span></a>
      </div>
    </section>
  )
}
