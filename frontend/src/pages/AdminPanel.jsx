import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import DemoVideosManager from '../components/admin/DemoVideosManager';
import {
  ShieldCheck, ArrowLeft, Copy, Check, CreditCard, Landmark, Coins, AlertTriangle,
} from 'lucide-react';

function CopyField({ label, value, mono, testId }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-t border-gray-100 first:border-t-0" data-testid={testId}>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-gray-400">{label}</p>
        <p className={`text-sm text-gray-800 break-all ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        className="mt-4 shrink-0 p-1.5 rounded text-gray-400 hover:text-sky-600 hover:bg-sky-50 border border-gray-200"
        aria-label="Copy"
        data-testid={`${testId}-copy`}
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [ref, setRef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/payment-reference')
      .then(({ data }) => setRef(data))
      .catch((err) => setError(err.response?.data?.detail || err.message))
      .finally(() => setLoading(false));
  }, []);

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-8 pb-16 px-6 max-w-4xl mx-auto text-center">
          <p className="text-gray-500">This page is restricted to Ocean2Joy team members.</p>
          <Link to="/dashboard" className="text-sky-600 text-sm mt-4 inline-block font-medium">Back to Dashboard</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-8 pb-16 px-6 max-w-4xl mx-auto" data-testid="admin-panel">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-sky-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <p className="text-xs uppercase tracking-wider font-semibold text-sky-600 mb-2 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Admin
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Reference</h1>
        <p className="text-sm text-gray-500 mb-8">
          Authoritative source for all Ocean2Joy payment details. These values are pulled directly into
          the client's invoice based on the selected payment method. Keep them confidential — they are
          never shown on the public site.
        </p>

        {loading && <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">{error}</div>}

        {ref && (
          <div className="grid md:grid-cols-3 gap-4" data-testid="payment-reference-grid">
            {/* PayPal */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm" data-testid="ref-paypal">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">PayPal</h2>
              </div>
              <CopyField label="PayPal email" value={ref.paypal.email} mono testId="ref-paypal-email" />
              <CopyField label="Beneficiary" value={ref.beneficiary} testId="ref-paypal-beneficiary" />
            </div>

            {/* Bank Transfer */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm" data-testid="ref-bank">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">Bank Transfer (SWIFT)</h2>
              </div>
              <CopyField label="Beneficiary" value={ref.bank_transfer.beneficiary_name} testId="ref-bank-beneficiary" />
              <CopyField label="Beneficiary bank" value={`${ref.bank_transfer.beneficiary_bank}, ${ref.bank_transfer.beneficiary_bank_location}`} testId="ref-bank-bankname" />
              <CopyField label="SWIFT" value={ref.bank_transfer.beneficiary_bank_swift} mono testId="ref-bank-swift" />
              <CopyField label="IBAN" value={ref.bank_transfer.beneficiary_iban} mono testId="ref-bank-iban" />
              <CopyField
                label="Intermediary 1"
                value={`${ref.bank_transfer.intermediary_bank_1.name} · SWIFT ${ref.bank_transfer.intermediary_bank_1.swift}`}
                testId="ref-bank-int1"
              />
              <CopyField
                label="Intermediary 2"
                value={`${ref.bank_transfer.intermediary_bank_2.name} · SWIFT ${ref.bank_transfer.intermediary_bank_2.swift}`}
                testId="ref-bank-int2"
              />
            </div>

            {/* Crypto */}
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm" data-testid="ref-crypto">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                  <Coins className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">USDT (TRC-20)</h2>
              </div>
              <CopyField label="Asset" value={ref.crypto.asset} testId="ref-crypto-asset" />
              <CopyField label="Network" value={ref.crypto.network} testId="ref-crypto-network" />
              <CopyField label="Wallet address" value={ref.crypto.wallet_address} mono testId="ref-crypto-wallet" />
              <div className="mt-3 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Only TRON network (TRC-20) is supported. Inbound assets on other networks may be lost.</span>
              </div>
            </div>
          </div>
        )}

        {ref && (
          <p className="text-xs text-gray-400 mt-6 text-center">
            Beneficiary of record: <strong>{ref.beneficiary}</strong> · Tax ID: {ref.tax_id} · {ref.country}
          </p>
        )}

        <DemoVideosManager />
      </main>
      <Footer />
    </div>
  );
}
