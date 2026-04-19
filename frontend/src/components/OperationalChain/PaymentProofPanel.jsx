import React, { useState } from 'react';
import api, { formatApiError } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Pencil, Upload, FileCheck2, Download, Hash, Image as ImageIcon } from 'lucide-react';

/**
 * Shown inline inside the Payment Sent (stage 10) timeline row.
 * Both fields (transaction ID text + screenshot file) are always visible.
 * If a field is empty, an inline "Add" action is available — the owner client
 * or admin can upload/update it at any point up until admin confirms the payment.
 */
export default function PaymentProofPanel({ project, user, onUpdated }) {
  const isOwner = user?.id === project.user_id || user?.role === 'admin';
  const locked = !!project.payment_confirmed_by_manager_at;
  const canEdit = isOwner && !locked;
  const [dialog, setDialog] = useState(null); // 'txid' | 'file'
  const [value, setValue] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const open = (kind) => {
    setError('');
    setValue(project.paypal_transaction_id || '');
    setFile(null);
    setDialog(kind);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      if (dialog === 'txid') fd.append('paypal_transaction_id', value);
      if (dialog === 'file' && file) fd.append('file', file);
      await api.post(`/projects/${project.id}/payment-proof`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { data } = await api.get(`/projects/${project.id}`);
      onUpdated(data);
      setDialog(null);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.get(`/projects/${project.id}/payment-proof`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = project?.payment_proof_filename || 'payment-proof';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-1.5" data-testid="payment-proof-panel">
      {/* Transaction ID */}
      <div className="flex items-center gap-1.5 text-xs bg-emerald-50 border border-emerald-200 rounded px-2 py-1 w-fit">
        <Hash className="w-3 h-3 text-emerald-700" />
        <span className="font-semibold text-emerald-700">Transaction ID:</span>
        {project.paypal_transaction_id ? (
          <span className="font-mono text-emerald-800" data-testid="payment-proof-txid">{project.paypal_transaction_id}</span>
        ) : (
          <span className="text-gray-400 italic">not provided</span>
        )}
        {canEdit && (
          <button
            type="button"
            onClick={() => open('txid')}
            className="ml-1 text-sky-600 hover:text-sky-700"
            title={project.paypal_transaction_id ? 'Edit transaction ID' : 'Add transaction ID'}
            data-testid="payment-proof-edit-txid"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Screenshot */}
      <div className="flex items-center gap-1.5 text-xs bg-emerald-50 border border-emerald-200 rounded px-2 py-1 w-fit">
        <ImageIcon className="w-3 h-3 text-emerald-700" />
        <span className="font-semibold text-emerald-700">Screenshot:</span>
        {project.payment_proof_file ? (
          <>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 text-emerald-800 hover:text-emerald-900 underline underline-offset-2"
              data-testid="payment-proof-download"
            >
              <FileCheck2 className="w-3 h-3" />
              <span className="truncate max-w-[200px]">{project.payment_proof_filename}</span>
              <Download className="w-3 h-3 ml-0.5" />
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => open('file')}
                className="ml-1 text-sky-600 hover:text-sky-700"
                title="Replace screenshot"
                data-testid="payment-proof-replace-file"
              >
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </>
        ) : (
          <>
            <span className="text-gray-400 italic">not uploaded</span>
            {canEdit && (
              <button
                type="button"
                onClick={() => open('file')}
                className="ml-1 flex items-center gap-1 text-sky-600 hover:text-sky-700 font-semibold"
                data-testid="payment-proof-upload-file"
              >
                <Upload className="w-3 h-3" /> Upload
              </button>
            )}
          </>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={!!dialog} onOpenChange={(v) => { if (!v) setDialog(null); }}>
        <DialogContent className="max-w-md" data-testid="payment-proof-dialog">
          <DialogHeader>
            <DialogTitle>
              {dialog === 'txid'
                ? (project.paypal_transaction_id ? 'Update Transaction ID' : 'Add Transaction ID')
                : (project.payment_proof_file ? 'Replace Payment Screenshot' : 'Upload Payment Screenshot')}
            </DialogTitle>
            <DialogDescription>
              {dialog === 'txid'
                ? 'Enter the exact transaction / reference ID from your payment provider. This value will be printed on the final receipt.'
                : 'Upload a screenshot of your payment confirmation (PDF, PNG or JPG).'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4 mt-2">
            {dialog === 'txid' ? (
              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-600">Transaction ID</Label>
                <Input
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. 9XA1234567B890123"
                  className="mt-1.5"
                  data-testid="payment-proof-input-txid"
                />
              </div>
            ) : (
              <div>
                <Label className="text-xs uppercase tracking-wider text-gray-600">Screenshot file</Label>
                <Input
                  required
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1.5 cursor-pointer file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                  data-testid="payment-proof-input-file"
                />
              </div>
            )}
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">{error}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialog(null)}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white">
                {submitting ? 'Saving…' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
