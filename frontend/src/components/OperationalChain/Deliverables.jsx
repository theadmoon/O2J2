import React, { useState, useRef } from 'react';
import api, { formatApiError } from '../../utils/api';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui/button';
import { Upload, Download, Trash2, FileVideo } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function humanSize(bytes) {
  if (!bytes && bytes !== 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0; let n = bytes;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i += 1; }
  return `${n.toFixed(n >= 10 ? 0 : 1)} ${units[i]}`;
}

/**
 * Deliverables section — list + admin upload. Clients can download.
 * Downloading the first deliverable auto-advances stage 7 (files_accessed) on backend.
 */
export default function Deliverables({ project, user, onUpdated }) {
  const isAdmin = user?.role === 'admin';
  const canUpload = isAdmin && !!project.production_started_at && !project.delivered_at;
  const canDelete = isAdmin && !project.delivered_at;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const deliverables = project.deliverables || [];

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      await api.post(`/projects/${project.id}/deliverables`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const { data } = await api.get(`/projects/${project.id}`);
      onUpdated(data);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Remove this deliverable?')) return;
    try {
      await api.delete(`/projects/${project.id}/deliverables/${fileId}`);
      const { data } = await api.get(`/projects/${project.id}`);
      onUpdated(data);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  const handleDownload = async (fileId, filename) => {
    try {
      const res = await api.get(`/projects/${project.id}/deliverables/${fileId}`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'deliverable';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      // Refresh project so the auto-set files_accessed_at appears in the UI
      const { data } = await api.get(`/projects/${project.id}`);
      onUpdated(data);
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    }
  };

  return (
    <div className="border border-gray-200 bg-white rounded-lg p-6 shadow-sm" data-testid="deliverables-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileVideo className="w-4 h-4 text-sky-500" /> Deliverables
        </h2>
        {canUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleUpload}
              className="hidden"
              data-testid="deliverable-file-input"
            />
            <Button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white text-xs h-8 px-3"
              data-testid="deliverable-upload-button"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" /> {uploading ? 'Uploading…' : 'Upload File'}
            </Button>
          </>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded mb-3" data-testid="deliverables-error">{error}</div>}

      {deliverables.length === 0 ? (
        <p className="text-xs text-gray-400 italic" data-testid="deliverables-empty">
          {isAdmin ? (canUpload ? 'No files uploaded yet. Upload the final deliverables above.' : (project.delivered_at ? 'Delivery has been marked.' : 'Deliverables can be uploaded once production has started.')) : 'No deliverables available yet.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {deliverables.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 p-3 border border-gray-100 bg-gray-50 rounded-lg" data-testid={`deliverable-item-${d.id}`}>
              <div className="flex items-center gap-3 min-w-0">
                <FileVideo className="w-5 h-5 text-sky-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{d.original_filename}</p>
                  <p className="text-xs text-gray-500">{humanSize(d.size_bytes)} · uploaded {formatDate(d.uploaded_at)}</p>
                  {d.description && <p className="text-xs text-gray-400 italic mt-0.5">{d.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownload(d.id, d.original_filename)}
                  className="text-sky-600 hover:text-sky-700 text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-white border border-sky-200"
                  data-testid={`deliverable-download-${d.id}`}
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                {canDelete && (
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id)}
                    className="text-red-500 hover:text-red-600 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 border border-red-200"
                    data-testid={`deliverable-delete-${d.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
