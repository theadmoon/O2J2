import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Layout/Footer';
import { Film, Scissors, Sparkles, Play } from 'lucide-react';

const tiers = [
  { name: 'Basic', price: '$500 - $750', icon: Film, features: ['Simple edits', 'Stock footage', '720p delivery', '5-day turnaround'] },
  { name: 'Standard', price: '$750 - $1,050', icon: Scissors, features: ['Custom footage', 'Motion graphics', '1080p delivery', '10-day turnaround'] },
  { name: 'Premium', price: '$1,050 - $2,000', icon: Sparkles, features: ['Full production', 'Script writing', '4K delivery', 'Unlimited revisions'], featured: true },
];

export default function Homepage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Ocean Gradient */}
      <section
        className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.85), rgba(20, 184, 166, 0.85)), url('https://images.unsplash.com/photo-1599622465858-a0b63fdc9b80?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 opacity-30">
          <svg className="absolute bottom-0 w-full animate-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-float" data-testid="hero-title">
            Dive Into an <span className="text-yellow-300">Ocean</span> of Video Possibilities
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-sky-50">
            Professional video production services delivered digitally. From custom filming to AI-powered content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={user && user.id ? "/projects/new" : "/register"}
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition"
              data-testid="hero-cta-button"
            >
              Start Your Project
            </Link>
            <a
              href="#services"
              className="bg-white/20 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition"
              data-testid="hero-explore-button"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* Demo Videos */}
      <section className="py-20 px-6 bg-gray-50" data-testid="demo-videos-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Our Work</h2>
          <p className="text-gray-500 text-center mb-12">Recent productions from our studio</p>
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2].map((n) => (
              <div key={n} className="relative group bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-100 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center group-hover:bg-sky-500/40 transition-all">
                    <Play className="w-7 h-7 text-sky-600" />
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-900 text-sm font-medium">Project Example {n}</p>
                  <p className="text-gray-500 text-xs mt-1">Demo video placeholder</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Tiers */}
      <section className="py-20 px-6 bg-white" id="services" data-testid="services-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Choose Your Package</h2>
          <p className="text-gray-500 text-center mb-12">Professional video production at every level</p>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-lg p-8 transition-all ${
                  tier.featured
                    ? 'border-2 border-sky-500 bg-sky-50 shadow-xl'
                    : 'border border-gray-200 bg-white shadow-md hover:shadow-lg'
                }`}
                data-testid={`tier-${tier.name.toLowerCase()}`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-6 bg-sky-600 text-white text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">Popular</span>
                )}
                <tier.icon className={`w-8 h-8 mb-4 ${tier.featured ? 'text-sky-600' : 'text-gray-400'}`} />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                <p className={`text-lg font-semibold mb-6 ${tier.featured ? 'text-sky-600' : 'text-gray-700'}`}>{tier.price}</p>
                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${tier.featured ? 'bg-sky-500' : 'bg-gray-300'}`} />
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
