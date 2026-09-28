import '../../styles/skills.css'

const techMarks = {
  Python: 'Py', JavaScript: 'JS', TypeScript: 'TS', React: 'Re', Vite: 'Vi',
  'Tailwind CSS': 'Tw', 'Framer Motion': 'Fm', 'Monaco Editor': 'Mo',
  PyTorch: 'Pt', Transformers: 'Tr', PEFT: 'Pf', LoRA: 'Lr',
  'Mistral 7B': 'M7', NumPy: 'Np', OpenCV: 'Cv',
  Express: 'Ex', Flask: 'Fl', Flet: 'Ft', SQLite: 'Sq',
  Flex: 'Fx', Pygame: 'Pg', Recharts: 'Rc', pyzbar: 'Qr', ReportLab: 'Rp',
}

function Technology({ name }) {
  return <li><span className="stack-tech__icon" aria-hidden="true">{techMarks[name] || name.slice(0, 2)}</span><span>{name}</span></li>
}

export default function Skills({ groups }) {
  return (
    <section className="skills section-wrap" id="skills" aria-labelledby="skills-title">
      <div className="section-kicker" data-reveal><span>02 / 07</span><span>Technologies in my projects</span></div>
      <div className="skills__intro" data-reveal>
        <h2 className="display-heading" id="skills-title">My tech<br /><span className="accent-text">stack.</span></h2>
        <p>From React interfaces to model fine-tuning, these are tools I’ve used across my public projects.</p>
      </div>
      <div className="skills__lanes">
        {groups.map((group, index) => (
          <div className="stack-lane" key={group.category} data-reveal style={{ '--reveal-delay': `${index * 70}ms`, '--lane-duration': `${42 + index * 6}s` }}>
            <h3><span>0{index + 1}</span>{group.category}</h3>
            <div className="stack-lane__viewport">
              <div className="stack-lane__track">
                <ul className="stack-lane__items">
                  {group.items.map((item) => <Technology key={item} name={item} />)}
                </ul>
                <ul className="stack-lane__items stack-lane__items--duplicate" aria-hidden="true">
                  {group.items.map((item) => <Technology key={item} name={item} />)}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="skills__source" data-reveal>Tools reflected in my <a href="https://github.com/thebaynal" target="_blank" rel="noopener noreferrer">GitHub projects <span aria-hidden="true">↗</span></a></p>
    </section>
  )
}
