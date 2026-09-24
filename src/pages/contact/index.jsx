import { useState } from 'react';
import { Link } from 'react-router-dom';
import showroomImg from '../../assets/contact/showroom.jpg';
import { useStaggerReveal } from '../../components/StaggerReveal';
import './style.scss';

const INIT = {
  category: 'General Inquiry',
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

const CATEGORIES = [
  'General Inquiry',
  'Order Status & Tracking',
  'School & Institutional Orders',
  'Corporate Gifting',
  'Warranty & Repairs',
];

const FAQS = [
  {
    q: 'How long does standard delivery take across India?',
    a: 'Orders are dispatched from our Mumbai atelier within 24 hours. Metro deliveries arrive within 2–4 business days, with full real-time SMS & WhatsApp tracking.',
  },
  {
    q: 'What is your return & exchange guarantee?',
    a: 'We offer a complimentary 7-day return and exchange policy on all unwashed products in original packaging with tags intact.',
  },
  {
    q: 'Do you offer bulk orders for schools and colleges?',
    a: 'Yes. We are India’s trusted manufacturer for orthopedic student backpacks, custom logo embroidery, and institutional volume discounts.',
  },
  {
    q: 'What warranty is included with my bag?',
    a: 'All authentic Shree Mahaveer Collections carry a 1-Year Atelier Warranty covering structural stitching, zipper integrity, and hardware.',
  },
];

function ContactPage() {
  const [form, setForm] = useState(INIT);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const channelsRef = useStaggerReveal({ selector: '.contact-v__channel', staggerDelay: 85 });

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCategorySelect = (cat) => {
    setForm((prev) => ({ ...prev, category: cat }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSent(true);
      setForm(INIT);
    }, 600);
  };

  return (
    <div className="contact-v">
      {/* ── Page Hero Header ── */}
      <section className="contact-v__hero">
        <div className="contact-v__hero-inner">
          <nav className="contact-v__breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="contact-v__bc-sep">/</span>
            <span className="contact-v__bc-current">Contact Us</span>
          </nav>

          <span className="contact-v__eyebrow">CUSTOMER CARE &amp; CONCIERGE</span>

          <h1 className="contact-v__title">
            Connect with Our Atelier.
          </h1>

          <p className="contact-v__subtitle">
            Whether you need bag sizing assistance, order tracking, bulk school orders,
            or bespoke corporate requests, our customer concierge team is here to assist you.
          </p>
        </div>
      </section>

      {/* ── Top Contact Channel Cards ── */}
      <section className="contact-v__channels-section">
        <div className="contact-v__container">
          <div className="contact-v__channels-grid" ref={channelsRef}>
            {/* Phone & WhatsApp */}
            <a href="tel:+919876543210" className="contact-v__channel">
              <span className="contact-v__channel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 3.07 9.81 19.79 19.79 0 0 1 1.01 1.18 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L6.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 14.92z" />
                </svg>
              </span>
              <div className="contact-v__channel-body">
                <span className="contact-v__channel-tag">PHONE &amp; WHATSAPP</span>
                <h3 className="contact-v__channel-val">+91 98765 43210</h3>
                <p className="contact-v__channel-sub">Mon – Sat: 10:00 AM – 7:00 PM IST</p>
                <span className="contact-v__channel-link">Call Directly →</span>
              </div>
            </a>

            {/* Email Concierge */}
            <a href="mailto:support@shreemahaveer.com" className="contact-v__channel">
              <span className="contact-v__channel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <div className="contact-v__channel-body">
                <span className="contact-v__channel-tag">EMAIL CONCIERGE</span>
                <h3 className="contact-v__channel-val">support@shreemahaveer.com</h3>
                <p className="contact-v__channel-sub">Guaranteed response within 4 hours</p>
                <span className="contact-v__channel-link">Write to Concierge →</span>
              </div>
            </a>

            {/* Flagship Atelier */}
            <div className="contact-v__channel">
              <span className="contact-v__channel-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <div className="contact-v__channel-body">
                <span className="contact-v__channel-tag">FLAGSHIP SHOWROOM</span>
                <h3 className="contact-v__channel-val">Mumbai Heritage Atelier</h3>
                <p className="contact-v__channel-sub">123 Heritage Lane, Kalbadevi, Mumbai 400002</p>
                <span className="contact-v__channel-link">Mon – Sat: 10:30 AM – 8:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Form & Showroom / FAQ Split ── */}
      <section className="contact-v__main-section">
        <div className="contact-v__container">
          <div className="contact-v__grid">

            {/* ── Left: Form Box ── */}
            <div className="contact-v__form-panel">
              {sent ? (
                <div className="contact-v__success">
                  <div className="contact-v__success-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <h3 className="contact-v__success-title">Message Received!</h3>
                  <p className="contact-v__success-desc">
                    Thank you for reaching out to Shree Mahaveer Collections.
                    A member of our concierge team has received your message and will respond within 4 business hours.
                  </p>
                  <div className="contact-v__ticket">
                    <span>Reference Ticket:</span>
                    <strong>SMC-{Math.floor(100000 + Math.random() * 900000)}</strong>
                  </div>
                  <button
                    type="button"
                    className="contact-v__btn contact-v__btn--gold"
                    onClick={() => setSent(false)}
                  >
                    SEND ANOTHER MESSAGE
                  </button>
                </div>
              ) : (
                <form className="contact-v__form" onSubmit={handleSubmit} noValidate>
                  <div className="contact-v__form-head">
                    <span className="contact-v__section-tag">ONLINE INQUIRY</span>
                    <h2 className="contact-v__form-title">Send Our Concierge a Message</h2>
                    <p className="contact-v__form-sub">
                      Fill out the form below and we will get back to you promptly.
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="contact-v__cats">
                    <label className="contact-v__cats-label">Inquiry Category:</label>
                    <div className="contact-v__cats-pills">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`contact-v__cat-pill${form.category === cat ? ' is-active' : ''}`}
                          onClick={() => handleCategorySelect(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="contact-v__fields-grid">
                    <div className="contact-v__field">
                      <label className="contact-v__label" htmlFor="contact-name">
                        Full Name <span className="contact-v__req">*</span>
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        className="contact-v__input"
                        placeholder="e.g. Rahul Sharma"
                        value={form.name}
                        onChange={handleChange('name')}
                        required
                      />
                    </div>

                    <div className="contact-v__field">
                      <label className="contact-v__label" htmlFor="contact-email">
                        Email Address <span className="contact-v__req">*</span>
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        className="contact-v__input"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange('email')}
                        required
                      />
                    </div>
                  </div>

                  <div className="contact-v__fields-grid">
                    <div className="contact-v__field">
                      <label className="contact-v__label" htmlFor="contact-phone">
                        Phone Number
                      </label>
                      <input
                        id="contact-phone"
                        type="tel"
                        className="contact-v__input"
                        placeholder="+91 98765 00000"
                        value={form.phone}
                        onChange={handleChange('phone')}
                      />
                    </div>

                    <div className="contact-v__field">
                      <label className="contact-v__label" htmlFor="contact-subject">
                        Subject
                      </label>
                      <input
                        id="contact-subject"
                        type="text"
                        className="contact-v__input"
                        placeholder="How can we help you?"
                        value={form.subject}
                        onChange={handleChange('subject')}
                      />
                    </div>
                  </div>

                  <div className="contact-v__field">
                    <label className="contact-v__label" htmlFor="contact-message">
                      Your Message <span className="contact-v__req">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      className="contact-v__input contact-v__input--textarea"
                      placeholder="Please share order numbers, school details, or specific bag requirements…"
                      rows={5}
                      value={form.message}
                      onChange={handleChange('message')}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="contact-v__btn contact-v__btn--submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'TRANSMITTING MESSAGE…' : 'SEND MESSAGE →'}
                  </button>
                </form>
              )}
            </div>

            {/* ── Right: Showroom & FAQ Panel ── */}
            <div className="contact-v__side-panel">
              {/* Showroom Visual Card */}
              <div className="contact-v__showroom-card">
                <div className="contact-v__showroom-frame">
                  <img
                    src={showroomImg}
                    alt="Shree Mahaveer Collections Mumbai Flagship Showroom"
                    className="contact-v__showroom-img"
                    loading="lazy"
                  />
                  <div className="contact-v__showroom-status">
                    <span className="contact-v__status-dot" />
                    <span>Concierge Desk Online</span>
                  </div>
                </div>

                <div className="contact-v__showroom-info">
                  <h3 className="contact-v__showroom-title">Mumbai Flagship Showroom</h3>
                  <p className="contact-v__showroom-address">
                    Experience over 150+ handcrafted backpacks, executive tech carriers, and student collections in person.
                  </p>
                  <div className="contact-v__showroom-hours">
                    <span>Operating Hours:</span>
                    <strong>Monday – Saturday, 10:30 AM – 8:00 PM</strong>
                  </div>
                </div>
              </div>

              {/* FAQ Accordion */}
              <div className="contact-v__faq-card">
                <h3 className="contact-v__faq-header">Frequently Asked Questions</h3>
                <div className="contact-v__faq-list">
                  {FAQS.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div
                        key={idx}
                        className={`contact-v__faq-item${isOpen ? ' is-open' : ''}`}
                      >
                        <button
                          type="button"
                          className="contact-v__faq-btn"
                          onClick={() => setOpenFaq(isOpen ? null : idx)}
                          aria-expanded={isOpen}
                        >
                          <span>{faq.q}</span>
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="contact-v__faq-icon"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        {isOpen && (
                          <div className="contact-v__faq-answer">
                            <p>{faq.a}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Institutional Supply & School Orders Strip ── */}
      <section className="contact-v__corp-strip">
        <div className="contact-v__container">
          <div className="contact-v__corp-card">
            <div className="contact-v__corp-content">
              <span className="contact-v__section-tag">INSTITUTIONAL PARTNERSHIPS</span>
              <h2 className="contact-v__corp-title">Ordering for Schools, Colleges or Corporate?</h2>
              <p className="contact-v__corp-desc">
                We design custom ergonomic student bags and corporate executive carry with institutional branding,
                dedicated account managers, and bulk wholesale pricing tiers.
              </p>
            </div>
            <div className="contact-v__corp-action">
              <a href="tel:+919876543210" className="contact-v__btn contact-v__btn--gold">
                CALL BULK DESK: +91 98765 43210
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;
