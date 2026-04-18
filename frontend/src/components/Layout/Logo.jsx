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
    <Link to="/" className={`flex items-center gap-2 font-serif tracking-tight ${sizes[size]}`} data-testid="logo-link">
      <Waves className="w-6 h-6 text-[#FF6B6B]" />
      <span className="text-[#F8FAFC] font-light">Ocean<span className="text-[#FF6B6B] font-semibold">2</span>Joy</span>
    </Link>
  );
}
