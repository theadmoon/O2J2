import React from 'react';
import Logo from './Logo';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-12 px-6" data-testid="footer">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        <div>
          <Logo size="small" />
          <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs">
            Professional Digital Video Production Services. Custom videos delivered electronically.
          </p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-700 mb-4">Contact</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-sky-600" /> ocean2joy@gmail.com</div>
            <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-sky-600" /> +995 555 375 032</div>
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-600" /> Tbilisi, Georgia</div>
          </div>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-700 mb-4">Legal</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Individual Entrepreneur Vera Iambaeva</p>
            <p>Tax ID: 302335809</p>
            <p>Country of Registration: Georgia</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Ocean2Joy Digital Video Production. All rights reserved.
      </div>
    </footer>
  );
}
