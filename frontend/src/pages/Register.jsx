import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, formatApiError } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Waves, ArrowRight } from 'lucide-react';

const OCEAN_BG = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(email, password, name, paypalEmail);
      navigate('/dashboard');
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
          <h2 className="text-4xl text-white font-bold tracking-tight">Start Your<br />Journey</h2>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-white">
        <div className="w-full max-w-md">
          <p className="text-xs uppercase tracking-wider font-semibold text-sky-600 mb-2">Create Account</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Join Ocean2Joy</h1>
          <div className="mb-6 text-xs text-gray-500 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2.5 leading-relaxed" data-testid="register-info-banner">
            <strong className="text-gray-700">Heads up:</strong> all order communication happens inside your portal — messages in the project chat, documents in your cabinet.
            We don't send marketing or notification emails (including no "welcome" email). Email is used only for critical cases.
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6" data-testid="register-error">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
            <div>
              <Label className="text-gray-600 text-xs uppercase tracking-wider">Full Name</Label>
              <Input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1.5" placeholder="John Doe" data-testid="register-name" />
            </div>
            <div>
              <Label className="text-gray-600 text-xs uppercase tracking-wider">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1.5" placeholder="your@email.com" data-testid="register-email" />
            </div>
            <div>
              <Label className="text-gray-600 text-xs uppercase tracking-wider">Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1.5" placeholder="Min. 6 characters" data-testid="register-password" />
            </div>
            <div>
              <Label className="text-gray-600 text-xs uppercase tracking-wider flex items-center gap-1">
                PayPal Account <span className="text-gray-400 normal-case tracking-normal">(optional)</span>
              </Label>
              <Input type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} className="mt-1.5" placeholder="only if different from email above" data-testid="register-paypal-email" />
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Payments are currently processed <strong>manually</strong> — PayPal and SWIFT are not yet integrated into the portal.
                If you plan to pay via PayPal and your PayPal email differs from the one above, please provide it so we can reconcile incoming payments.
              </p>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white h-11 rounded-lg flex items-center justify-center gap-2" data-testid="register-submit-button">
              {loading ? 'Creating account...' : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </Button>
            <p className="text-xs text-gray-500 leading-relaxed" data-testid="register-gdpr-notice">
              By creating an account, you agree to our{' '}
              <Link to="/policies/terms" className="text-sky-600 hover:underline" data-testid="register-terms-link">Terms of Service</Link>
              {' '}and acknowledge our{' '}
              <Link to="/policies/privacy" className="text-sky-600 hover:underline" data-testid="register-privacy-link">Privacy Policy</Link>.
              We process your name and email to deliver our services under GDPR Art. 6(1)(b).
              You may access, correct, export, or delete your data at any time by emailing{' '}
              <a href="mailto:ocean2joy@gmail.com" className="text-sky-600 hover:underline">ocean2joy@gmail.com</a>.
            </p>
          </form>
          <p className="mt-6 text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-sky-600 hover:underline font-medium" data-testid="register-login-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
