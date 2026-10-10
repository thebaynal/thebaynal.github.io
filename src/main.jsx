import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '@fontsource-variable/manrope'
import '@fontsource-variable/dm-sans'
import './styles/tokens.css'
import './styles/global.css'
import './styles/apple-design.css'

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.documentElement.classList.add('motion-ready')
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
