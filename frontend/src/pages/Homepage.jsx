import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Layout/Footer';
import { ArrowRight, Film, Scissors, Sparkles, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const HERO_BG = "https://images.unsplash.com/photo-1681137063068-081072cf04b4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTN8MHwxfHNlYXJjaHwyfHxmaWxtJTIwcHJvZHVjdGlvbiUyMHNldCUyMGRhcmt8ZW58MHx8fHwxNzc2NDgwODkxfDA&ixlib=rb-4.1.0&q=85";

const tiers = [
  { name: 'Basic', price: '$500 - $750', icon: Film, features: ['Simple edits', 'Stock footage', '720p delivery', '5-day turnaround'] },
  { name: 'Standard', price: '$750 - $1,050', icon: Scissors, features: ['Custom footage', 'Motion graphics', '1080p delivery', '10-day turnaround'] },
  { name: 'Premium', price: '$1,050 - $2,000', icon: Sparkles, features: ['Full production', 'Script writing', '4K delivery', 'Unlimited revisions'], featured: true },
];

export default function Homepage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#050A14]">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050A14]/90 to-[#050A14]/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-xs uppercase tracking-[0.3em] font-mono text-[#FF6B6B] mb-6">Ocean2Joy Digital Video Production</p>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-none text-[#F8FAFC] font-light max-w-3xl">
              Professional Digital Video Production Services
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-xl leading-relaxed">
              Custom videos delivered electronically. No physical shipping. From concept to final cut.
            </p>
            <div className="mt-10 flex gap-4">
              <Link
                to={user && user.id ? "/projects/new" : "/register"}
                className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white px-8 py-3 text-sm tracking-wide transition-all hover:shadow-[0_0_30px_rgba(255,107,107,0.3)] flex items-center gap-2"
                data-testid="hero-cta-button"
              >
                Start Your Project <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Demo Videos */}
      <section className="py-20 px-6 bg-[#0B1325]" data-testid="demo-videos-section">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] font-mono text-[#FF6B6B] mb-3">Our Work</p>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#F8FAFC] mb-12">Recent Productions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((n) => (
              <div key={n} className="relative group bg-white/5 rounded-sm overflow-hidden border border-white/10 hover:border-[#FF6B6B]/30 transition-all">
                <div className="aspect-video bg-[#121C33] flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#FF6B6B]/20 flex items-center justify-center group-hover:bg-[#FF6B6B]/40 transition-all">
                    <Play className="w-7 h-7 text-[#FF6B6B]" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-slate-300 text-sm">Project Example {n}</p>
                  <p className="text-slate-500 text-xs mt-1">Demo video placeholder</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Tiers */}
      <section className="py-20 px-6" data-testid="services-section">
        <div className="max-w-6xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] font-mono text-[#FF6B6B] mb-3">Services</p>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight text-[#F8FAFC] mb-12">Choose Your Package</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative p-8 border transition-all ${
                  tier.featured
                    ? 'border-[#FF6B6B]/50 bg-[#FF6B6B]/5 shadow-[0_0_40px_rgba(255,107,107,0.1)]'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
                data-testid={`tier-${tier.name.toLowerCase()}`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-6 bg-[#FF6B6B] text-white text-xs px-3 py-1 tracking-wider uppercase">Popular</span>
                )}
                <tier.icon className={`w-6 h-6 mb-4 ${tier.featured ? 'text-[#FF6B6B]' : 'text-slate-400'}`} />
                <h3 className="font-serif text-xl text-[#F8FAFC] mb-2">{tier.name}</h3>
                <p className="font-mono text-[#FF6B6B] text-lg mb-6">{tier.price}</p>
                <ul className="space-y-2">
                  {tier.features.map((f) => (
                    <li key={f} className="text-sm text-slate-400 flex items-center gap-2">
                      <span className="w-1 h-1 bg-[#FF6B6B] rounded-full" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
