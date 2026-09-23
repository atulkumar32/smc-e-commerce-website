/**
 * CustomSelect — accessible dropdown without MUI dependency.
 * Props:
 *   options: [{ label, value }]
 *   value, onChange, placeholder, disabled, error
 */
import { useState, useRef, useEffect } from 'react';
import './index.scss';

export default function CustomSelect({
  options = [],
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  error = '',
  label = '',
  id = '',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Keyboard navigation
  const handleKey = (e) => {
    if (e.key === 'Escape')   setOpen(false);
    if (e.key === 'Enter' || e.key === ' ') setOpen(o => !o);
    if (e.key === 'ArrowDown') {
      const idx = options.findIndex(o => o.value === value);
      if (idx < options.length - 1) onChange(options[idx + 1].value);
    }
    if (e.key === 'ArrowUp') {
      const idx = options.findIndex(o => o.value === value);
      if (idx > 0) onChange(options[idx - 1].value);
    }
  };

  const selected = options.find(o => o.value === value);

  return (
    <div className={`csel${disabled ? ' csel--disabled' : ''}${error ? ' csel--error' : ''}`} ref={ref}>
      {label && <label className="csel__label" htmlFor={id}>{label}</label>}
      <button
        type="button"
        id={id}
        className={`csel__trigger${open ? ' csel__trigger--open' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        onKeyDown={handleKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled}
        disabled={disabled}
      >
        <span className={`csel__value${!selected ? ' csel__value--placeholder' : ''}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg className={`csel__caret${open ? ' csel__caret--up' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <ul className="csel__menu" role="listbox" aria-label={label || placeholder}>
          {options.map(opt => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`csel__option${opt.value === value ? ' csel__option--selected' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
            >
              {opt.label}
              {opt.value === value && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && <p className="csel__error">{error}</p>}
    </div>
  );
}
