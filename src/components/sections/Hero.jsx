export default function Hero({ profile }) {
  return (
    <section className="hero page-shell" aria-labelledby="hero-title">
      <div className="hero__meta">
        <span className="eyebrow"><span className="eyebrow__index">01 / 07</span> {profile.role}</span>
        <span className="hero__location">{profile.location}</span>
      </div>
      <div className="hero__stage">
        <div className="hero__headline-wrap">
          <p className="hero__pretitle">Hey there, I’m {profile.name.split(' ')[0]} <span aria-hidden="true">↘</span></p>
          <h1 id="hero-title">{profile.headline.map((line, index) => (
            <span className={`hero__headline-line hero__headline-line--${index + 1}`} key={line}>{line}</span>
          ))}</h1>
        </div>
        <div className="hero__portrait">
          <img src="./images/divinoalricafort.png" alt={`${profile.name} speaking at an event`} />
          <span className="hero__portrait-index" aria-hidden="true">DIVINO AL RICAFORT / 2026</span>
        </div>
      </div>
      <div className="hero__bottom">
        <div className="hero__intro">
          <p>{profile.intro}</p>
          <div className="hero__socials" aria-label="Social profiles">
            {profile.socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.label} profile`}>
                {social.short} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
        <div className="hero__actions">
          <a className="button button--dark" href="#work">View work <span aria-hidden="true">↘</span></a>
          <a className="button button--outline" href="#contact">Contact me <span aria-hidden="true">↗</span></a>
        </div>
        <a className="scroll-cue" href="#skills"><span className="scroll-cue__line" />Explore my stack</a>
      </div>
    </section>
  )
}
