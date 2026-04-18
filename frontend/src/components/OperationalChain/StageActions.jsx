import React, { useState } from 'react';
import api, { formatApiError } from '../../utils/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import {
  FileCheck, Send, PlayCircle, PackageCheck, CheckCircle2,
  DollarSign, Sparkles, PenLine, ThumbsUp, HandCoins, ClipboardCheck,
} from 'lucide-react';

/**
 * Renders the next contextual action(s) for the current user/role given the project status.
 *
 * Props:
 *  - project: current project (must have timeline-relevant timestamps + status + role-aware fields)
 *  - user:    current authenticated user (with role)
 *  - onUpdated(updatedProject): callback after a successful action
 */
export default function StageActions({ project, user, onUpdated }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState(null); // { type, title, fields, endpoint, method, body }

  const isAdmin = user?.role === 'admin';
  const isOwner = user?.id === project.user_id;
  const status = project.status;

  const call = async (method, url, body) => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.request({ method, url, data: body });
      onUpdated(data);
      setDialog(null);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const openActivateOrder = () => setDialog({
    key: 'activate-order',
    title: 'Activate Order',
    description: 'Review the quote request, set the final quote amount, and activate the order.',
    submit: 'Activate Order',
    icon: Sparkles,
    fields: [
      { name: 'quote_amount', label: 'Quote Amount (USD)', type: 'number', required: true, placeholder: '450' },
      { name: 'quote_details', label: 'Quote Details', type: 'textarea', placeholder: 'Breakdown of pricing...' },
      { name: 'quote_request_manager_comments', label: 'Internal Comments', type: 'textarea', placeholder: 'Notes for the team...' },
    ],
    endpoint: `/projects/${project.id}/admin/activate-order`,
    defaultValues: {
      quote_amount: project.quote_amount || '',
      quote_details: project.quote_details || '',
      quote_request_manager_comments: project.quote_request_manager_comments || '',
    },
  });

  const openStartProduction = () => setDialog({
    key: 'start-production',
    title: 'Start Production',
    description: 'Begin production and add notes visible to the client.',
    submit: 'Start Production',
    icon: PlayCircle,
    fields: [
      { name: 'production_notes', label: 'Production Notes', type: 'textarea', placeholder: 'Shooting schedule, crew, locations...' },
    ],
    endpoint: `/projects/${project.id}/admin/start-production`,
    defaultValues: { production_notes: project.production_notes || '' },
  });

  const openMarkPaymentSent = () => setDialog({
    key: 'mark-payment-sent',
    title: 'I Have Sent the Payment',
    description: 'Confirm you have sent the payment. Optionally include your PayPal transaction ID.',
    submit: 'Confirm Payment Sent',
    icon: HandCoins,
    fields: [
      { name: 'paypal_transaction_id', label: 'PayPal Transaction ID (optional)', type: 'text', placeholder: 'e.g. 9XA1234567B890123' },
    ],
    endpoint: `/projects/${project.id}/client/mark-payment-sent`,
    defaultValues: { paypal_transaction_id: '' },
  });

  const openConfirmPayment = () => setDialog({
    key: 'confirm-payment',
    title: 'Confirm Payment Received',
    description: 'Confirm that the payment has arrived. You can log the transaction ID.',
    submit: 'Confirm Received',
    icon: DollarSign,
    fields: [
      { name: 'paypal_transaction_id', label: 'Transaction ID (optional)', type: 'text', placeholder: 'Bank reference or PayPal ID' },
    ],
    endpoint: `/projects/${project.id}/admin/confirm-payment`,
    defaultValues: { paypal_transaction_id: project.paypal_transaction_id || '' },
  });

  // ---- ACTION BUTTONS: pick based on status + role ----
  const actions = [];

  // ADMIN — stage-based
  if (isAdmin) {
    if (status === 'submitted') {
      actions.push(<ActionButton key="act" icon={Sparkles} label="Activate Order" color="amber" onClick={openActivateOrder} testId="admin-activate-order" />);
    }
    if (status === 'order_activated') {
      actions.push(<ActionButton key="inv" icon={Send} label="Send Invoice" color="sky" onClick={() => call('post', `/projects/${project.id}/admin/send-invoice`)} testId="admin-send-invoice" loading={loading} />);
    }
    if (status === 'invoice_signed') {
      actions.push(<ActionButton key="prod" icon={PlayCircle} label="Start Production" color="sky" onClick={openStartProduction} testId="admin-start-production" />);
    }
    if (status === 'production_started') {
      const hasDeliv = (project.deliverables || []).length > 0;
      actions.push(<ActionButton key="del" icon={PackageCheck} label={hasDeliv ? 'Mark as Delivered' : 'Upload deliverables first'} color="emerald" disabled={!hasDeliv} onClick={() => call('post', `/projects/${project.id}/admin/mark-delivered`)} testId="admin-mark-delivered" loading={loading} />);
    }
    if (status === 'payment_sent') {
      actions.push(<ActionButton key="pay" icon={DollarSign} label="Confirm Payment Received" color="teal" onClick={openConfirmPayment} testId="admin-confirm-payment" />);
    }
    if (status === 'payment_received') {
      actions.push(<ActionButton key="comp" icon={CheckCircle2} label="Complete Project" color="sky" onClick={() => call('post', `/projects/${project.id}/admin/complete`)} testId="admin-complete" loading={loading} />);
    }
  }

  // CLIENT (owner) — stage-based
  if (!isAdmin && isOwner) {
    if (status === 'invoice_sent') {
      actions.push(<ActionButton key="sign" icon={PenLine} label="Accept Invoice & Terms" color="sky" onClick={() => call('post', `/projects/${project.id}/client/sign-invoice`)} testId="client-sign-invoice" loading={loading} />);
    }
    if (status === 'files_accessed') {
      actions.push(<ActionButton key="confD" icon={FileCheck} label="Confirm Delivery Received" color="emerald" onClick={() => call('post', `/projects/${project.id}/client/confirm-delivery`)} testId="client-confirm-delivery" loading={loading} />);
    }
    if (status === 'delivery_confirmed') {
      actions.push(<ActionButton key="accW" icon={ThumbsUp} label="Accept Work (sign Acceptance Act)" color="sky" onClick={() => call('post', `/projects/${project.id}/client/accept-work`)} testId="client-accept-work" loading={loading} />);
    }
    if (status === 'work_accepted') {
      actions.push(<ActionButton key="paid" icon={HandCoins} label="I Have Sent the Payment" color="amber" onClick={openMarkPaymentSent} testId="client-mark-payment-sent" />);
    }
  }

  if (actions.length === 0 && status !== 'completed') {
    const waitingMsg = isAdmin ? 'Waiting for client to act' : 'Waiting for Ocean2Joy team to act';
    return (
      <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 text-sm text-sky-800 flex items-center gap-2" data-testid="stage-waiting">
        <ClipboardCheck className="w-4 h-4" /> {waitingMsg}
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-sm text-emerald-800 flex items-center gap-2" data-testid="stage-completed-banner">
        <CheckCircle2 className="w-4 h-4" /> Project completed — thank you!
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="stage-actions">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg" data-testid="stage-actions-error">{error}</div>}
      <div className="flex flex-wrap gap-2">{actions}</div>
      {dialog && (
        <ActionDialog
          dialog={dialog}
          onClose={() => setDialog(null)}
          onSubmit={(values) => call('post', dialog.endpoint, values)}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
}

function ActionButton({ icon: Icon, label, color, onClick, disabled, loading, testId }) {
  const COLORS = {
    sky: 'bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white',
    amber: 'bg-amber-500 hover:bg-amber-600 text-white',
    emerald: 'bg-emerald-500 hover:bg-emerald-600 text-white',
    teal: 'bg-teal-500 hover:bg-teal-600 text-white',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`${COLORS[color] || COLORS.sky} px-4 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition`}
      data-testid={testId}
    >
      <Icon className="w-4 h-4" /> {loading ? 'Working…' : label}
    </button>
  );
}

function ActionDialog({ dialog, onClose, onSubmit, loading, error }) {
  const [values, setValues] = useState(dialog.defaultValues || {});
  const Icon = dialog.icon;

  const submit = (e) => {
    e.preventDefault();
    const payload = { ...values };
    // Convert numeric fields
    dialog.fields.forEach((f) => {
      if (f.type === 'number' && payload[f.name] !== '' && payload[f.name] != null) {
        payload[f.name] = Number(payload[f.name]);
      }
    });
    onSubmit(payload);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg" data-testid={`dialog-${dialog.key}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900"><Icon className="w-5 h-5 text-sky-500" /> {dialog.title}</DialogTitle>
          <DialogDescription>{dialog.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2">
          {dialog.fields.map((f) => (
            <div key={f.name}>
              <Label className="text-xs uppercase tracking-wider text-gray-600">{f.label}</Label>
              {f.type === 'textarea' ? (
                <Textarea
                  rows={3}
                  required={f.required}
                  value={values[f.name] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="mt-1.5 resize-none"
                  data-testid={`dialog-input-${f.name}`}
                />
              ) : (
                <Input
                  type={f.type}
                  required={f.required}
                  value={values[f.name] ?? ''}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="mt-1.5"
                  data-testid={`dialog-input-${f.name}`}
                />
              )}
            </div>
          ))}
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded" data-testid={`dialog-error-${dialog.key}`}>{error}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} data-testid={`dialog-cancel-${dialog.key}`}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white" data-testid={`dialog-submit-${dialog.key}`}>
              {loading ? 'Submitting…' : dialog.submit}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
