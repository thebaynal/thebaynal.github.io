export default function Skills({ groups }) {
  return (
    <section className="skills section-wrap" id="skills" aria-labelledby="skills-title">
      <div className="section-heading-row" data-reveal>
        <div><p className="section-label">What I work with</p><h2 className="display-heading" id="skills-title">Skills &amp; tools.</h2></div>
        <p className="section-heading-note">From school projects and cybersecurity training.<br />Open a project to see its stack.</p>
      </div>
      <div className="skills__groups">
        {groups.map((group) => (
          <div className="skills__group" key={group.category} data-reveal>
            <h3>{group.category}</h3>
            <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        ))}
      </div>
      <a className="text-link skills__source" href="https://github.com/thebaynal" target="_blank" rel="noopener noreferrer">See my projects on GitHub ↗</a>
    </section>
  )
}
