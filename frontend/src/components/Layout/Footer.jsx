import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { Mail, Phone, MapPin } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const FOOTER_SERVICES = [
  { label: 'All Services', href: '/#services' },
  { label: 'Custom Video', href: '/#services' },
  { label: 'Video Editing', href: '/#services' },
  { label: 'AI-Generated', href: '/#services' },
];

const FOOTER_COMPANY = [
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Legal Info', href: '#' },
];

const FOOTER_POLICIES = [
  { label: 'Digital Delivery Policy', href: '#' },
  { label: 'Refund Policy', href: '#' },
  { label: 'Revision Policy', href: '#' },
];

const SOCIAL_LINKS = [
  { icon: FaFacebook, href: '#', label: 'Facebook' },
  { icon: FaTwitter, href: '#', label: 'Twitter' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaYoutube, href: '#', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-gray-300 pt-16 pb-8 px-6" data-testid="footer" id="contact">
      <div className="max-w-7xl mx-auto">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Logo size="small" variant="dark" />
            <p className="mt-4 text-sm text-gray-400 leading-relaxed max-w-xs">
              Professional Digital Video Production Services. Custom videos delivered electronically. No physical shipping.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-4 mt-6">
              {SOCIAL_LINKS.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-700 hover:bg-sky-600 rounded-full flex items-center justify-center transition-colors"
                  aria-label={social.label} data-testid={`social-${social.label.toLowerCase()}`}>
                  <social.icon className="text-sm text-white" />
                </a>
              ))}
            </div>
            {/* Contact */}
            <div className="mt-6 space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-sky-400" /> ocean2joy@gmail.com</div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-sky-400" /> +995 555 375 032</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-400" /> Tbilisi, Georgia</div>
            </div>
          </div>

          {/* Services column */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">Services</h4>
            <ul className="space-y-2">
              {FOOTER_SERVICES.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-400 hover:text-sky-400 transition">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {FOOTER_COMPANY.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-400 hover:text-sky-400 transition">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies column */}
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-white mb-4">Policies</h4>
            <ul className="space-y-2">
              {FOOTER_POLICIES.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-gray-400 hover:text-sky-400 transition">{link.label}</a>
                </li>
              ))}
            </ul>
            {/* Legal */}
            <div className="mt-6 text-xs text-gray-500 space-y-1">
              <p>Individual Entrepreneur Vera Iambaeva</p>
              <p>Tax ID: 302335809</p>
              <p>Country of Registration: Georgia</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
          &copy; 2025-{new Date().getFullYear()} Ocean2Joy Digital Video Production. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
