import React from 'react';
import api from '../../utils/api';
import { CheckCircle2, Circle, Download, Eye, FileCheck2 } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

const STAGES = [
  { n: 1, key: "submitted", name: "Submitted", field: "created_at", docs: ["quote_request"] },
  { n: 2, key: "order_activated", name: "Order Activated", field: "order_activated_at", docs: ["order_confirmation"] },
  { n: 3, key: "invoice_sent", name: "Invoice Sent", field: "invoice_sent_at", docs: ["invoice"] },
  { n: 4, key: "invoice_signed", name: "Invoice Signed", field: "invoice_signed_at", docs: [] },
  { n: 5, key: "production_started", name: "Production Started", field: "production_started_at", docs: ["production_notes"] },
  { n: 6, key: "delivered", name: "Delivered", field: "delivered_at", docs: ["download_confirmation"] },
  { n: 7, key: "files_accessed", name: "Files Accessed", field: "files_accessed_at", docs: ["certificate_delivery"] },
  { n: 8, key: "delivery_confirmed", name: "Delivery Confirmed", field: "delivery_confirmed_at", docs: [] },
  { n: 9, key: "work_accepted", name: "Work Accepted", field: "work_accepted_at", docs: ["acceptance_act"] },
  { n: 10, key: "payment_sent", name: "Payment Sent", field: "payment_marked_by_client_at", docs: ["payment_instructions", "receipt"] },
  { n: 11, key: "payment_received", name: "Payment Received", field: "payment_confirmed_by_manager_at", docs: ["payment_confirmation"] },
  { n: 12, key: "completed", name: "Completed", field: "completed_at", docs: ["certificate_completion"] },
];

const DOC_NAMES = {
  quote_request: "Quote Request",
  order_confirmation: "Order Confirmation",
  invoice: "Invoice",
  production_notes: "Production Notes",
  certificate_delivery: "Certificate of Delivery",
  download_confirmation: "Delivery Notes",
  acceptance_act: "Acceptance Act",
  payment_instructions: "Payment Instructions",
  receipt: "Receipt",
  payment_confirmation: "Payment Confirmation",
  certificate_completion: "Certificate of Completion",
};

export default function ChainTimeline({ project, onViewDoc }) {
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const handleSignedInvoiceDownload = async () => {
    try {
      const res = await api.get(`/projects/${project.id}/signed-invoice`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = project?.signed_invoice_filename || 'signed-invoice';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="space-y-1" data-testid="chain-timeline">
      {STAGES.map((stage, idx) => {
        const completed = !!project[stage.field];
        const isActive = completed && (idx === STAGES.length - 1 || !project[STAGES[idx + 1]?.field]);

        return (
          <div
            key={stage.n}
            className={`relative border-l-2 pl-6 pb-6 ${
              completed ? 'border-sky-500' : 'border-gray-200'
            }`}
            data-testid={`timeline-stage-${stage.n}`}
          >
            <div className={`absolute -left-[9px] top-0 ${completed ? 'text-sky-500' : 'text-gray-300'}`}>
              {completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
            </div>

            <div className={`${isActive ? 'bg-sky-50 border border-sky-200 rounded-lg' : ''} p-3 -mt-1`}>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xs text-gray-400">{String(stage.n).padStart(2, '0')}</span>
                <span className={`text-sm ${completed ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{stage.name}</span>
                {completed && (
                  <span className="text-xs text-gray-400 font-mono ml-auto">{formatDateTime(project[stage.field])}</span>
                )}
              </div>

              {completed && stage.docs.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {stage.docs.map((doc) => (
                    <div key={doc} className="flex items-center gap-1">
                      <button
                        onClick={() => onViewDoc(doc)}
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-sky-600 transition-colors px-2 py-1 bg-gray-50 border border-gray-200 rounded hover:border-sky-300"
                        data-testid={`doc-view-${doc}`}
                      >
                        <Eye className="w-3 h-3" /> {DOC_NAMES[doc] || doc}
                      </button>
                      <a
                        href={`${API_URL}/api/projects/${project.id}/documents/${doc}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-gray-500 hover:text-sky-600 transition-colors px-2 py-1 bg-gray-50 border border-gray-200 rounded hover:border-sky-300"
                        data-testid={`doc-download-${doc}`}
                      >
                        <Download className="w-3 h-3" /> PDF
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Signed invoice artifact on stage 4 (Invoice Signed) */}
              {completed && stage.key === 'invoice_signed' && project.signed_invoice_file && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleSignedInvoiceDownload}
                    className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1 hover:bg-emerald-100"
                    data-testid="timeline-signed-invoice-download"
                  >
                    <FileCheck2 className="w-3 h-3" /> {project.signed_invoice_filename || 'Signed Invoice'}
                    <Download className="w-3 h-3 ml-1" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
