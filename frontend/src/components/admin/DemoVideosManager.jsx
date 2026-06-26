import React, { useEffect, useRef, useState } from 'react';
import api, { formatApiError } from '../../utils/api';
import {
  Film, Plus, Trash2, Edit3, Save, X, ArrowUp, ArrowDown,
  Upload, Image as ImageIcon, Loader2,
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function toThumbSrc(doc) {
  if (doc.poster_storage === 'uploaded') {
    return `${BACKEND_URL}/api/public/demo-media/${doc.id}/poster`;
  }
  return doc.poster_url || null;
}

function formatSize(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

function TagsInput({ value, onChange, testId }) {
  const [draft, setDraft] = useState((value || []).join(', '));
  useEffect(() => { setDraft((value || []).join(', ')); }, [value]);
  const commit = () => {
    const parts = draft.split(',').map((s) => s.trim()).filter(Boolean);
    onChange(parts);
  };
  return (
    <input
      type="text"
      className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:border-sky-400"
      placeholder="Tag 1, Tag 2, Tag 3"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      data-testid={testId}
    />
  );
}

function UploadButton({ label, accept, onSelect, busy, testId }) {
  const inputRef = useRef(null);
  return (
    <>
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded border border-gray-200 text-gray-600 hover:text-sky-600 hover:border-sky-300 disabled:opacity-50"
        data-testid={testId}
      >
        {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onSelect(file);
          e.target.value = '';
        }}
      />
    </>
  );
}

function CreateModal({ onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [video, setVideo] = useState(null);
  const [poster, setPoster] = useState(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async () => {
    if (!title.trim() || !video || !poster) {
      setErr('Title, video file and poster image are all required.');
      return;
    }
    setSaving(true);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('description', description.trim());
      fd.append('tags', JSON.stringify(tags));
      fd.append('video', video);
      fd.append('poster', poster);
      const { data } = await api.post('/admin/demo-videos', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onCreated(data);
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" data-testid="demo-video-create-modal">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-500" /> New demo video
          </h3>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600" data-testid="demo-video-create-close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Title</label>
            <input
              type="text"
              className="w-full mt-1 text-sm px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-sky-400"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="demo-video-create-title"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Description</label>
            <textarea
              rows={4}
              className="w-full mt-1 text-sm px-3 py-2 border border-gray-200 rounded focus:outline-none focus:border-sky-400"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              data-testid="demo-video-create-description"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Tags (comma-separated)</label>
            <TagsInput value={tags} onChange={setTags} testId="demo-video-create-tags" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Video file</label>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm,.m4v"
                onChange={(e) => setVideo(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                data-testid="demo-video-create-video"
              />
              {video && <p className="text-[11px] text-gray-500 mt-1 truncate">{video.name} · {formatSize(video.size)}</p>}
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Poster image</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setPoster(e.target.files?.[0] || null)}
                className="mt-1 block w-full text-[11px] text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                data-testid="demo-video-create-poster"
              />
              {poster && <p className="text-[11px] text-gray-500 mt-1 truncate">{poster.name} · {formatSize(poster.size)}</p>}
            </div>
          </div>
          {err && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2" data-testid="demo-video-create-error">{err}</p>}
        </div>
        <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button type="button" onClick={onClose} className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5">Cancel</button>
          <button
            type="button"
            disabled={saving}
            onClick={submit}
            className="inline-flex items-center gap-1.5 bg-sky-500 text-white text-xs font-semibold px-3 py-1.5 rounded hover:bg-sky-600 disabled:opacity-60"
            data-testid="demo-video-create-submit"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {saving ? 'Uploading...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoRow({ doc, index, total, onChange, onDelete, onMove }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: doc.title, description: doc.description, tags: doc.tags || [] });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(null); // 'video' | 'poster'
  const [err, setErr] = useState('');

  useEffect(() => {
    setDraft({ title: doc.title, description: doc.description, tags: doc.tags || [] });
  }, [doc]);

  const saveEdit = async () => {
    setBusy(true);
    setErr('');
    try {
      const { data } = await api.put(`/admin/demo-videos/${doc.id}`, draft);
      onChange(data);
      setEditing(false);
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || e.message);
    } finally {
      setBusy(false);
    }
  };

  const replaceFile = async (kind, file) => {
    setUploading(kind);
    setErr('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post(`/admin/demo-videos/${doc.id}/${kind}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data);
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || e.message);
    } finally {
      setUploading(null);
    }
  };

  const del = async () => {
    if (!window.confirm(`Delete "${doc.title}"? This removes the DB record and media files from disk.`)) return;
    setBusy(true);
    try {
      await api.delete(`/admin/demo-videos/${doc.id}`);
      onDelete(doc.id);
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || e.message);
      setBusy(false);
    }
  };

  const thumb = toThumbSrc(doc);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4" data-testid={`demo-video-row-${doc.id}`}>
      <div className="w-40 shrink-0 aspect-video bg-gray-100 rounded overflow-hidden flex items-center justify-center">
        {thumb ? (
          <img src={thumb} alt={doc.title} className="w-full h-full object-cover" />
        ) : (
          <ImageIcon className="w-6 h-6 text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-2">
            <input
              className="w-full text-sm font-semibold px-2 py-1 border border-gray-200 rounded"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              data-testid={`demo-video-edit-title-${doc.id}`}
            />
            <textarea
              rows={3}
              className="w-full text-xs px-2 py-1 border border-gray-200 rounded"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              data-testid={`demo-video-edit-description-${doc.id}`}
            />
            <TagsInput value={draft.tags} onChange={(tags) => setDraft((d) => ({ ...d, tags }))} testId={`demo-video-edit-tags-${doc.id}`} />
          </div>
        ) : (
          <>
            <h4 className="text-sm font-semibold text-gray-900 truncate">{doc.title}</h4>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{doc.description}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {(doc.tags || []).map((t) => (
                <span key={t} className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded">{t}</span>
              ))}
            </div>
          </>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {editing ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={saveEdit}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-sky-500 text-white hover:bg-sky-600 disabled:opacity-50"
                data-testid={`demo-video-edit-save-${doc.id}`}
              >
                {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="text-[11px] text-gray-500 hover:text-gray-700 px-2 py-1" data-testid={`demo-video-edit-cancel-${doc.id}`}>
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded border border-gray-200 text-gray-600 hover:text-sky-600 hover:border-sky-300"
              data-testid={`demo-video-edit-${doc.id}`}
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          )}

          <UploadButton
            label="Replace video"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.mov,.webm,.m4v"
            busy={uploading === 'video'}
            onSelect={(f) => replaceFile('video', f)}
            testId={`demo-video-replace-video-${doc.id}`}
          />
          <UploadButton
            label="Replace poster"
            accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
            busy={uploading === 'poster'}
            onSelect={(f) => replaceFile('poster', f)}
            testId={`demo-video-replace-poster-${doc.id}`}
          />

          <div className="inline-flex items-center gap-1 ml-auto">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onMove(doc.id, -1)}
              className="p-1 rounded border border-gray-200 text-gray-500 hover:text-sky-600 hover:border-sky-300 disabled:opacity-30"
              title="Move up"
              data-testid={`demo-video-moveup-${doc.id}`}
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => onMove(doc.id, 1)}
              className="p-1 rounded border border-gray-200 text-gray-500 hover:text-sky-600 hover:border-sky-300 disabled:opacity-30"
              title="Move down"
              data-testid={`demo-video-movedown-${doc.id}`}
            >
              <ArrowDown className="w-3 h-3" />
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={del}
              className="p-1 rounded border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-300 disabled:opacity-30"
              title="Delete"
              data-testid={`demo-video-delete-${doc.id}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <p className="mt-2 text-[10px] text-gray-400">
          {doc.video_storage === 'uploaded'
            ? `Uploaded · ${formatSize(doc.video_size)} · ${doc.video_original_name || doc.video_filename}`
            : `Static · ${doc.video_url}`}
        </p>
        {err && <p className="mt-1 text-[11px] text-red-600" data-testid={`demo-video-error-${doc.id}`}>{err}</p>}
      </div>
    </div>
  );
}

export default function DemoVideosManager() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/demo-videos');
      setVideos(data);
      setErr('');
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMove = async (id, delta) => {
    const idx = videos.findIndex((v) => v.id === id);
    if (idx < 0) return;
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= videos.length) return;
    const next = [...videos];
    const [moved] = next.splice(idx, 1);
    next.splice(newIdx, 0, moved);
    setVideos(next);
    try {
      await api.post('/admin/demo-videos/reorder', { order: next.map((v) => v.id) });
    } catch (e) {
      setErr(formatApiError(e.response?.data?.detail) || e.message);
      load();
    }
  };

  return (
    <section className="mt-10" data-testid="demo-videos-manager">
      <div className="flex items-end justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-sky-600 flex items-center gap-1">
            <Film className="w-3 h-3" /> Admin
          </p>
          <h2 className="text-2xl font-bold text-gray-900">Demo Videos</h2>
          <p className="text-sm text-gray-500 mt-1">
            Videos and posters shown on the homepage reel. Upload new ones, replace files, reorder or delete —
            changes go live immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 bg-sky-500 text-white text-xs font-semibold px-3 py-2 rounded hover:bg-sky-600"
          data-testid="demo-video-add"
        >
          <Plus className="w-3.5 h-3.5" /> Add new video
        </button>
      </div>

      {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg mb-3" data-testid="demo-videos-error">{err}</div>}
      {loading ? (
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      ) : videos.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No demo videos yet — click "Add new video" to upload the first one.</p>
      ) : (
        <div className="space-y-3" data-testid="demo-videos-list">
          {videos.map((doc, idx) => (
            <VideoRow
              key={doc.id}
              doc={doc}
              index={idx}
              total={videos.length}
              onChange={(updated) => setVideos((vs) => vs.map((v) => (v.id === updated.id ? updated : v)))}
              onDelete={(id) => setVideos((vs) => vs.filter((v) => v.id !== id))}
              onMove={handleMove}
            />
          ))}
        </div>
      )}

      {creating && (
        <CreateModal
          onClose={() => setCreating(false)}
          onCreated={(doc) => { setVideos((vs) => [...vs, doc]); setCreating(false); }}
        />
      )}
    </section>
  );
}
