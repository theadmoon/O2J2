import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, formatApiError } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Waves, ArrowRight } from 'lucide-react';

const OCEAN_BG = "https://images.unsplash.com/photo-1770742447743-198d97cc340b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTB8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHdhdmVzJTIwZGFyayUyMG1pZG5pZ2h0fGVufDB8fHx8MTc3NjQ4MDg5MXww&ixlib=rb-4.1.0&q=85";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050A14]">
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={OCEAN_BG} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#050A14]/60" />
        <div className="absolute bottom-12 left-12">
          <Waves className="w-10 h-10 text-[#FF6B6B] mb-4" />
          <h2 className="font-serif text-4xl text-white font-light tracking-tight">Start Your<br />Journey</h2>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.2em] font-mono text-[#FF6B6B] mb-2">Create Account</p>
          <h1 className="font-serif text-3xl text-[#F8FAFC] mb-8 tracking-tight">Join Ocean2Joy</h1>
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 mb-6" data-testid="register-error">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
            <div>
              <Label className="text-slate-400 text-xs uppercase tracking-wider">Full Name</Label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#FF6B6B]" placeholder="John Doe" data-testid="register-name" />
            </div>
            <div>
              <Label className="text-slate-400 text-xs uppercase tracking-wider">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#FF6B6B]" placeholder="your@email.com" data-testid="register-email" />
            </div>
            <div>
              <Label className="text-slate-400 text-xs uppercase tracking-wider">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#FF6B6B]" placeholder="Min. 6 characters" data-testid="register-password" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#FF6B6B] hover:bg-[#ff5252] text-white h-11 flex items-center justify-center gap-2" data-testid="register-submit-button">
              {loading ? 'Creating account...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </Button>
          </form>
          <p className="mt-6 text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF6B6B] hover:underline" data-testid="register-login-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
