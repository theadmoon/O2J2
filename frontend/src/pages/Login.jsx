import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, formatApiError } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Waves, ArrowRight, Eye, EyeOff } from 'lucide-react';

const OCEAN_BG = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(nextPath);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={OCEAN_BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/60 to-teal-500/60" />
        <div className="absolute bottom-12 left-12">
          <Waves className="w-10 h-10 text-yellow-300 mb-4" />
          <h2 className="text-4xl text-white font-bold tracking-tight">Welcome<br />Back</h2>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-md">
          <p className="text-xs uppercase tracking-wider font-semibold text-sky-600 mb-2">Sign In</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Access Your Projects</h1>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6" data-testid="login-error">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
            <div>
              <Label className="text-gray-600 text-xs uppercase tracking-wider">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" placeholder="your@email.com" data-testid="login-email" />
            </div>
            <div>
              <Label className="text-gray-600 text-xs uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1.5 pr-10"
                  placeholder="Enter password"
                  data-testid="login-password"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 p-1 text-gray-400 hover:text-sky-600 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  data-testid="login-password-toggle"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white h-11 rounded-lg flex items-center justify-center gap-2" data-testid="login-submit-button">
              {loading ? 'Signing in...' : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>
          <p className="mt-6 text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-sky-600 hover:underline font-medium" data-testid="login-register-link">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
