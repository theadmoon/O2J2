import React, { useState } from 'react';
import api, { formatApiError } from '../../utils/api';
import { formatDateTime } from '../../utils/formatters';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Plus, ExternalLink, Trash2, FileVideo, Link as LinkIcon } from 'lucide-react';

/**
 * Deliverables section — admin adds cloud-hosted links (Google Drive, Dropbox, WeTransfer, etc.).
 * Clients see filename + clickable cloud link. Opening the link (first time, post-delivery)
 * auto-advances stage 7 (files_accessed) via an access-beacon endpoint.
 */
export default function Deliverables({ project, user, onUpdated }) {
  const isAdmin = user?.role === 'admin';
  const canAdd = isAdmin && !!project.production_started_at && !project.delivered_at;
  const canDelete = isAdmin && !project.delivered_at;
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ filename: '', cloud_url: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const deliverables = project.deliverables || [];

  const resetForm = () => setForm({ filename: '', cloud_url: '', description: '' });

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await api.post(`/projects/${project.id}/deliverables`, form);
      const { data } = await api.get(`/projects/${project.id}`);
      onUpdated(data);
      setShowForm(false);
      resetForm();
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
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

  const handleOpen = async (d) => {
    // Open link immediately (popup-safe)
    window.open(d.cloud_url, '_blank', 'noopener,noreferrer');
    // Record access (fire-and-forget)
    try {
      await api.post(`/projects/${project.id}/deliverables/${d.id}/access`);
      const { data } = await api.get(`/projects/${project.id}`);
      onUpdated(data);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="border border-gray-200 bg-white rounded-lg p-6 shadow-sm" data-testid="deliverables-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileVideo className="w-4 h-4 text-sky-500" /> Deliverables
        </h2>
        {canAdd && (
          <Button
            type="button"
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white text-xs h-8 px-3"
            data-testid="deliverable-add-button"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Cloud Link
          </Button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded mb-3" data-testid="deliverables-error">{error}</div>}

      {deliverables.length === 0 ? (
        <p className="text-xs text-gray-400 italic" data-testid="deliverables-empty">
          {isAdmin
            ? (canAdd
              ? 'No deliverables yet. Host the files in Google Drive / Dropbox / WeTransfer and paste the link here.'
              : (project.delivered_at ? 'Delivery has been marked.' : 'Deliverables can be added once production has started.'))
            : 'No deliverables available yet.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {deliverables.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 p-3 border border-gray-100 bg-gray-50 rounded-lg" data-testid={`deliverable-item-${d.id}`}>
              <div className="flex items-center gap-3 min-w-0">
                <FileVideo className="w-5 h-5 text-sky-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{d.original_filename}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
                    <LinkIcon className="w-3 h-3" /> shared {formatDateTime(d.uploaded_at)}
                    {d.first_accessed_at && (
                      <span className="text-emerald-600 ml-1">· first opened {formatDateTime(d.first_accessed_at)}</span>
                    )}
                  </p>
                  {d.description && <p className="text-xs text-gray-400 italic mt-0.5">{d.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpen(d)}
                  className="text-sky-600 hover:text-sky-700 text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded hover:bg-white border border-sky-200"
                  data-testid={`deliverable-open-${d.id}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Link
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

      {/* Add-deliverable dialog */}
      <Dialog open={showForm} onOpenChange={(v) => { setShowForm(v); if (!v) { resetForm(); setError(''); } }}>
        <DialogContent className="max-w-lg" data-testid="dialog-add-deliverable">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><LinkIcon className="w-5 h-5 text-sky-500" /> Add Cloud Deliverable</DialogTitle>
            <DialogDescription>Paste the cloud-hosted share link (Google Drive, Dropbox, WeTransfer…). The client will see the filename and open the link from their portal.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div>
              <Label className="text-xs uppercase tracking-wider text-gray-600">Filename</Label>
              <Input
                required
                value={form.filename}
                onChange={(e) => setForm((f) => ({ ...f, filename: e.target.value }))}
                placeholder="e.g. final_edit_v1.mp4"
                className="mt-1.5"
                data-testid="deliverable-input-filename"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-gray-600">Cloud URL</Label>
              <Input
                required
                type="url"
                value={form.cloud_url}
                onChange={(e) => setForm((f) => ({ ...f, cloud_url: e.target.value }))}
                placeholder="https://drive.google.com/file/d/..."
                className="mt-1.5"
                data-testid="deliverable-input-url"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-gray-600">Note (optional)</Label>
              <Textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Version info, access instructions, etc."
                className="mt-1.5 resize-none"
                data-testid="deliverable-input-note"
              />
            </div>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded">{error}</div>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); setError(''); }}>Cancel</Button>
              <Button type="submit" disabled={submitting} className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white">
                {submitting ? 'Adding…' : 'Add Deliverable'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
