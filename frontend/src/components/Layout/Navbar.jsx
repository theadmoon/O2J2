import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import { Menu, X, LogOut, LayoutDashboard, Plus } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Services', href: '/#services' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Our Work', href: '/#demo-videos' },
  { label: 'Contact', href: '/#contact' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleNavClick = (href) => {
    setOpen(false);
    if (href.startsWith('/#')) {
      const id = href.substring(2);
      if (location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <Logo />

          <nav className="hidden md:flex items-center space-x-8 text-base font-medium">
            {/* Public nav links */}
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.href)}
                className="text-gray-600 hover:text-sky-600 transition"
                data-testid={`nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {link.label}
              </button>
            ))}

            {/* Auth links */}
            {user && user.id ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-sky-600 transition flex items-center gap-1.5" data-testid="nav-dashboard">
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </Link>
                <Link to="/projects/new" className="text-gray-700 hover:text-sky-600 transition flex items-center gap-1.5" data-testid="nav-new-project">
                  <Plus className="w-4 h-4" /> New Project
                </Link>
                <button onClick={handleLogout} className="text-gray-700 hover:text-sky-600 transition flex items-center gap-1.5" data-testid="nav-logout">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
                <span className="text-xs text-gray-400 font-normal">{user.name}</span>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-sky-600 transition" data-testid="nav-login">Login</Link>
                <Link to="/register" className="bg-gradient-to-r from-sky-500 to-teal-500 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:from-sky-600 hover:to-teal-600 transition shadow-lg" data-testid="nav-register">Start Project</Link>
              </>
            )}
          </nav>

          <button className="md:hidden text-gray-700" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3 shadow-lg">
          {NAV_LINKS.map((link) => (
            <button key={link.label} onClick={() => handleNavClick(link.href)} className="block text-gray-700 text-sm py-2 hover:text-sky-600 w-full text-left">{link.label}</button>
          ))}
          {user && user.id ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-gray-700 text-sm py-2 hover:text-sky-600">Dashboard</Link>
              <Link to="/projects/new" onClick={() => setOpen(false)} className="block text-gray-700 text-sm py-2 hover:text-sky-600">New Project</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="block text-gray-700 text-sm py-2 hover:text-sky-600">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block text-gray-700 text-sm py-2 hover:text-sky-600">Login</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block text-sky-600 text-sm py-2 font-semibold">Start Project</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
