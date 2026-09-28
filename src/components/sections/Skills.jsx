export default function Skills({ groups }) {
  return (
    <section className="skills section-wrap" id="skills" aria-labelledby="skills-title">
      <div className="section-kicker" data-reveal><span>04 / 06</span><span>The things in my toolkit</span></div>
      <div className="skills__intro" data-reveal>
        <h2 className="display-heading" id="skills-title">Curiosity is<br />my <span className="accent-text">stack.</span></h2>
        <p>I like picking the right tool for the job, learning as I go, and keeping people in the loop while I make.</p>
      </div>
      <div className="skills-grid">
        {groups.map((group, index) => (
          <article className="skill-group" key={group.category} data-reveal style={{ '--reveal-delay': `${index * 100}ms` }}>
            <div className="skill-group__top"><span>0{index + 1}</span><span className="skill-group__mark" aria-hidden="true">{['⌘', '▧', '✳'][index]}</span></div>
            <h3>{group.category}</h3>
            <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </div>
      <div className="skills__callout" data-reveal><span>ALWAYS IN PROGRESS</span><p>The best tool in the room is still <em>asking a better question.</em></p><span aria-hidden="true">↘</span></div>
    </section>
  )
}
