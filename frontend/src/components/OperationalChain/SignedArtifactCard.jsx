import React, { useState } from 'react';
import api, { formatApiError } from '../../utils/api';
import { Button } from '../ui/button';
import { FileCheck2, History, Upload, Download, X } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

/**
 * Renders the current signed artifact + history + re-upload control.
 *
 * Props:
 *  - project                 the project document
 *  - user                    current user (for role check)
 *  - kind                    URL segment: 'signed-invoice' | 'signed-delivery-cert' | 'signed-acceptance-act' | 'payment-proof'
 *  - label                   human label for this artifact
 *  - currentFileField        e.g. 'signed_invoice_file'
 *  - filenameField           e.g. 'signed_invoice_filename'
 *  - historyField            e.g. 'signed_invoice_history'
 *  - versionField            e.g. 'signed_invoice_version'
 *  - timestampField          e.g. 'invoice_signed_at'
 *  - uploadEndpoint          POST endpoint (multipart) to upload a new version
 *  - uploadFieldName         multipart field name expected by backend (default 'file')
 *  - canReupload             boolean — whether client may replace
 *  - extraFormFields         optional extra form fields to append (e.g. for payment proof)
 *  - onUpdated(project)      called after successful re-upload
 */
export default function SignedArtifactCard({
  project, user, kind, label,
  currentFileField, filenameField, historyField, versionField, timestampField,
  uploadEndpoint, uploadFieldName = 'file',
  canReupload = false,
  extraFormFields = [],
  onUpdated,
}) {
  const [showHistory, setShowHistory] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [pickedFile, setPickedFile] = useState(null);
  const [showReupload, setShowReupload] = useState(false);

  const currentFile = project?.[currentFileField];
  const filename = project?.[filenameField];
  const history = project?.[historyField] || [];
  const version = project?.[versionField] || (currentFile ? 1 : 0);
  const timestamp = project?.[timestampField];

  if (!currentFile && history.length === 0) return null;

  const downloadCurrent = async () => {
    try {
      const res = await api.get(`/projects/${project.id}/${kind}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || kind;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  const downloadHistorical = async (v, fname) => {
    try {
      const res = await api.get(`/projects/${project.id}/${kind}/history/${v}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `v${v}_${fname || kind}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  const submitReupload = async () => {
    setError('');
    if (!pickedFile) {
      setError('Please select a file');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append(uploadFieldName, pickedFile);
      extraFormFields.forEach(([k, v]) => fd.append(k, v));
      const { data } = await api.post(uploadEndpoint, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpdated?.(data);
      setShowReupload(false);
      setPickedFile(null);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-emerald-200 bg-emerald-50/60 rounded-lg p-3" data-testid={`artifact-card-${kind}`}>
      <div className="flex items-start gap-2">
        <FileCheck2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-900">{label}</span>
            {version > 1 && (
              <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono">v{version}</span>
            )}
          </div>
          <p className="text-xs text-gray-600 mt-0.5 truncate" data-testid={`artifact-filename-${kind}`}>{filename}</p>
          {timestamp && <p className="text-[11px] text-gray-400 mt-0.5">Uploaded {formatDateTime(timestamp)}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {currentFile && (
            <button
              type="button"
              onClick={downloadCurrent}
              className="text-sky-600 hover:text-sky-700 text-xs font-semibold underline underline-offset-2"
              data-testid={`artifact-download-${kind}`}
            >
              Download
            </button>
          )}
          {history.length > 0 && (
            <button
              type="button"
              onClick={() => setShowHistory((s) => !s)}
              className="text-gray-500 hover:text-gray-700 text-xs font-medium flex items-center gap-1"
              data-testid={`artifact-history-toggle-${kind}`}
            >
              <History className="w-3 h-3" /> {history.length} prev
            </button>
          )}
        </div>
      </div>

      {showHistory && history.length > 0 && (
        <div className="mt-2 pl-6 border-l-2 border-emerald-200 space-y-1" data-testid={`artifact-history-${kind}`}>
          {history.map((h) => (
            <div key={h.version} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="font-mono text-gray-400">v{h.version}</span>
              <span className="flex-1 truncate">{h.filename}</span>
              <span className="text-gray-400">{h.uploaded_at ? formatDateTime(h.uploaded_at) : '—'}</span>
              <button
                type="button"
                onClick={() => downloadHistorical(h.version, h.filename)}
                className="text-sky-600 hover:text-sky-700 font-semibold underline underline-offset-2"
                data-testid={`artifact-history-download-${kind}-v${h.version}`}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      )}

      {canReupload && !showReupload && (
        <div className="mt-2 pl-6">
          <button
            type="button"
            onClick={() => setShowReupload(true)}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1"
            data-testid={`artifact-reupload-trigger-${kind}`}
          >
            <Upload className="w-3 h-3" /> Upload a corrected version
          </button>
        </div>
      )}

      {canReupload && showReupload && (
        <div className="mt-2 pl-6 space-y-2" data-testid={`artifact-reupload-${kind}`}>
          <div className="text-xs text-gray-600">
            The current version will be archived to history ({history.length > 0 ? `v${history.length + 1}` : 'v1'} will be saved). The new upload becomes v{version + 1}.
          </div>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) setPickedFile(f);
              e.target.value = '';
            }}
            className="text-xs"
            data-testid={`artifact-reupload-input-${kind}`}
          />
          {pickedFile && (
            <p className="text-xs text-gray-500">Selected: <strong>{pickedFile.name}</strong> ({(pickedFile.size / 1024).toFixed(1)} KB)</p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={submitReupload}
              disabled={uploading || !pickedFile}
              className="h-8 px-3 text-xs bg-sky-500 hover:bg-sky-600"
              data-testid={`artifact-reupload-submit-${kind}`}
            >
              {uploading ? 'Uploading...' : `Submit as v${version + 1}`}
            </Button>
            <button
              type="button"
              onClick={() => { setShowReupload(false); setPickedFile(null); setError(''); }}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
              data-testid={`artifact-reupload-cancel-${kind}`}
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
