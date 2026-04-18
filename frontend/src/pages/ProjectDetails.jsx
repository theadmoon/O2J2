import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, formatCurrency } from '../utils/formatters';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import ChainTimeline from '../components/OperationalChain/ChainTimeline';
import ChatContainer from '../components/Chat/ChatContainer';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ArrowLeft, FileText, Hash, User, Mail, Briefcase } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docPreview, setDocPreview] = useState(null);
  const [previewText, setPreviewText] = useState('');

  useEffect(() => {
    loadProject();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050A14]">
        <Navbar />
        <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto text-center">
          <p className="text-slate-400">Project not found.</p>
          <Link to="/dashboard" className="text-[#FF6B6B] text-sm mt-4 inline-block">Back to Dashboard</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A14]">
      <Navbar />
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto" data-testid="project-details">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-[#FF6B6B] mb-6 transition-colors" data-testid="back-to-dashboard">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Project Header */}
        <div className="border border-white/10 bg-[#0B1325] p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] font-mono text-[#FF6B6B] mb-1">Project</p>
              <h1 className="font-serif text-2xl text-[#F8FAFC] tracking-tight">{project.project_title}</h1>
            </div>
            {user?.role === 'admin' && project.status !== 'completed' && (
              <button
                onClick={handleAdvance}
                className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white px-4 py-2 text-xs uppercase tracking-wider transition-colors"
                data-testid="advance-stage-button"
              >
                Advance Stage
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Hash className="w-4 h-4 text-[#FF6B6B]" />
              <span className="font-mono text-xs">{project.project_number}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <User className="w-4 h-4 text-[#FF6B6B]" />
              <span>{project.user_name}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-4 h-4 text-[#FF6B6B]" />
              <span>{project.user_email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Briefcase className="w-4 h-4 text-[#FF6B6B]" />
              <span>{project.service_type?.replace(/_/g, ' ')}</span>
            </div>
          </div>
          {project.brief && (
            <p className="mt-4 text-sm text-slate-400 border-t border-white/5 pt-4">{project.brief}</p>
          )}
        </div>

        {/* Main Content: Timeline + Chat */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="border border-white/10 bg-[#0B1325] p-6">
              <h2 className="text-sm font-medium text-[#F8FAFC] mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#FF6B6B]" /> Operational Chain
              </h2>
              <ChainTimeline project={project} onViewDoc={handleViewDoc} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <ChatContainer projectId={project.id} />
          </div>
        </div>
      </main>
      <Footer />

      {/* Document Preview Modal */}
      <Dialog open={!!docPreview} onOpenChange={() => setDocPreview(null)}>
        <DialogContent className="bg-[#0B1325] border-white/10 text-white max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-[#F8FAFC] font-serif">{docPreview?.replace(/_/g, ' ').toUpperCase()}</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-xs text-slate-300 font-mono overflow-y-auto max-h-[60vh] p-4 bg-[#050A14] border border-white/10" data-testid="document-preview-text">
            {previewText}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
