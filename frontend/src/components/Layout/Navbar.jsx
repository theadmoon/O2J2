import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';
import { Menu, X, LogOut, LayoutDashboard, Plus } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-[#050A14]/70 border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-6">
          {user && user.id ? (
            <>
              <Link to="/dashboard" className="text-slate-300 hover:text-[#FF6B6B] transition-colors text-sm font-sans flex items-center gap-1.5" data-testid="nav-dashboard">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <Link to="/projects/new" className="text-slate-300 hover:text-[#FF6B6B] transition-colors text-sm font-sans flex items-center gap-1.5" data-testid="nav-new-project">
                <Plus className="w-4 h-4" /> New Project
              </Link>
              <button onClick={handleLogout} className="text-slate-400 hover:text-[#FF6B6B] transition-colors text-sm font-sans flex items-center gap-1.5" data-testid="nav-logout">
                <LogOut className="w-4 h-4" /> Logout
              </button>
              <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">{user.name}</span>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-white transition-colors text-sm" data-testid="nav-login">Sign In</Link>
              <Link to="/register" className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white px-4 py-2 rounded-sm text-sm transition-colors" data-testid="nav-register">Get Started</Link>
            </>
          )}
        </nav>
        <button className="md:hidden text-slate-300" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-[#050A14]/95 backdrop-blur-xl border-t border-white/5 px-6 py-4 space-y-3">
          {user && user.id ? (
            <>
              <Link to="/dashboard" onClick={() => setOpen(false)} className="block text-slate-300 text-sm py-2">Dashboard</Link>
              <Link to="/projects/new" onClick={() => setOpen(false)} className="block text-slate-300 text-sm py-2">New Project</Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="block text-slate-400 text-sm py-2">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block text-slate-300 text-sm py-2">Sign In</Link>
              <Link to="/register" onClick={() => setOpen(false)} className="block text-[#FF6B6B] text-sm py-2">Get Started</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
