import { useState } from 'react';
import { Link } from 'react-router-dom';
import './style.scss';

// ── SVG icons ─────────────────────────────────────────────────
const Ig  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor"/></svg>;
const Fb  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>;
const Yt  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22.5 6.3a2.8 2.8 0 00-2-2C18.9 4 12 4 12 4s-6.9 0-8.5.3a2.8 2.8 0 00-2 2A29 29 0 001 12a29 29 0 00.5 5.7 2.8 2.8 0 002 2C5.1 20 12 20 12 20s6.9 0 8.5-.3a2.8 2.8 0 002-2A29 29 0 0023 12a29 29 0 00-.5-5.7z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/></svg>;
const Pin = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5z"/></svg>;

const PhoneIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 01-2.2 2A19.8 19.8 0 013.1 5.2 2 2 0 015.1 3h3a2 2 0 012 1.7 12.8 12.8 0 00.7 2.8 2 2 0 01-.5 2.1l-1.3 1.3a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5 12.8 12.8 0 002.8.7A2 2 0 0122 16.9z"/></svg>;
const MailIcon  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const LocIcon   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const ArrowIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;

const SHOP_LINKS = [
  { label: 'School Bags',  to: '/products?category_name=School+Bags' },
  { label: 'Backpacks',    to: '/products?category_name=Backpacks' },
  { label: 'Laptop Bags',  to: '/products?category_name=Laptop+Bags' },
  { label: 'Ladies Bags',  to: '/products?category_name=Ladies+Bags' },
  { label: 'Sling Bags',   to: '/products?category_name=Sling+Bags' },
  { label: 'Travel Bags',  to: '/products?category_name=Travel+Bags' },
  { label: 'New Arrivals', to: '/products/new-arrivals' },
];

const HELP_LINKS = [
  { label: 'Track Order',       to: '/contact' },
  { label: 'Shipping Policy',   to: '/shipping-returns' },
  { label: 'Returns & Refunds', to: '/shipping-returns' },
  { label: 'FAQ',               to: '/contact' },
  { label: 'Contact Us',        to: '/contact' },
];

const ABOUT_LINKS = [
  { label: 'Our Story',      to: '/about' },
  { label: 'Why SMC',        to: '/craftsmanship' },
  { label: 'Sustainability', to: '/sustainability' },
  { label: 'Blog',           to: '/about' },
  { label: 'Privacy Policy', to: '/privacy-policy' },
];

function Footer() {
  const [email, setEmail] = useState('');

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email.trim()) setEmail('');
  };

  return (
    <footer className="v-footer">
      <div className="v-footer__grid">

        {/* ── Brand column ── */}
        <div className="v-footer__brand">
          <Link to="/home" className="v-footer__logo">
           VORANO

            <small>INDIA</small>
          </Link>
          <p className="v-footer__tagline">
            Bags for a Brighter Tomorrow.<br />
            Stylish. Functional. For Every Journey.
          </p>
          <div className="v-footer__social">
            <a href="#" aria-label="Instagram"><Ig /></a>
            <a href="#" aria-label="Facebook"><Fb /></a>
            <a href="#" aria-label="YouTube"><Yt /></a>
            <a href="#" aria-label="Pinterest"><Pin /></a>
          </div>
        </div>

        {/* ── Shop ── */}
        <div className="v-footer__col">
          <h4>Shop</h4>
          {SHOP_LINKS.map(({ label, to }) => (
            <Link key={label} to={to}>{label}</Link>
          ))}
        </div>

        {/* ── Help ── */}
        <div className="v-footer__col">
          <h4>Help</h4>
          {HELP_LINKS.map(({ label, to }) => (
            <Link key={label} to={to}>{label}</Link>
          ))}
        </div>

        {/* ── About ── */}
        <div className="v-footer__col">
          <h4>About</h4>
          {ABOUT_LINKS.map(({ label, to }) => (
            <Link key={label} to={to}>{label}</Link>
          ))}
        </div>

        {/* ── Contact + Newsletter ── */}
        <div className="v-footer__col">
          <h4>Contact</h4>
          <div className="v-footer__contact-row">
            <PhoneIcon />
            <span>+91 98765 43210</span>
          </div>
          <div className="v-footer__contact-row">
            <MailIcon />
            <span>support@shreemahaveer.in</span>
          </div>
          <div className="v-footer__contact-row">
            <LocIcon />
            <span>Noida, Uttar Pradesh, India</span>
          </div>

          <h4 style={{ marginTop: '20px' }}>Newsletter</h4>
          <p className="v-footer__nl-sub">Get exclusive offers &amp; new arrivals.</p>
          <form onSubmit={handleNewsletter} className="v-footer__newsletter">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Newsletter email"
            />
            <button type="submit" aria-label="Subscribe">
              <ArrowIcon />
            </button>
          </form>
        </div>

      </div>

      {/* ── Copyright ── */}
      <div className="v-footer__bottom">
        <span>© 2026 Shree Mahaveer Collections. All rights reserved.</span>
        <span>
          <Link to="/privacy-policy" style={{ color: '#666', textDecoration: 'none' }}>Privacy Policy</Link>
          &nbsp;|&nbsp;
          <Link to="/shipping-returns" style={{ color: '#666', textDecoration: 'none' }}>Terms</Link>
        </span>
        <span>Made with ❤️ in India</span>
      </div>
    </footer>
  );
}

export default Footer;

/*
 * OLD FOOTER preserved as comment
 * ─────────────────────────────────────────────
 * Previous used site-footer, site-footer__container,
 * site-footer__brand, site-footer__col, site-footer__bottom,
 * site-footer__mobile-bar (mobile action bar).
 */
