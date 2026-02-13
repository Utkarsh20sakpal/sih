import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  showPasswordToggle = false,
  showPassword = false,
  onTogglePassword,
  className = '',
  ...props
}) => {
  const inputId = `input-${name}`;
  const hasError = !!error;

  return (
    <div className={`form-group-modern ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label-modern">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      
      <div className="input-wrapper-modern">
        <input
          id={inputId}
          type={type === 'password' && showPassword ? 'text' : type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-control-modern ${hasError ? 'is-invalid' : ''}`}
          style={{
            paddingRight: showPasswordToggle ? '2.75rem' : undefined
          }}
          {...props}
        />
        
        {showPasswordToggle && (
          <button
            type="button"
            className="password-toggle-btn"
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
          </button>
        )}
      </div>
      
      {error && (
        <div className="form-error-modern">
          {error}
        </div>
      )}
      
      {helperText && !error && (
        <div className="form-helper-modern">
          {helperText}
        </div>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  showPasswordToggle: PropTypes.bool,
  showPassword: PropTypes.bool,
  onTogglePassword: PropTypes.func,
  className: PropTypes.string
};

export default Input;

