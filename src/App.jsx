import { useEffect, useState } from 'react'
import { portfolio } from './data/portfolio.js'
import SiteHeader from './components/ui/SiteHeader.jsx'
import ThemeToggle from './components/ui/ThemeToggle.jsx'
import Hero from './components/sections/Hero.jsx'
import About from './components/sections/About.jsx'
import Projects from './components/sections/Projects.jsx'
import Skills from './components/sections/Skills.jsx'
import Journey from './components/sections/Journey.jsx'
import Certifications from './components/sections/Certifications.jsx'
import Contact from './components/sections/Contact.jsx'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('portfolio-theme')
    return saved === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export default function App() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1b2428' : '#f4f0e6')
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
      <div id="top" aria-hidden="true" />
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader name={portfolio.name} />
      <main id="main">
        <Hero profile={portfolio} />
        <Projects projects={portfolio.projects} />
        <About about={portfolio.about} />
        <Skills groups={portfolio.skills} />
        <Journey journey={portfolio.journey} />
        <Certifications certifications={portfolio.certifications} />
        <Contact contact={portfolio.contact} email={portfolio.email} socialLinks={portfolio.socialLinks} />
      </main>
      <footer className="site-footer">
        <span>© {new Date().getFullYear()} {portfolio.name}</span>
        <a href="https://github.com/thebaynal/thebaynal.github.io" target="_blank" rel="noopener noreferrer">Built with React. Source on GitHub ↗</a>
        <a href="#top">Back to top ↑</a>
      </footer>
      <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
    </>
  )
}
