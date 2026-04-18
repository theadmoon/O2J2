import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiMenu, HiX } from 'react-icons/hi';
import { useState } from 'react';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout, quickSwitch } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleQuickSwitch = async (role) => {
    await quickSwitch(role);
    navigate('/');
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">

          {/* Logo */}
          <Link to="/" className="flex items-center relative -ml-16 -mt-3">
            <Logo variant="horizontal" className="h-36 w-auto" style={{ objectFit: 'contain', display: 'block' }} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8 text-base font-medium">
            <Link to="/services" className="text-gray-700 hover:text-sky-600 transition">
              Services
            </Link>
            <Link to="/how-it-works" className="text-gray-700 hover:text-sky-600 transition">
              How It Works
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-sky-600 transition">
              Contact
            </Link>

            {user && user.id ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-sky-600 font-medium transition">
                  Dashboard
                </Link>
                {user?.role === 'admin' || user?.role === 'manager' ? (
                  <Link to="/admin" className="text-gray-700 hover:text-sky-600 font-medium transition">
                    Admin
                  </Link>
                ) : null}

                {/* Quick Switch Buttons (TEMPORARY - for testing) */}
                <div className="flex items-center gap-2 px-4 border-l border-r border-gray-300">
                  <span className="text-xs text-gray-500">Quick Switch:</span>
                  <button
                    onClick={() => handleQuickSwitch('admin')}
                    className={`text-xs px-3 py-1 rounded ${
                      user?.role === 'admin'
                        ? 'bg-sky-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title="Switch to Admin"
                  >
                    👤 Admin
                  </button>
                  <button
                    onClick={() => handleQuickSwitch('client')}
                    className={`text-xs px-3 py-1 rounded ${
                      user?.email === 'mek110@yahoo.com'
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    title="Switch to Client (Marcos Knight)"
                  >
                    👥 Client
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-sky-600 font-medium transition"
                >
                  Logout
                </button>
                <div className="flex items-center space-x-2 pl-4 border-l border-gray-300">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-600">{user?.name}</span>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-sky-600 font-medium transition">
                  Login
                </Link>
                <Link to="/request" className="btn-ocean text-sm">
                  Start Project
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-sky-600"
            >
              {mobileMenuOpen ? <HiX className="text-2xl" /> : <HiMenu className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden pb-4 space-y-2">
          <Link
            to="/services"
            className="block px-4 py-2 text-gray-700 hover:bg-sky-50 rounded"
            onClick={() => setMobileMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            to="/how-it-works"
            className="block px-4 py-2 text-gray-700 hover:bg-sky-50 rounded"
            onClick={() => setMobileMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            to="/contact"
            className="block px-4 py-2 text-gray-700 hover:bg-sky-50 rounded"
            onClick={() => setMobileMenuOpen(false)}
          >
            Contact
          </Link>

          {user && user.id ? (
            <>
              <Link
                to="/dashboard"
                className="block px-4 py-2 text-gray-700 hover:bg-sky-50 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              {user?.role === 'admin' || user?.role === 'manager' ? (
                <Link
                  to="/admin"
                  className="block px-4 py-2 text-gray-700 hover:bg-sky-50 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              ) : null}

              {/* Quick Switch for Mobile */}
              <div className="px-4 py-2 border-t border-b border-gray-200 my-2">
                <p className="text-xs text-gray-500 mb-2">Quick Switch:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleQuickSwitch('admin');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 text-xs px-3 py-2 rounded ${
                      user?.role === 'admin'
                        ? 'bg-sky-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    👤 Admin
                  </button>
                  <button
                    onClick={() => {
                      handleQuickSwitch('client');
                      setMobileMenuOpen(false);
                    }}
                    className={`flex-1 text-xs px-3 py-2 rounded ${
                      user?.email === 'mek110@yahoo.com'
                        ? 'bg-teal-600 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    👥 Client
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-sky-50 rounded"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-4 py-2 text-gray-700 hover:bg-sky-50 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/request"
                className="block px-4 py-2 bg-gradient-to-r from-sky-500 to-teal-500 text-white rounded font-semibold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Start Project
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
