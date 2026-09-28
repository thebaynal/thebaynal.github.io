import { useState } from 'react'

const navItems = [
  { label: 'Stack', href: '#skills' },
  { label: 'About', href: '#about' },
  { label: 'Work', href: '#work' },
  { label: 'Journey', href: '#journey' },
  { label: 'Credentials', href: '#certifications' },
  { label: 'Contact', href: '#contact' },
]

export default function SiteHeader({ name }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label={`${name}, home`}>
        <span className="wordmark__mark">✳</span>
        <span>{name.split(' ')[0]}<span className="wordmark__period">.</span></span>
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
      <a className="header-availability" href="#contact">
        <span className="availability-dot" aria-hidden="true" />
        <span>Let’s connect</span>
      </a>
    </header>
  )
}
