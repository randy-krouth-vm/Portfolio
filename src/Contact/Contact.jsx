import { useEffect, useState } from 'react'
import Reveal from '../Reveal.jsx'
import './Contact.css'

const EMAIL = "randy.krouth@gmail.com";
const PHONE = "(585) 441-1827";
const PHONE_HREF = "+15854411827";

const SOCIALS = [
    { label: "Upwork", href: "https://www.upwork.com/freelancers/~01a6662184b7764860" },
    { label: "Credly", href: "https://www.credly.com/users/randall-krouth/badges" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/randall-krouth-6a7957a0/" },
];

function CopyIcon() {
    return (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="9" y="9" width="11" height="11" rx="2.5" />
            <path d="M15 5.5A2.5 2.5 0 0 0 12.5 3H6.5A2.5 2.5 0 0 0 4 5.5v6A2.5 2.5 0 0 0 6.5 14" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7" />
        </svg>
    );
}

const copyToClipboard = async (value) => {
    try {
        await navigator.clipboard.writeText(value);
        return true;
    } catch {
        /* Clipboard API needs a secure context; fall back to a selection copy. */
    }
    try {
        const field = document.createElement('textarea');
        field.value = value;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.top = '-1000px';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(field);
        return copied;
    } catch {
        return false;
    }
};

function Contact() {
    const [copied, setCopied] = useState(null);

    useEffect(() => {
        if (!copied) return undefined;
        const timer = setTimeout(() => setCopied(null), 2000);
        return () => clearTimeout(timer);
    }, [copied]);

    const copyContact = async (value, field) => {
        const ok = await copyToClipboard(value);
        if (ok) setCopied(field);
    };

    return (
    <main>
        <header className="page-hero">
            <div className="container">
                <Reveal>
                    <p className="eyebrow">
                        <span className="eyebrow-dot" />
                        Contact
                    </p>
                    <h1 className="page-title">Let&apos;s Build.</h1>
                    <p className="page-lede">
                        Open to conversations about product design, engineering, and new
                        opportunities. The fastest way to reach me is via email or phone.
                    </p>
                </Reveal>
            </div>
        </header>

        <section className="section">
            <div className="container contact-layout">
                <Reveal className="contact-card">
                    <h2>Get in touch</h2>
                    <p>
                        Tell me what you&apos;re building and where you&apos;d like it to go.
                        I&apos;ll get back to you as soon as I can.
                    </p>

                    <div className="contact-links">
                        <div className="contact-line">
                            <div className="contact-line-text">
                                <span>Email</span>
                                <strong>{EMAIL}</strong>
                            </div>
                            <button
                                type="button"
                                className={`contact-copy${copied === 'email' ? ' is-copied' : ''}`}
                                onClick={() => copyContact(EMAIL, 'email')}
                                aria-label={copied === 'email' ? 'Email address copied' : 'Copy email address'}
                                title="Copy email address"
                            >
                                {copied === 'email' ? <CheckIcon /> : <CopyIcon />}
                            </button>
                        </div>
                        <div className="contact-line">
                            <div className="contact-line-text">
                                <span>Phone</span>
                                <strong>
                                    <a href={`tel:${PHONE_HREF}`}>{PHONE}</a>
                                </strong>
                            </div>
                            <button
                                type="button"
                                className={`contact-copy${copied === 'phone' ? ' is-copied' : ''}`}
                                onClick={() => copyContact(PHONE, 'phone')}
                                aria-label={copied === 'phone' ? 'Phone number copied' : 'Copy phone number'}
                                title="Copy phone number"
                            >
                                {copied === 'phone' ? <CheckIcon /> : <CopyIcon />}
                            </button>
                        </div>
                        <p className="contact-copy-note" role="status" aria-live="polite">
                            {copied === 'email'
                                ? 'Email copied to clipboard'
                                : copied === 'phone'
                                  ? 'Phone number copied'
                                  : ''}
                        </p>
                    </div>

                    <div className="contact-actions">
                        <a className="btn btn-primary" href={`${import.meta.env.BASE_URL}Randall_Krouth_Resume.pdf`} target="_blank" rel="noopener noreferrer">
                            View résumé
                        </a>
                        <a className="btn btn-ghost" href={`mailto:${EMAIL}`}>
                            Send an email
                        </a>
                    </div>
                </Reveal>

                <Reveal as="aside" className="contact-side" delay={120}>
                    <h2>Find me online</h2>
                    <ul className="social-list">
                        {SOCIALS.map((social) => (
                            <li key={social.label}>
                                <a href={social.href} target="_blank" rel="noopener noreferrer">
                                    {social.label}
                                    <span aria-hidden="true">↗</span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </Reveal>
            </div>
        </section>
    </main>
  );
} 

export default Contact;