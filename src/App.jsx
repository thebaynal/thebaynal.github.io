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
import Certifications from './components/sections/Certifications.jsx'
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

    function observeReveals(node) {
      if (!(node instanceof Element)) return
      if (node.matches('[data-reveal]')) observer.observe(node)
      node.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element))
    }

    const main = document.getElementById('main')
    observeReveals(main)

    const addedContent = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(observeReveals))
    })
    addedContent.observe(main, { childList: true, subtree: true })

    return () => {
      addedContent.disconnect()
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <CursorMesh />
      <div id="top" aria-hidden="true" />
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader name={portfolio.name} />
      <main id="main">
        <Hero profile={portfolio} />
        <Skills groups={portfolio.skills} />
        <About about={portfolio.about} />
        <Projects projects={portfolio.projects} />
        <Journey journey={portfolio.journey} />
        <Certifications certifications={portfolio.certifications} />
        <Contact contact={portfolio.contact} email={portfolio.email} socialLinks={portfolio.socialLinks} />
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} {portfolio.name}</span>
        <span>Designed with curiosity <span aria-hidden="true">✳</span> Built with care</span>
        <a href="#top">Back to top ↑</a>
      </footer>
      <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
    </>
  )
}
