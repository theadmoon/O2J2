import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate } from '../utils/formatters';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { Plus, FolderOpen, Clock, ArrowRight } from 'lucide-react';

const STATUS_COLORS = {
  submitted: 'bg-blue-100 text-blue-700',
  order_activated: 'bg-amber-100 text-amber-700',
  invoice_sent: 'bg-orange-100 text-orange-700',
  invoice_signed: 'bg-orange-100 text-orange-700',
  production_started: 'bg-yellow-100 text-yellow-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  files_accessed: 'bg-emerald-100 text-emerald-700',
  delivery_confirmed: 'bg-emerald-100 text-emerald-700',
  work_accepted: 'bg-green-100 text-green-700',
  payment_sent: 'bg-cyan-100 text-cyan-700',
  payment_received: 'bg-teal-100 text-teal-700',
  completed: 'bg-sky-100 text-sky-700',
};

export default function ClientDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then(({ data }) => {
      setProjects(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-8 pb-16 px-6 max-w-7xl mx-auto" data-testid="client-dashboard">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-sky-600 mb-1">Dashboard</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Your Projects</h1>
          </div>
          <Link to="/projects/new" className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-md hover:shadow-lg" data-testid="new-project-trigger">
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-gray-200 bg-white rounded-lg shadow-sm">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No projects yet</p>
            <Link to="/projects/new" className="text-sky-600 text-sm hover:underline inline-flex items-center gap-1 font-medium" data-testid="empty-create-project">
              Create your first project <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`} className="block border border-gray-200 bg-white hover:shadow-lg rounded-lg p-6 transition-all group" data-testid={`project-card-${p.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status?.replace(/_/g, ' ')}</span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-sky-500 transition-colors" />
                </div>
                <h3 className="text-gray-900 text-sm font-semibold mb-1 line-clamp-1">{p.project_title}</h3>
                <p className="text-xs text-gray-400 font-mono mb-3">{p.project_number}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" /> {formatDate(p.created_at)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
