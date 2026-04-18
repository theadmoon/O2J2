import React from 'react';
import Logo from './Logo';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#050A14] border-t border-white/10 py-12 px-6" data-testid="footer">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <Logo size="small" />
          <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
            Professional Digital Video Production Services. Custom videos delivered electronically.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-mono text-slate-400 mb-4">Contact</h4>
          <div className="space-y-2 text-sm text-slate-300">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#FF6B6B]" /> ocean2joy@gmail.com</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#FF6B6B]" /> +995 555 375 032</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#FF6B6B]" /> Tbilisi, Georgia</div>
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.2em] font-mono text-slate-400 mb-4">Legal</h4>
          <div className="text-sm text-slate-400 space-y-1">
            <p>Individual Entrepreneur Vera Iambaeva</p>
            <p>Tax ID: 302335809</p>
            <p>Country of Registration: Georgia</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Ocean2Joy Digital Video Production. All rights reserved.
      </div>
    </footer>
  );
}
