import { useMemo } from 'react';
import { passwordStrength } from '../../../utils/validators';

export default function PasswordStrengthBar({ password = '' }) {
  const strength = useMemo(() => passwordStrength(password), [password]);

  if (!password) return null;

  const rules = [
    { label: '8+ Characters', met: password.length >= 8 },
    { label: 'Uppercase Letter', met: /[A-Z]/.test(password) },
    { label: 'Number (0-9)', met: /[0-9]/.test(password) },
    { label: 'Special Character', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="auth-strength" aria-live="polite">
      <div className="auth-strength__bar-row">
        <span className="auth-strength__title">Password Strength:</span>
        <span className="auth-strength__status" style={{ color: strength.color }}>
          {strength.label}
        </span>
      </div>

      <div className="auth-strength__track">
        <div
          className="auth-strength__fill"
          style={{
            width: `${strength.pct}%`,
            backgroundColor: strength.color,
          }}
        />
      </div>

      <div className="auth-strength__rules">
        {rules.map((r) => (
          <span
            key={r.label}
            className={`auth-strength__rule${r.met ? ' auth-strength__rule--met' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11" aria-hidden="true">
              {r.met ? (
                <polyline points="20 6 9 17 4 12" />
              ) : (
                <circle cx="12" cy="12" r="9" />
              )}
            </svg>
            {r.label}
          </span>
        ))}
      </div>
    </div>
  );
}

