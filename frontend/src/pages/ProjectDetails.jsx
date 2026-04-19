import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, formatCurrency } from '../utils/formatters';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ChainTimeline from '../components/OperationalChain/ChainTimeline';
import StageActions from '../components/OperationalChain/StageActions';
import Deliverables from '../components/OperationalChain/Deliverables';
import ChatContainer from '../components/Chat/ChatContainer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import {
  ArrowLeft, FileText, Hash, User, Mail, Briefcase, DollarSign, ShieldCheck,
  Paperclip, Download, Upload, RefreshCw,
} from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docPreview, setDocPreview] = useState(null);
  const [previewText, setPreviewText] = useState('');
  const [showAdvanceFallback, setShowAdvanceFallback] = useState(false);
  const [scriptUploading, setScriptUploading] = useState(false);
  const scriptInputRef = useRef(null);

  useEffect(() => {
    loadProject();
    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch {}
    setLoading(false);
  };

  const handleViewDoc = async (docType) => {
    try {
      const { data } = await api.get(`/projects/${id}/documents/${docType}/txt`, { responseType: 'text' });
      setPreviewText(typeof data === 'string' ? data : JSON.stringify(data));
      setDocPreview(docType);
    } catch {
      setPreviewText('Error loading document');
      setDocPreview(docType);
    }
  };

  const handleAdvance = async () => {
    try {
      const { data } = await api.put(`/projects/${id}/advance`);
      setProject(data);
    } catch {}
  };

  const handleScriptDownload = async () => {
    try {
      const res = await api.get(`/projects/${id}/script`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = project?.script_filename || `attachment${(project?.script_file?.match(/\.[^.]+$/) || [''])[0]}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const handleScriptReplace = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScriptUploading(true);
    try {
      const fd = new FormData();
      fd.append('script', file);
      const { data } = await api.put(`/projects/${id}/script`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProject(data);
    } catch {}
    setScriptUploading(false);
    if (scriptInputRef.current) scriptInputRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-8 pb-16 px-6 max-w-7xl mx-auto text-center">
          <p className="text-gray-500">Project not found.</p>
          <Link to="/dashboard" className="text-sky-600 text-sm mt-4 inline-block font-medium">Back to Dashboard</Link>
        </main>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const quoteVisible = project.quote_amount > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-8 pb-16 px-6 max-w-7xl mx-auto" data-testid="project-details">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-sky-600 mb-6 transition-colors" data-testid="back-to-dashboard">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Project Header */}
        <div className="border border-gray-200 bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider font-semibold text-sky-600 mb-1">Project</p>
              <h1 className="text-2xl font-bold text-gray-900 break-words">{project.project_title}</h1>
            </div>
            <span className="text-xs px-3 py-1.5 rounded-full font-medium bg-sky-100 text-sky-700 capitalize" data-testid="project-status-badge">
              {project.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Hash className="w-4 h-4 text-sky-500" />
              <span className="font-mono text-xs" data-testid="project-number">{project.project_number}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 text-sky-500" />
              <span>{project.user_name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 text-sky-500" />
              <span className="truncate">{project.user_email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-4 h-4 text-sky-500" />
              <span className="capitalize">{project.service_type?.replace(/_/g, ' ')}</span>
            </div>
          </div>
          {project.brief && (
            <p className="mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4 whitespace-pre-wrap" data-testid="project-brief">{project.brief}</p>
          )}

          {(() => {
            const canUploadScript = !project.invoice_sent_at && (user?.role === 'admin' || user?.id === project.user_id);
            const showUploadNew = !project.script_file && canUploadScript;
            const showReplace = project.script_file && !project.script_filename && canUploadScript;
            return (
              <>
                {(project.script_file || showUploadNew) && (
                  <div className="mt-4 border-t border-gray-100 pt-4" data-testid="project-script-attachment">
                    <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                      <p className="text-xs uppercase tracking-wider text-gray-500">Script / Reference File</p>
                      {canUploadScript && (
                        <>
                          <input
                            ref={scriptInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt,.rtf,.odt"
                            onChange={handleScriptReplace}
                            className="hidden"
                            data-testid="script-upload-input"
                          />
                          {showUploadNew && (
                            <button type="button" disabled={scriptUploading} onClick={() => scriptInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-sky-50 border border-sky-200 rounded text-sky-700 hover:bg-sky-100"
                              data-testid="script-upload-button">
                              <Upload className="w-3.5 h-3.5" /> {scriptUploading ? 'Uploading…' : 'Upload script'}
                            </button>
                          )}
                          {showReplace && (
                            <button type="button" disabled={scriptUploading} onClick={() => scriptInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-amber-50 border border-amber-200 rounded text-amber-700 hover:bg-amber-100"
                              data-testid="script-replace-button">
                              <RefreshCw className="w-3.5 h-3.5" /> {scriptUploading ? 'Uploading…' : 'Re-upload to restore filename'}
                            </button>
                          )}
                          {project.script_filename && !project.invoice_sent_at && (
                            <button type="button" disabled={scriptUploading} onClick={() => scriptInputRef.current?.click()}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-gray-600 hover:bg-gray-100"
                              data-testid="script-replace-button-2">
                              <RefreshCw className="w-3.5 h-3.5" /> Replace
                            </button>
                          )}
                        </>
                      )}
                    </div>
                    {project.script_file ? (
                      project.script_filename ? (
                        <button type="button" onClick={handleScriptDownload}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-sky-50 border border-sky-200 rounded-lg text-sm text-sky-700 hover:bg-sky-100 transition"
                          data-testid="script-download-button">
                          <Paperclip className="w-4 h-4" />
                          <span className="truncate max-w-xs">{project.script_filename}</span>
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <button type="button" onClick={handleScriptDownload}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-sky-50 border border-sky-200 rounded-lg text-sm text-sky-700 hover:bg-sky-100 transition"
                            data-testid="script-download-button">
                            <Paperclip className="w-4 h-4" />
                            <Download className="w-3.5 h-3.5" />
                            <span>Download</span>
                          </button>
                          {user?.id === project.user_id && (
                            <span className="text-xs text-amber-700">
                              Original filename couldn't be recovered — please re-upload to restore it.
                            </span>
                          )}
                        </div>
                      )
                    ) : (
                      <p className="text-xs text-gray-400 italic">No script uploaded yet.</p>
                    )}
                  </div>
                )}
              </>
            );
          })()}

          {/* Quote & payment info (visible once order activated) */}
          {quoteVisible && (
            <div className="mt-4 border-t border-gray-100 pt-4 grid sm:grid-cols-3 gap-4 text-sm" data-testid="project-quote-block">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">Quote</p>
                <p className="text-lg font-bold text-sky-600 mt-0.5 flex items-center gap-1"><DollarSign className="w-4 h-4" />{formatCurrency(project.quote_amount)}</p>
              </div>
              {project.quote_details && (
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Details</p>
                  <p className="text-gray-700 text-sm mt-0.5">{project.quote_details}</p>
                </div>
              )}
              {project.paypal_transaction_id && (
                <div className="sm:col-span-3 flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded px-3 py-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-mono">Transaction ID: {project.paypal_transaction_id}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stage actions banner */}
        <div className="mb-6" data-testid="stage-actions-wrapper">
          <StageActions project={project} user={user} onUpdated={(p) => setProject(p)} />
        </div>

        {/* Main Content: Timeline + Deliverables + Chat */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="border border-gray-200 bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-500" /> Operational Chain
              </h2>
              <ChainTimeline project={project} onViewDoc={handleViewDoc} />
              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                    <input type="checkbox" checked={showAdvanceFallback} onChange={(e) => setShowAdvanceFallback(e.target.checked)} data-testid="admin-fallback-toggle" />
                    <span>Show manual override (advance any stage)</span>
                  </label>
                  {showAdvanceFallback && project.status !== 'completed' && (
                    <button onClick={handleAdvance} className="mt-2 text-xs px-3 py-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50" data-testid="advance-stage-button">
                      Advance Stage (admin override)
                    </button>
                  )}
                </div>
              )}
            </div>

            <Deliverables project={project} user={user} onUpdated={(p) => setProject(p)} />
          </div>
          <div className="lg:col-span-2">
            <ChatContainer projectId={project.id} />
          </div>
        </div>
      </main>
      <Footer />

      {/* Document Preview Modal */}
      <Dialog open={!!docPreview} onOpenChange={() => setDocPreview(null)}>
        <DialogContent className="bg-white border-gray-200 max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-gray-900 font-bold">{docPreview?.replace(/_/g, ' ').toUpperCase()}</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-xs text-gray-700 font-mono overflow-y-auto max-h-[60vh] p-4 bg-gray-50 border border-gray-200 rounded-lg" data-testid="document-preview-text">
            {previewText}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
