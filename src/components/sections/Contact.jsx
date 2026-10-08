import { useState } from 'react'

export default function Contact({ contact, email, socialLinks }) {
  const [copied, setCopied] = useState(false)
  const linkedIn = socialLinks.find((social) => social.label === 'LinkedIn')

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      window.location.href = `mailto:${email}`
    }
  }

  function openEmailDraft(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') || '').trim()
    const senderEmail = String(formData.get('email') || '').trim()
    const message = String(formData.get('message') || '').trim()
    const subject = encodeURIComponent(`Portfolio hello from ${name}`)
    const body = encodeURIComponent(`From: ${name} (${senderEmail})\n\n${message}`)
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
  }

  return (
    <section className="contact section-wrap" id="contact" aria-labelledby="contact-title">
      <p className="section-label" data-reveal>{contact.eyebrow}</p>
      <div className="contact__grid">
        <div className="contact__copy" data-reveal>
          <h2 className="display-heading display-heading--editorial" id="contact-title">Have a project<br />in mind?</h2>
          <p>{contact.description}</p>
          {email && (
            <>
              <a className="contact__email" href={`mailto:${email}`}>{email}<span aria-hidden="true">↗</span></a>
              <button className="copy-button" type="button" onClick={copyEmail} aria-live="polite">
                {copied ? 'Email copied ✓' : 'Copy email address'} <span aria-hidden="true">⧉</span>
              </button>
            </>
          )}
          <div className="contact__socials">
            <span>FIND ME ONLINE</span>
            {socialLinks.map((social) => <a href={social.href} key={social.label} target="_blank" rel="noopener noreferrer">{social.label} <span aria-hidden="true">↗</span></a>)}
          </div>
        </div>
        {email ? (
          <form className="contact-form" onSubmit={openEmailDraft} data-reveal style={{ '--reveal-delay': '100ms' }}>
            <p className="contact-form__eyebrow">OR DROP A NOTE</p>
            <label htmlFor="contact-name">Your name</label>
            <input id="contact-name" name="name" autoComplete="name" placeholder="The name your friends use" required />
            <label htmlFor="contact-email">Email address</label>
            <input id="contact-email" type="email" name="email" autoComplete="email" placeholder="you@somewhere.com" required />
            <label htmlFor="contact-message">What’s on your mind?</label>
            <textarea id="contact-message" name="message" rows="4" placeholder="A project, a question, a hello…" required />
            <button className="button button--dark contact-form__submit" type="submit">Open in email <span aria-hidden="true">↗</span></button>
            <p className="contact-form__hint">Your email app will open with the message ready to send.</p>
          </form>
        ) : (
          <div className="contact-form contact-form--social" data-reveal style={{ '--reveal-delay': '100ms' }}>
            <p className="contact-form__eyebrow">START A CONVERSATION</p>
            <h3>Let’s connect.</h3>
            <p>Reach me on LinkedIn to discuss a project, collaboration, or opportunity.</p>
            <a className="button button--dark contact-form__submit" href={linkedIn.href} target="_blank" rel="noopener noreferrer">Message on LinkedIn <span aria-hidden="true">↗</span></a>
          </div>
        )}
      </div>
    </section>
  )
}
