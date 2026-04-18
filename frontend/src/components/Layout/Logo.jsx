import React from 'react';
import { Link } from 'react-router-dom';
import { Waves } from 'lucide-react';

export default function Logo({ size = 'default' }) {
  const sizes = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl',
  };
  return (
    <Link to="/" className={`flex items-center gap-2 tracking-tight ${sizes[size]}`} data-testid="logo-link">
      <Waves className="w-6 h-6 text-sky-500" />
      <span className="text-gray-900 font-semibold">Ocean<span className="text-sky-500 font-bold">2</span>Joy</span>
    </Link>
  );
}
