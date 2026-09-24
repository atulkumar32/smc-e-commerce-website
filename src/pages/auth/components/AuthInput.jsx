export default function AuthInput({
  id,
  label,
  type = 'text',
  icon,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  autoComplete,
  readOnly = false,
  maxLength,
  disabled = false,
  helperText,
}) {
  return (
    <div className={`auth-input-group${error ? ' auth-input-group--error' : ''}${readOnly ? ' auth-input-group--readonly' : ''}`}>
      <div className="auth-input-group__label-row">
        <label htmlFor={id} className="auth-input-group__label">
          {label} {required && <span className="auth-input-group__req" aria-hidden="true">*</span>}
        </label>
        {helperText && <span className="auth-input-group__helper">{helperText}</span>}
      </div>

      <div className="auth-input-group__field-wrap">
        {icon && <span className="auth-input-group__icon" aria-hidden="true">{icon}</span>}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          readOnly={readOnly}
          maxLength={maxLength}
          disabled={disabled}
          className={`auth-input-group__input${icon ? ' auth-input-group__input--with-icon' : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>

      {error && (
        <span id={`${id}-error`} className="auth-input-group__err-msg" role="alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}

