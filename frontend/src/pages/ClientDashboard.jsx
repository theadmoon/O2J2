import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate } from '../utils/formatters';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import { Plus, FolderOpen, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_COLORS = {
  submitted: 'bg-blue-500/20 text-blue-400',
  order_activated: 'bg-amber-500/20 text-amber-400',
  invoice_sent: 'bg-orange-500/20 text-orange-400',
  invoice_signed: 'bg-orange-500/20 text-orange-400',
  production_started: 'bg-yellow-500/20 text-yellow-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
  files_accessed: 'bg-emerald-500/20 text-emerald-400',
  delivery_confirmed: 'bg-emerald-500/20 text-emerald-400',
  work_accepted: 'bg-green-500/20 text-green-400',
  payment_sent: 'bg-cyan-500/20 text-cyan-400',
  payment_received: 'bg-teal-500/20 text-teal-400',
  completed: 'bg-[#FF6B6B]/20 text-[#FF6B6B]',
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
    <div className="min-h-screen bg-[#050A14]">
      <Navbar />
      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto" data-testid="client-dashboard">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-mono text-[#FF6B6B] mb-1">Dashboard</p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#F8FAFC] tracking-tight">Your Projects</h1>
          </div>
          <Link to="/projects/new" className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white px-5 py-2.5 text-sm flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(255,107,107,0.3)]" data-testid="new-project-trigger">
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#FF6B6B] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-white/10 bg-white/5">
            <FolderOpen className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">No projects yet</p>
            <Link to="/projects/new" className="text-[#FF6B6B] text-sm hover:underline inline-flex items-center gap-1" data-testid="empty-create-project">
              Create your first project <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={`/projects/${p.id}`} className="block border border-white/10 bg-[#0B1325] hover:bg-[#121C33] p-6 transition-all group" data-testid={`project-card-${p.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs px-2 py-1 rounded-sm font-mono ${STATUS_COLORS[p.status] || 'bg-slate-500/20 text-slate-400'}`}>{p.status?.replace(/_/g, ' ')}</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-[#FF6B6B] transition-colors" />
                  </div>
                  <h3 className="text-[#F8FAFC] text-sm font-medium mb-1 line-clamp-1">{p.project_title}</h3>
                  <p className="text-xs text-slate-500 font-mono mb-3">{p.project_number}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3 h-3" /> {formatDate(p.created_at)}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
