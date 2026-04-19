import React, { useRef, useState } from 'react';
import api, { formatApiError } from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import { Paperclip, Download, Upload, Trash2, FilePlus } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function humanSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0; let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i += 1; }
  return `${n.toFixed(n >= 10 ? 0 : 1)} ${units[i]}`;
}

/**
 * Append-only Reference Files section.
 * - The initial submission (project.script_file) is rendered upstream as immutable history.
 * - This component manages additional documents added AFTER project creation.
 */
export default function ReferenceFiles({ project, user, onUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const invoiceLocked = !!project.invoice_sent_at;
  const canUpload = !invoiceLocked; // both client and admin can add until invoice sent
  const files = project.reference_files || [];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (note.trim()) fd.append('note', note.trim());
      await api.post(`/projects/${project.id}/reference-files`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { data } = await api.get(`/projects/${project.id}`);
      onUpdated(data);
      setNote('');
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Remove this reference file? Other uploads remain untouched.')) return;
    setError('');
    try {
      await api.delete(`/projects/${project.id}/reference-files/${fileId}`);
      const { data } = await api.get(`/projects/${project.id}`);
      onUpdated(data);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  const handleDownload = async (ref) => {
    try {
      const res = await api.get(`/projects/${project.id}/reference-files/${ref.id}`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ref.original_filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4" data-testid="reference-files-block">
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <p className="text-xs uppercase tracking-wider text-gray-500">Additional Reference Files</p>
        {canUpload && (
          <>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.rtf,.odt,.png,.jpg,.jpeg,.zip"
              onChange={handleUpload}
              className="hidden"
              data-testid="reference-file-input"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-sky-50 border border-sky-200 rounded text-sky-700 hover:bg-sky-100 disabled:opacity-50"
              data-testid="reference-file-add-button"
            >
              <FilePlus className="w-3.5 h-3.5" /> {uploading ? 'Uploading…' : 'Add file'}
            </button>
          </>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded mb-3" data-testid="reference-files-error">{error}</div>}

      {invoiceLocked && files.length === 0 && (
        <p className="text-xs text-gray-400 italic">No additional reference files.</p>
      )}

      {!invoiceLocked && files.length === 0 && (
        <p className="text-xs text-gray-500 italic">
          None yet. Add supplementary documents here — they complement (never replace) the initial submission.
        </p>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((r) => {
            const canDelete = !invoiceLocked && (user?.role === 'admin' || user?.id === r.uploaded_by);
            const uploaderLabel = r.uploaded_by_role === 'admin' ? 'Ocean2Joy Team' : r.uploaded_by_name;
            return (
              <li key={r.id} className="flex items-center justify-between gap-3 p-3 border border-gray-100 bg-gray-50 rounded-lg" data-testid={`reference-file-${r.id}`}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Paperclip className="w-4 h-4 text-sky-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => handleDownload(r)}
                      className="text-sm font-medium text-sky-700 hover:underline truncate block max-w-full text-left"
                      data-testid={`reference-file-download-${r.id}`}
                    >
                      {r.original_filename}
                    </button>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {humanSize(r.size_bytes)} · added by {uploaderLabel} · {formatDate(r.uploaded_at)}
                    </p>
                    {r.note && <p className="text-xs text-gray-400 italic mt-0.5">“{r.note}”</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(r)}
                    className="text-sky-600 hover:text-sky-700 text-xs px-2 py-1 rounded hover:bg-white border border-sky-200"
                    data-testid={`reference-file-download-btn-${r.id}`}
                    aria-label="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="text-red-500 hover:text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 border border-red-200"
                      data-testid={`reference-file-delete-${r.id}`}
                      aria-label="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
