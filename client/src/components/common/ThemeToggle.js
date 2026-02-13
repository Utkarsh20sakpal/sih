import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

const ThemeToggle = ({ className = '', size = 'sm' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <i className={`bi bi-${theme === 'light' ? 'moon-stars-fill' : 'sun-fill'}`}></i>
      <span className="ms-2 d-none d-md-inline">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </Button>
  );
};

export default ThemeToggle;

