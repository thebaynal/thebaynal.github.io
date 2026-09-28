import { useEffect, useState } from 'react'
import { portfolio } from './data/portfolio.js'
import SiteHeader from './components/ui/SiteHeader.jsx'
import ThemeToggle from './components/ui/ThemeToggle.jsx'
import CursorMesh from './components/ui/CursorMesh.jsx'
import Hero from './components/sections/Hero.jsx'
import About from './components/sections/About.jsx'
import Projects from './components/sections/Projects.jsx'
import Skills from './components/sections/Skills.jsx'
import Journey from './components/sections/Journey.jsx'
import Contact from './components/sections/Contact.jsx'

function getInitialTheme() {
  try {
    return localStorage.getItem('portfolio-theme') || 'dark'
  } catch {
    return 'dark'
  }
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('portfolio-theme', theme)
    } catch {
      // The site still works when browser storage is disabled.
    }
  }, [theme])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' })

    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element))
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <CursorMesh />
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader name={portfolio.name} />
      <main id="main">
        <Hero profile={portfolio} />
        <About about={portfolio.about} />
        <Projects projects={portfolio.projects} />
        <Skills groups={portfolio.skills} />
        <Journey journey={portfolio.journey} />
        <Contact contact={portfolio.contact} email={portfolio.email} socialLinks={portfolio.socialLinks} />
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} {portfolio.name}</span>
        <span>Designed with curiosity <span aria-hidden="true">✳</span> Built with care</span>
        <a href="#top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</a>
      </footer>
      <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
    </>
  )
}
