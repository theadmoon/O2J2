import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate } from '../utils/formatters';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-8 pb-16 px-6 max-w-7xl mx-auto" data-testid="project-details">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-sky-600 mb-6 transition-colors" data-testid="back-to-dashboard">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Project Header */}
        <div className="border border-gray-200 bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-sky-600 mb-1">Project</p>
              <h1 className="text-2xl font-bold text-gray-900">{project.project_title}</h1>
            </div>
            {user?.role === 'admin' && project.status !== 'completed' && (
              <button
                onClick={handleAdvance}
                className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-semibold transition-colors"
                data-testid="advance-stage-button"
              >
                Advance Stage
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Hash className="w-4 h-4 text-sky-500" />
              <span className="font-mono text-xs">{project.project_number}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4 text-sky-500" />
              <span>{project.user_name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4 text-sky-500" />
              <span>{project.user_email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Briefcase className="w-4 h-4 text-sky-500" />
              <span>{project.service_type?.replace(/_/g, ' ')}</span>
            </div>
          </div>
          {project.brief && (
            <p className="mt-4 text-sm text-gray-500 border-t border-gray-100 pt-4">{project.brief}</p>
          )}
        </div>

        {/* Main Content: Timeline + Chat */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <div className="border border-gray-200 bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-500" /> Operational Chain
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
