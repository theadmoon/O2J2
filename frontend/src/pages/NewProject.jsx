import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { formatApiError } from '../utils/api';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ArrowRight, Upload } from 'lucide-react';

export default function NewProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serviceType, setServiceType] = useState('custom_video');
  const [projectTitle, setProjectTitle] = useState('');
  const [brief, setBrief] = useState('');
  const [script, setScript] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!paymentMethod) { setError('Please choose a payment method.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('service_type', serviceType);
      formData.append('brief', brief);
      formData.append('payment_method', paymentMethod);
      if (projectTitle.trim()) formData.append('project_title', projectTitle.trim());
      if (script) formData.append('script', script);

      const { data } = await api.post('/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(`/projects/${data.id}`);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-8 pb-16 px-6 max-w-2xl mx-auto" data-testid="new-project-page">
        <p className="text-xs uppercase tracking-wider font-semibold text-sky-600 mb-2">New Project</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Submit Your Project</h1>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6" data-testid="new-project-error">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg border border-gray-200 shadow-sm" data-testid="new-project-form">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-600 text-xs uppercase tracking-wider">Your Name</Label>
              <Input disabled value={user?.name || ''} className="mt-1.5 bg-gray-50" data-testid="new-project-name" />
            </div>
            <div>
              <Label className="text-gray-600 text-xs uppercase tracking-wider">Email</Label>
              <Input disabled value={user?.email || ''} className="mt-1.5 bg-gray-50" data-testid="new-project-email" />
            </div>
          </div>

          <div>
            <Label className="text-gray-600 text-xs uppercase tracking-wider">Service Type</Label>
            <Select value={serviceType} onValueChange={setServiceType}>
              <SelectTrigger className="mt-1.5" data-testid="new-project-service-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom_video">Custom Video Production</SelectItem>
                <SelectItem value="video_editing">Video Editing</SelectItem>
                <SelectItem value="ai_video">AI-Generated Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div data-testid="new-project-payment-method">
            <Label className="text-gray-600 text-xs uppercase tracking-wider">
              Payment Method <span className="text-red-500 ml-0.5">*</span>
            </Label>
            <div className="mt-2 grid sm:grid-cols-3 gap-2.5">
              {[
                { code: 'paypal', label: 'PayPal', hint: 'Fast · minutes' },
                { code: 'bank_transfer', label: 'Bank Transfer', hint: 'SWIFT · 3–5 days' },
                { code: 'crypto', label: 'USDT (TRC-20)', hint: 'Crypto · fast' },
              ].map((m) => (
                <label
                  key={m.code}
                  className={`flex flex-col gap-1 border rounded-lg px-3 py-2.5 cursor-pointer transition ${
                    paymentMethod === m.code
                      ? 'border-sky-500 bg-sky-50 ring-2 ring-sky-100'
                      : 'border-gray-200 hover:border-sky-300 hover:bg-gray-50'
                  }`}
                  data-testid={`payment-method-${m.code}`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={m.code}
                      checked={paymentMethod === m.code}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-sky-500 w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-800">{m.label}</span>
                  </div>
                  <span className="text-[11px] text-gray-500 ml-6">{m.hint}</span>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5">
              Full payment details will appear in your invoice after the quote is confirmed. You can change this choice any time before the invoice is sent.
            </p>
          </div>

          <div>
            <Label className="text-gray-600 text-xs uppercase tracking-wider flex items-center gap-1">
              Project Title <span className="text-gray-400 normal-case tracking-normal">(optional)</span>
            </Label>
            <Input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              maxLength={120}
              className="mt-1.5"
              placeholder="e.g. Museum hall narration video"
              data-testid="new-project-title"
            />
            <p className="text-[11px] text-gray-500 mt-1">Give it a short name so you can find it later. You can rename it any time before invoice is sent.</p>
          </div>

          <div>
            <Label className="text-gray-600 text-xs uppercase tracking-wider flex items-center gap-1">
              Project Brief <span className="text-gray-400 normal-case tracking-normal">(can be a single sentence)</span>
            </Label>
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={5}
              className="mt-1.5 resize-none"
              placeholder="A one-line idea is perfectly fine to start. You can attach a script, add reference files and chat with your project manager right after submitting — no commitment until you accept the quote."
              data-testid="new-project-brief"
            />
            <p className="text-[11px] text-gray-500 mt-1">You will be able to update the brief, add files and chat with our team right inside the project workspace.</p>
          </div>

          <div>
            <Label className="text-gray-600 text-xs uppercase tracking-wider">Script / Reference File (optional)</Label>
            <div className={`mt-1.5 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              script ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-sky-300'
            }`}>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.pages,.fdx,.fountain,.md"
                onChange={(e) => {
                  const f = e.target.files && e.target.files[0];
                  if (f) setScript(f);
                  e.target.value = '';
                }}
                className="hidden"
                id="script-upload"
                data-testid="new-project-script-input"
              />
              {script ? (
                <div className="flex flex-col items-center gap-2" data-testid="new-project-script-selected">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-base font-bold">✓</div>
                  <p className="text-sm font-medium text-gray-800 break-all">{script.name}</p>
                  <p className="text-[11px] text-gray-500">{(script.size / 1024).toFixed(1)} KB</p>
                  <div className="flex gap-3 mt-1">
                    <label htmlFor="script-upload" className="text-xs text-sky-600 hover:text-sky-700 cursor-pointer font-medium" data-testid="new-project-script-replace">
                      Replace file
                    </label>
                    <button
                      type="button"
                      onClick={() => setScript(null)}
                      className="text-xs text-gray-500 hover:text-red-600 font-medium"
                      data-testid="new-project-script-remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="script-upload" className="cursor-pointer block">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload your script or reference document</p>
                  <p className="text-[11px] text-gray-400 mt-1">PDF, DOC, DOCX, TXT, RTF, ODT, Pages, Final Draft (.fdx), Fountain</p>
                </label>
              )}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white h-11 rounded-lg flex items-center justify-center gap-2" data-testid="new-project-submit">
            {loading ? 'Submitting...' : <>Submit Project Request <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
