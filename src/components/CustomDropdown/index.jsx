/**
 * CustomDropdown/index.jsx
 * A fully custom dropdown — zero MUI Select dependency.
 * Uses a controlled open/close state + click-outside to dismiss.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import './index.scss';

/**
 * @param {object}   props
 * @param {Array}    props.options      — [{ value, label }] or plain number/string array
 * @param {*}        props.value        — currently selected value
 * @param {Function} props.onChange     — (value) => void
 * @param {string}   [props.label]      — floating label above
 * @param {string}   [props.placeholder]
 * @param {string}   [props.error]      — inline error message
 * @param {boolean}  [props.disabled]
 * @param {string}   [props.className]
 */
function CustomDropdown({
  options = [],
  value,
  onChange,
  label,
  placeholder = 'Select…',
  error,
  disabled = false,
  className = '',
}) {
  const [open, setOpen]       = useState(false);
  const containerRef          = useRef(null);

  // Normalise options to { value, label }
  const normalised = options.map((opt) =>
    typeof opt === 'object' && opt !== null
      ? opt
      : { value: opt, label: String(opt) }
  );

  const selected = normalised.find((o) => o.value === value) || null;

  // Close when clicking outside
  const handleOutside = useCallback((e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleOutside);
    } else {
      document.removeEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open, handleOutside]);

  const handleSelect = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); }
    if (e.key === 'Escape') setOpen(false);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const idx = normalised.findIndex((o) => o.value === value);
      const next = normalised[idx + 1];
      if (next) onChange?.(next.value);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const idx = normalised.findIndex((o) => o.value === value);
      const prev = normalised[idx - 1];
      if (prev) onChange?.(prev.value);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`cdropdown ${className} ${error ? 'cdropdown--error' : ''} ${disabled ? 'cdropdown--disabled' : ''}`}
    >
      {label && <span className="cdropdown__label">{label}</span>}

      <button
        type="button"
        className={`cdropdown__trigger ${open ? 'cdropdown__trigger--open' : ''}`}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className={`cdropdown__value ${!selected ? 'cdropdown__value--placeholder' : ''}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`cdropdown__arrow ${open ? 'cdropdown__arrow--open' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className={`cdropdown__menu ${open ? 'cdropdown__menu--open' : ''}`} role="listbox">
        {normalised.length === 0 ? (
          <div className="cdropdown__empty">No options</div>
        ) : (
          normalised.map((opt) => (
            <div
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              className={`cdropdown__option ${opt.value === value ? 'cdropdown__option--selected' : ''}`}
              onMouseDown={(e) => e.preventDefault()} // prevent blur before click
              onClick={() => handleSelect(opt)}
            >
              {opt.value === value && (
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" className="cdropdown__check">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {opt.label}
            </div>
          ))
        )}
      </div>

      {error && <span className="cdropdown__error">{error}</span>}
    </div>
  );
}

export default CustomDropdown;

