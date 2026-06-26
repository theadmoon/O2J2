import React from 'react';

function Logo({ variant = 'vertical', className = '' }) {
  const src = variant === 'horizontal' ? '/logo-horizontal.svg' : '/logo-vertical.svg';
  const defaultClass = variant === 'horizontal' ? 'h-24' : 'h-32';
  return (
    <img
      src={src}
      alt="Ocean2Joy"
      className={className || defaultClass}
    />
  );
}

export default Logo;
