import React from 'react';

function Logo({ variant = 'vertical', className = '' }) {
  const defaultClass = variant === 'horizontal' ? 'h-24' : 'h-32';
  return (
    <img
      src="/ocean2joy-logo.svg"
      alt="Ocean2Joy"
      className={className || defaultClass}
    />
  );
}

export default Logo;
