import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { formatApiError } from '../utils/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  ArrowLeft, User as UserIcon, Mail, CreditCard, ShieldCheck,
  Check, X, Eye, EyeOff, Calendar,
} from 'lucide-react';

function formatIsoDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return iso;
  }
}

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [nameEdit, setNameEdit] = useState({ editing: false, value: '', saving: false, error: '' });
  const [paypalEdit, setPaypalEdit] = useState({ editing: false, value: '', saving: false, error: '' });
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '', showCurrent: false, showNext: false, saving: false, error: '', success: '' });

  // sync from auth user
  useEffect(() => {
    if (user) {
      setNameEdit((s) => ({ ...s, value: user.name || '' }));
      setPaypalEdit((s) => ({ ...s, value: user.paypal_email || '' }));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const patchUser = async (body) => {
    const { data } = await api.patch('/auth/me', body);
    if (refreshUser) await refreshUser(data);
    return data;
  };

  const saveName = async () => {
    const v = nameEdit.value.trim();
    if (!v) { setNameEdit((s) => ({ ...s, error: 'Name cannot be empty' })); return; }
    setNameEdit((s) => ({ ...s, saving: true, error: '' }));
    try {
      await patchUser({ name: v });
      setNameEdit({ editing: false, value: v, saving: false, error: '' });
    } catch (err) {
      setNameEdit((s) => ({ ...s, saving: false, error: formatApiError(err.response?.data?.detail) || err.message }));
    }
  };

  const savePaypal = async () => {
    const v = paypalEdit.value.trim();
    setPaypalEdit((s) => ({ ...s, saving: true, error: '' }));
    try {
      await patchUser({ paypal_email: v });
      setPaypalEdit({ editing: false, value: v, saving: false, error: '' });
    } catch (err) {
      setPaypalEdit((s) => ({ ...s, saving: false, error: formatApiError(err.response?.data?.detail) || err.message }));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwd.next.length < 6) { setPwd((s) => ({ ...s, error: 'New password must be at least 6 characters', success: '' })); return; }
    if (pwd.next !== pwd.confirm) { setPwd((s) => ({ ...s, error: 'New password and confirmation do not match', success: '' })); return; }
    setPwd((s) => ({ ...s, saving: true, error: '', success: '' }));
    try {
      await patchUser({ current_password: pwd.current, new_password: pwd.next });
      setPwd({ current: '', next: '', confirm: '', showCurrent: false, showNext: false, saving: false, error: '', success: 'Password updated successfully' });
    } catch (err) {
      setPwd((s) => ({ ...s, saving: false, error: formatApiError(err.response?.data?.detail) || err.message, success: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-8 pb-16 px-6 max-w-3xl mx-auto" data-testid="profile-page">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-sky-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <p className="text-xs uppercase tracking-wider font-semibold text-sky-600 mb-2">Profile</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

        {/* Identity card */}
        <div className="border border-gray-200 bg-white rounded-lg p-6 mb-6 shadow-sm" data-testid="profile-identity-card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-gray-500">Signed in as</p>
              <p className="text-xl font-semibold text-gray-900 truncate">{user.name}</p>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5 capitalize">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" /> {user.role}
              </p>
            </div>
          </div>

          {/* Full name */}
          <ProfileRow
            icon={UserIcon}
            label="Full name"
            editing={nameEdit.editing}
            onEdit={() => setNameEdit((s) => ({ ...s, editing: true, value: user.name || '', error: '' }))}
            onCancel={() => setNameEdit({ editing: false, value: user.name || '', saving: false, error: '' })}
            onSave={saveName}
            saving={nameEdit.saving}
            error={nameEdit.error}
            testId="profile-name"
          >
            {nameEdit.editing ? (
              <Input
                autoFocus
                value={nameEdit.value}
                onChange={(e) => setNameEdit((s) => ({ ...s, value: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setNameEdit({ editing: false, value: user.name || '', saving: false, error: '' }); }}
                maxLength={120}
                data-testid="profile-name-input"
              />
            ) : (
              <p className="text-gray-800">{user.name}</p>
            )}
          </ProfileRow>

          {/* Email (read-only) */}
          <ProfileRow icon={Mail} label="Email" readOnly testId="profile-email">
            <p className="text-gray-800">{user.email}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Email cannot be changed from here. Contact ocean2joy@gmail.com if you need to update it.
            </p>
          </ProfileRow>

          {/* PayPal email */}
          <ProfileRow
            icon={CreditCard}
            label="PayPal account"
            editing={paypalEdit.editing}
            onEdit={() => setPaypalEdit((s) => ({ ...s, editing: true, value: user.paypal_email || '', error: '' }))}
            onCancel={() => setPaypalEdit({ editing: false, value: user.paypal_email || '', saving: false, error: '' })}
            onSave={savePaypal}
            saving={paypalEdit.saving}
            error={paypalEdit.error}
            testId="profile-paypal"
          >
            {paypalEdit.editing ? (
              <div>
                <Input
                  autoFocus
                  type="email"
                  value={paypalEdit.value}
                  onChange={(e) => setPaypalEdit((s) => ({ ...s, value: e.target.value }))}
                  placeholder="only if different from account email"
                  data-testid="profile-paypal-input"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Leave blank if your PayPal email matches your account email. Used to reconcile incoming PayPal payments manually.
                </p>
              </div>
            ) : (
              <p className="text-gray-800">
                {user.paypal_email || <span className="text-gray-400 italic">not set — we will use your account email</span>}
              </p>
            )}
          </ProfileRow>

          {/* Member since */}
          {user.created_at && (
            <ProfileRow icon={Calendar} label="Member since" readOnly testId="profile-created-at">
              <p className="text-gray-800">{formatIsoDate(user.created_at)}</p>
            </ProfileRow>
          )}
        </div>

        {/* Change password */}
        <div className="border border-gray-200 bg-white rounded-lg p-6 shadow-sm" data-testid="profile-password-card">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Change password</h2>
          <p className="text-xs text-gray-500 mb-4">We'll ask for your current password to confirm it's really you.</p>

          <form onSubmit={changePassword} className="space-y-4">
            <PasswordField
              label="Current password"
              value={pwd.current}
              onChange={(v) => setPwd((s) => ({ ...s, current: v }))}
              show={pwd.showCurrent}
              onToggle={() => setPwd((s) => ({ ...s, showCurrent: !s.showCurrent }))}
              testId="profile-current-password"
              autoComplete="current-password"
            />
            <PasswordField
              label="New password"
              value={pwd.next}
              onChange={(v) => setPwd((s) => ({ ...s, next: v }))}
              show={pwd.showNext}
              onToggle={() => setPwd((s) => ({ ...s, showNext: !s.showNext }))}
              placeholder="Min. 6 characters"
              testId="profile-new-password"
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm new password"
              value={pwd.confirm}
              onChange={(v) => setPwd((s) => ({ ...s, confirm: v }))}
              show={pwd.showNext}
              onToggle={() => setPwd((s) => ({ ...s, showNext: !s.showNext }))}
              testId="profile-confirm-password"
              autoComplete="new-password"
            />

            {pwd.error && <p className="text-sm text-red-600" data-testid="profile-password-error">{pwd.error}</p>}
            {pwd.success && <p className="text-sm text-emerald-600" data-testid="profile-password-success">{pwd.success}</p>}

            <Button
              type="submit"
              disabled={pwd.saving || !pwd.current || !pwd.next}
              className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white"
              data-testid="profile-password-submit"
            >
              {pwd.saving ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ProfileRow({ icon: Icon, label, children, editing, readOnly, onEdit, onCancel, onSave, saving, error, testId }) {
  return (
    <div className="flex items-start gap-3 py-3 border-t border-gray-100 first:border-t-0" data-testid={testId}>
      <Icon className="w-4 h-4 text-sky-500 mt-1 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
          {!readOnly && !editing && (
            <button type="button" onClick={onEdit} className="text-xs text-sky-600 hover:text-sky-700 font-medium" data-testid={`${testId}-edit`}>
              Edit
            </button>
          )}
        </div>
        <div className="mt-1">{children}</div>
        {editing && (
          <div className="flex items-center gap-2 mt-2">
            <button type="button" onClick={onSave} disabled={saving} className="p-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded disabled:opacity-50" aria-label="Save" data-testid={`${testId}-save`}>
              <Check className="w-4 h-4" />
            </button>
            <button type="button" onClick={onCancel} disabled={saving} className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded" aria-label="Cancel" data-testid={`${testId}-cancel`}>
              <X className="w-4 h-4" />
            </button>
            {saving && <span className="text-xs text-gray-400">Saving…</span>}
          </div>
        )}
        {error && <p className="text-xs text-red-600 mt-1" data-testid={`${testId}-error`}>{error}</p>}
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, show, onToggle, placeholder, testId, autoComplete }) {
  return (
    <div>
      <Label className="text-gray-600 text-xs uppercase tracking-wider">{label}</Label>
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="mt-1.5 pr-10"
          data-testid={testId}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 p-1 text-gray-400 hover:text-sky-600 transition"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
