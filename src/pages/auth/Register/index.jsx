import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerAction } from '../../../Actions/AuthAction';
import './style.scss';

// ─────────────────────────────────────────────────────────────────────────────
//  ICONS (inline SVG — no MUI)
// ─────────────────────────────────────────────────────────────────────────────
const IconMail   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconPerson = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconPhone  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"/></svg>;
const IconCity   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconMap    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>;
const IconGlobe  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>;
const IconHome   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const IconLock   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>;
const IconCheck  = ({ met }) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={met ? '#69f0ae' : 'rgba(255,255,255,0.25)'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>;
const IconSpin   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="auth-spin"><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>;
const IconOk     = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;

const IconEye = ({ off }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {off ? (<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>) : (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>)}
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function pwStrength(pw) {
  if (!pw) return { pct: 0, label: '', color: 'rgba(255,255,255,0.1)' };
  let s = 0;
  if (pw.length >= 8)          s++;
  if (pw.length >= 12)         s++;
  if (/[A-Z]/.test(pw))        s++;
  if (/[0-9]/.test(pw))        s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    null,
    { pct: 20, label: 'Weak',      color: '#ef5350' },
    { pct: 40, label: 'Fair',      color: '#ffa726' },
    { pct: 60, label: 'Good',      color: '#29b6f6' },
    { pct: 80, label: 'Strong',    color: '#66bb6a' },
    { pct: 100, label: 'Very Strong', color: '#69f0ae' },
  ];
  return map[s] ?? map[1];
}

function validate(f) {
  const e = {};
  if (!f.first_name.trim())      e.first_name      = 'Required';
  if (!f.last_name.trim())       e.last_name       = 'Required';
  if (!f.email.trim())           e.email           = 'Required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Invalid email';
  if (!f.phone_number.trim())    e.phone_number    = 'Required';
  else if (!/^\d{10}$/.test(f.phone_number.replace(/\s/g,''))) e.phone_number = '10 digits required';
  if (!f.city.trim())            e.city            = 'Required';
  if (!f.state.trim())           e.state           = 'Required';
  if (!f.country.trim())         e.country         = 'Required';
  if (!f.landmark_address.trim()) e.landmark_address = 'Required';
  if (!f.password)               e.password        = 'Required';
  else if (f.password.length < 8) e.password       = 'Min 8 characters';
  else if (!/[A-Z]/.test(f.password)) e.password   = 'Add an uppercase letter';
  else if (!/[0-9]/.test(f.password)) e.password   = 'Add a number';
  if (!f.confirm_password)       e.confirm_password = 'Required';
  else if (f.password !== f.confirm_password) e.confirm_password = 'Passwords do not match';
  return e;
}

const EMPTY = {
  first_name:'', last_name:'', email:'', phone_number:'',
  city:'', state:'', country:'India', landmark_address:'',
  password:'', confirm_password:'',
};

// ─────────────────────────────────────────────────────────────────────────────
//  FIELD component
// ─────────────────────────────────────────────────────────────────────────────
function Field({ id, label, icon, error, children }) {
  return (
    <div className="auth-form__field">
      <label className="auth-form__label" htmlFor={id}>{label}</label>
      <div className={`auth-form__input-wrap${error ? ' auth-form__input-wrap--err' : ''}`}>
        {icon && <span className="auth-form__icon">{icon}</span>}
        {children}
      </div>
      {error && <span className="auth-form__error-msg">{error}</span>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 1 — Email entry
// ─────────────────────────────────────────────────────────────────────────────
function StepEmail({ email, onChange, onNext, loading, error }) {
  return (
    <>
      <div className="auth-card__welcome">
        <h1 className="auth-card__headline">Join the Heritage</h1>
        <p className="auth-card__sub">Enter your email to get started. We'll send you a verification code.</p>
      </div>

      {error && <div className="auth-card__error" role="alert">{error}</div>}

      <form className="auth-form" onSubmit={onNext} noValidate>
        <Field id="reg-email" label="Email Address" icon={<IconMail />}>
          <input
            id="reg-email"
            type="email"
            className="auth-form__input"
            placeholder="alexander@heritage.com"
            value={email}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="email"
            required
          />
        </Field>

        <button type="submit" className="auth-btn auth-btn--gold" disabled={loading}>
          {loading ? <><IconSpin /> Sending OTP…</> : 'Send Verification Code'}
        </button>

        <div className="auth-divider"><span>Or sign up with</span></div>

        <div className="auth-social">
          <button type="button" className="auth-social__btn">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0s_-kRD4lv7VZUN0z0-BtkhozflZbx4-4sUuh1yVpbtLhzdD6ePeImR_21lPL4YRWaa_X24oqh57zOhJjS4J7wzmpHUN4oDA-qhNSMJXsvsTPbMIFsRZ1WNqrGW7sqoiZDKnCvTPaLqmRJK_9C260dwcqmXoSid7WA4JgFZTeHOOAOJLDSd2lVuYBHXfIIFcZsfpagvQS98gbx7j06vMqOdCjntXwrKHHRVYM1WSZFEtqXgQj-RqUpqNTsXBpd9j24-lzF3NKAV4"
              alt="Google" width="20" height="20" />
            Google
          </button>
          <button type="button" className="auth-social__btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        <p className="auth-card__footer-text">
          Already a member? <Link to="/login" className="auth-card__footer-link">Sign In</Link>
        </p>
      </form>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 2 — OTP verification
// ─────────────────────────────────────────────────────────────────────────────
function StepOTP({ email, otp, onChange, onVerify, onResend, loading, error, resendCooldown }) {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleKey = (i, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[i] = val;
    onChange(next);
    if (val && i < 5) refs[i + 1].current?.focus();
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...otp];
    digits.forEach((d, i) => { next[i] = d; });
    onChange(next);
    refs[Math.min(digits.length, 5)].current?.focus();
  };

  return (
    <>
      <div className="auth-card__welcome">
        <h1 className="auth-card__headline">Verify Email</h1>
        <p className="auth-card__sub">
          We sent a 6-digit code to <strong style={{ color: '#D4AF37' }}>{email}</strong>.
          Enter it below to continue.
        </p>
      </div>

      {error && <div className="auth-card__error" role="alert">{error}</div>}

      <form className="auth-form" onSubmit={onVerify} noValidate>
        <div className="auth-otp" role="group" aria-label="OTP input">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className="auth-otp__box"
              value={digit}
              onChange={(e) => handleKey(i, e)}
              onKeyDown={(e) => e.key === 'Backspace' && handleKey(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>

        <button type="submit" className="auth-btn auth-btn--gold" disabled={loading || otp.join('').length < 6}>
          {loading ? <><IconSpin /> Verifying…</> : 'Verify & Continue'}
        </button>

        <p className="auth-card__footer-text">
          Didn&apos;t receive it?{' '}
          {resendCooldown > 0 ? (
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Resend in {resendCooldown}s</span>
          ) : (
            <button type="button" className="auth-card__footer-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={onResend}>
              Resend Code
            </button>
          )}
        </p>
      </form>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  STEP 3 — Full registration form
// ─────────────────────────────────────────────────────────────────────────────
function StepForm({ form, errors, onChange, onSubmit, loading, submitError }) {
  const [showPwd, setShowPwd]     = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const strength = pwStrength(form.password);

  const inp = (field) => (e) => onChange(field, e.target.value);

  return (
    <>
      <div className="auth-card__welcome">
        <h1 className="auth-card__headline" style={{ fontSize: '1.75rem' }}>Create Account</h1>
        <p className="auth-card__sub">Fill in your details to complete registration.</p>
      </div>

      {submitError && <div className="auth-card__error" role="alert">{submitError}</div>}

      <form className="auth-form" onSubmit={onSubmit} noValidate>
        {/* Personal */}
        <p className="auth-form__section">Personal Information</p>
        <div className="auth-form__row">
          <Field id="reg-fn" label="First Name" icon={<IconPerson />} error={errors.first_name}>
            <input id="reg-fn" type="text" className={`auth-form__input${errors.first_name ? ' auth-form__input--error' : ''}`}
              placeholder="Alexander" value={form.first_name} onChange={inp('first_name')} required />
          </Field>
          <Field id="reg-ln" label="Last Name" icon={<IconPerson />} error={errors.last_name}>
            <input id="reg-ln" type="text" className={`auth-form__input${errors.last_name ? ' auth-form__input--error' : ''}`}
              placeholder="Sterling" value={form.last_name} onChange={inp('last_name')} required />
          </Field>
        </div>
        <div className="auth-form__row">
          <Field id="reg-email2" label="Email" icon={<IconMail />} error={errors.email}>
            <input id="reg-email2" type="email" className="auth-form__input" value={form.email} readOnly
              style={{ opacity: 0.6, cursor: 'not-allowed' }} />
          </Field>
          <Field id="reg-phone" label="Phone" icon={<IconPhone />} error={errors.phone_number}>
            <input id="reg-phone" type="tel" className={`auth-form__input${errors.phone_number ? ' auth-form__input--error' : ''}`}
              placeholder="9876543210" maxLength={10} value={form.phone_number} onChange={inp('phone_number')} required />
          </Field>
        </div>

        {/* Address */}
        <p className="auth-form__section">Address Details</p>
        <div className="auth-form__row">
          <Field id="reg-city" label="City" icon={<IconCity />} error={errors.city}>
            <input id="reg-city" type="text" className={`auth-form__input${errors.city ? ' auth-form__input--error' : ''}`}
              placeholder="Mumbai" value={form.city} onChange={inp('city')} required />
          </Field>
          <Field id="reg-state" label="State" icon={<IconMap />} error={errors.state}>
            <input id="reg-state" type="text" className={`auth-form__input${errors.state ? ' auth-form__input--error' : ''}`}
              placeholder="Maharashtra" value={form.state} onChange={inp('state')} required />
          </Field>
        </div>
        <div className="auth-form__row">
          <Field id="reg-country" label="Country" icon={<IconGlobe />} error={errors.country}>
            <input id="reg-country" type="text" className={`auth-form__input${errors.country ? ' auth-form__input--error' : ''}`}
              placeholder="India" value={form.country} onChange={inp('country')} required />
          </Field>
          <Field id="reg-addr" label="Landmark / Address" icon={<IconHome />} error={errors.landmark_address}>
            <input id="reg-addr" type="text" className={`auth-form__input${errors.landmark_address ? ' auth-form__input--error' : ''}`}
              placeholder="Near Gateway of India" value={form.landmark_address} onChange={inp('landmark_address')} required />
          </Field>
        </div>

        {/* Password */}
        <p className="auth-form__section">Set Password</p>
        <div className="auth-form__row">
          <Field id="reg-pwd" label="Password" icon={<IconLock />} error={errors.password}>
            <input id="reg-pwd" type={showPwd ? 'text' : 'password'}
              className={`auth-form__input auth-form__input--padded-r${errors.password ? ' auth-form__input--error' : ''}`}
              placeholder="••••••••" value={form.password} onChange={inp('password')}
              autoComplete="new-password" required />
            <button type="button" className="auth-form__eye" onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Hide' : 'Show'}>
              <IconEye off={showPwd} />
            </button>
          </Field>
          <Field id="reg-conf" label="Confirm Password" icon={<IconLock />} error={errors.confirm_password}>
            <input id="reg-conf" type={showConf ? 'text' : 'password'}
              className={`auth-form__input auth-form__input--padded-r${errors.confirm_password ? ' auth-form__input--error' : ''}`}
              placeholder="••••••••" value={form.confirm_password} onChange={inp('confirm_password')}
              autoComplete="new-password" required />
            <button type="button" className="auth-form__eye" onClick={() => setShowConf(v => !v)}
              aria-label={showConf ? 'Hide' : 'Show'}>
              <IconEye off={showConf} />
            </button>
          </Field>
        </div>

        {/* Strength bar */}
        {form.password && (
          <div className="auth-strength">
            <div className="auth-strength__bar-wrap">
              <div className="auth-strength__bar">
                <div className="auth-strength__bar-fill" style={{ width: `${strength.pct}%`, backgroundColor: strength.color }} />
              </div>
              <span className="auth-strength__label" style={{ color: strength.color }}>{strength.label}</span>
            </div>
            <div className="auth-strength__rules">
              {[['8+ characters', form.password.length >= 8], ['Uppercase', /[A-Z]/.test(form.password)],
                ['Number', /[0-9]/.test(form.password)], ['Special char', /[^A-Za-z0-9]/.test(form.password)]
              ].map(([lbl, met]) => (
                <span key={lbl} className={`auth-strength__rule${met ? ' is-met' : ''}`}>
                  <IconCheck met={met} /> {lbl}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Terms */}
        <label className="auth-check">
          <input type="checkbox" className="auth-check__box" required />
          <span className="auth-check__label">
            I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </span>
        </label>

        <button type="submit" className="auth-btn auth-btn--gold" disabled={loading}>
          {loading ? <><IconSpin /> Creating account…</> : 'Create Account'}
        </button>

        <p className="auth-card__footer-text">
          Already a member? <Link to="/login" className="auth-card__footer-link">Sign In</Link>
        </p>
      </form>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SUCCESS screen
// ─────────────────────────────────────────────────────────────────────────────
function StepSuccess() {
  return (
    <div className="auth-success">
      <div className="auth-success__icon"><IconOk /></div>
      <h2 className="auth-success__title">Welcome to the Heritage!</h2>
      <p className="auth-success__body">
        Your account has been created successfully. Redirecting you to sign in…
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  BACKGROUND image
// ─────────────────────────────────────────────────────────────────────────────
const BG_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB76070Lv9UJuuAAH67G96WUCLk9UsGXjHdrJXvunV2bQImIaRN1QAoNm0VKtvb5c4lh-Mlcj6_JhMOE5tViKnYx8XW6gVi1hURgM9nFK3BjbiDxBDTfuQBtARCQwaayQeBQqYjLp7xtj9asBziVsoTpeXNyx4qt8PlyYUV_xR7uomwfPhquEUcQwn9GOvoPs59WoQ3ZEYk4fqLI0s2-eOQk7Q_lwKKEp-4AVKtsATRZiIgX0ueUkX0ZexfwP_RTHpvBzGMpoYBkCI';

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN RegisterPage
// ─────────────────────────────────────────────────────────────────────────────
function RegisterPage() {
  const navigate = useNavigate();

  // step: 'email' | 'otp' | 'form' | 'success'
  const [step, setStep]               = useState('email');
  const [email, setEmail]             = useState('');
  const [otp, setOtp]                 = useState(['','','','','','']);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [form, setForm]               = useState({ ...EMPTY });
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [submitError, setSubmitError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Step 1: send OTP (simulated — swap for real API) ──────────────────────
  const handleSendOtp = useCallback(async (e) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // TODO: replace with real OTP send API call
      // await sendOtpAction({ email });
      const mock = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(mock);
      console.info(`[DEV] OTP for ${email}: ${mock}`); // remove in production
      setStep('otp');
      startResendTimer();
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  }, [email]);

  // ── Resend cooldown timer ─────────────────────────────────────────────────
  const startResendTimer = () => {
    setResendCooldown(30);
    const id = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResend = useCallback(() => {
    const mock = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(mock);
    console.info(`[DEV] Resent OTP: ${mock}`);
    setOtp(['','','','','','']);
    setError('');
    startResendTimer();
  }, []);

  // ── Step 2: verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = useCallback((e) => {
    e.preventDefault();
    const entered = otp.join('');
    if (entered.length < 6) { setError('Enter all 6 digits.'); return; }
    setLoading(true);
    setError('');
    setTimeout(() => {
      // TODO: replace with real OTP verify API call
      if (entered === generatedOtp) {
        setForm((prev) => ({ ...prev, email }));
        setStep('form');
      } else {
        setError('Incorrect OTP. Please try again.');
      }
      setLoading(false);
    }, 600);
  }, [otp, generatedOtp, email]);

  // ── Step 3: submit registration ───────────────────────────────────────────
  const handleRegister = useCallback(async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setSubmitError('');
    try {
      const { confirm_password, ...payload } = form;
      await registerAction(payload);
      setStep('success');
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setSubmitError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [form, navigate]);

  const updateForm = (field, val) => {
    setForm((p) => ({ ...p, [field]: val }));
    setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
    setSubmitError('');
  };

  // ── Step dots ─────────────────────────────────────────────────────────────
  const stepIndex = { email: 0, otp: 1, form: 2, success: 3 }[step];

  return (
    <div className="auth-page">
      <div className="auth-page__bg-panel" aria-hidden="true">
        <img src={BG_IMG} alt="" className="auth-page__bg-img" />
        <div className="auth-page__bg-overlay" />
      </div>

      <div className="auth-page__content">
        <header className="auth-page__header">
          <Link to="/" className="auth-page__brand">SHREE MAHAVEER COLLECTIONS</Link>
        </header>

        <main className="auth-page__main">
          <div className="auth-card" style={{ maxWidth: step === 'form' ? '560px' : '460px' }}>
            {/* Step dots */}
            {step !== 'success' && (
              <div className="auth-steps" aria-label="Registration steps">
                {[0,1,2].map((i) => (
                  <div key={i} className={`auth-steps__dot${i === stepIndex ? ' is-active' : i < stepIndex ? ' is-done' : ''}`} />
                ))}
              </div>
            )}

            {step === 'email'   && <StepEmail email={email} onChange={setEmail} onNext={handleSendOtp} loading={loading} error={error} />}
            {step === 'otp'     && <StepOTP email={email} otp={otp} onChange={setOtp} onVerify={handleVerifyOtp} onResend={handleResend} loading={loading} error={error} resendCooldown={resendCooldown} />}
            {step === 'form'    && <StepForm form={form} errors={errors} onChange={updateForm} onSubmit={handleRegister} loading={loading} submitError={submitError} />}
            {step === 'success' && <StepSuccess />}
          </div>
        </main>

        <footer className="auth-page__footer">
          <p>© 2024 MAJESTIC HERITAGE. ALL RIGHTS RESERVED.</p>
          <div className="auth-page__footer-links">
            <Link to="/sustainability">Sustainability</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default RegisterPage;
