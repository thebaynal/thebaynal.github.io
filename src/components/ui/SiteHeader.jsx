import { useState } from 'react'

const navItems = [
  { label: 'Projects', href: '#work' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
]

export default function SiteHeader({ name }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const nameParts = name.trim().split(/\s+/)

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label={`${name}, home`}>
        <span className="wordmark__name">{nameParts.slice(0, -1).join(' ')}{' '}<span className="wordmark__surname">{nameParts.at(-1)}</span></span>
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={menuOpen}
        aria-controls="primary-navigation"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span>{menuOpen ? 'Close' : 'Menu'}</span>
        <span className="menu-toggle__icon" aria-hidden="true">{menuOpen ? '×' : '＋'}</span>
      </button>
      <nav className={`primary-nav${menuOpen ? ' primary-nav--open' : ''}`} id="primary-navigation" aria-label="Main navigation">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
        ))}
      </nav>
      <a className="header-availability" href="https://github.com/thebaynal" target="_blank" rel="noopener noreferrer">
        <span>GitHub ↗</span>
      </a>
    </header>
  )
}
