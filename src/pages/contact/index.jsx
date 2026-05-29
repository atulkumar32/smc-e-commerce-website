import { useState } from 'react';
import './style.scss';

const INIT = { name: '', email: '', subject: '', message: '' };

function ContactPage() {
  const [form, setForm] = useState(INIT);
  const [sent, setSent] = useState(false);

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire to API
    setSent(true);
    setForm(INIT);
  };

  return (
    <div className="contact-page">
      {/* Hero */}
      <div className="contact-page__hero">
        <span className="contact-page__eyebrow">Get In Touch</span>
        <h1 className="contact-page__title">Contact Us</h1>
        <p className="contact-page__subtitle">
          We&apos;d love to hear from you. Send us a message and we&apos;ll
          respond as soon as possible.
        </p>
      </div>

      <div className="contact-page__body">
        <div className="contact-page__container">
          <div className="contact-page__grid">
            {/* Info */}
            <div className="contact-page__info">
              <h2 className="contact-page__info-title">Our Concierge</h2>
              {[
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                      strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  ),
                  label: 'Address',
                  value: '123 Heritage Lane, Mumbai, Maharashtra 400001, India',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                      strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
                    </svg>
                  ),
                  label: 'Phone',
                  value: '+91 98765 43210',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                      strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  ),
                  label: 'Email',
                  value: 'concierge@shreemahaveer.com',
                },
                {
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
                      strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  ),
                  label: 'Hours',
                  value: 'Mon – Sat: 10:00 AM – 7:00 PM',
                },
              ].map((item) => (
                <div key={item.label} className="contact-page__info-item">
                  <span className="contact-page__info-icon">{item.icon}</span>
                  <div>
                    <p className="contact-page__info-label">{item.label}</p>
                    <p className="contact-page__info-value">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="contact-page__form-wrap">
              {sent ? (
                <div className="contact-page__success">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                    stroke="#2e7d32" strokeWidth="1.6" strokeLinecap="round"
                    strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. Our concierge team will be in touch shortly.</p>
                  <button className="contact-page__btn" onClick={() => setSent(false)}>
                    Send Another
                  </button>
                </div>
              ) : (
                <form className="contact-page__form" onSubmit={handleSubmit} noValidate>
                  <h2 className="contact-page__form-title">Send a Message</h2>

                  <div className="contact-page__field">
                    <label className="contact-page__label" htmlFor="contact-name">
                      Full Name <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      className="contact-page__input"
                      placeholder="Your full name"
                      value={form.name}
                      onChange={handleChange('name')}
                      required
                    />
                  </div>

                  <div className="contact-page__field">
                    <label className="contact-page__label" htmlFor="contact-email">
                      Email Address <span aria-hidden="true">*</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      className="contact-page__input"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={handleChange('email')}
                      required
                    />
                  </div>

                  <div className="contact-page__field">
                    <label className="contact-page__label" htmlFor="contact-subject">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      className="contact-page__input"
                      placeholder="How can we help?"
                      value={form.subject}
                      onChange={handleChange('subject')}
                    />
                  </div>

                  <div className="contact-page__field">
                    <label className="contact-page__label" htmlFor="contact-message">
                      Message <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      className="contact-page__input contact-page__input--textarea"
                      placeholder="Write your message here…"
                      rows={5}
                      value={form.message}
                      onChange={handleChange('message')}
                      required
                    />
                  </div>

                  <button type="submit" className="contact-page__btn">
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
