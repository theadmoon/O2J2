import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Layout/Footer';
import { FaPlay, FaRocket, FaVideo, FaMagic, FaCheckCircle, FaComments } from 'react-icons/fa';
import axios from 'axios';
import useSeo from '../hooks/useSeo';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Homepage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [demoVideos, setDemoVideos] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);

  useSeo({
    title: 'Ocean2Joy — Digital Video Production Studio',
    description:
      'Digital video production studio. Live-action with actors, cinematic VFX and AI-generated video. Pay only after you accept the final result.',
    path: '/',
  });

  useEffect(() => {
    fetchServices();
    fetchDemoVideos();
    fetchPaymentSettings();
  }, []);

  // --- SEO: emit VideoObject JSON-LD so demo reels appear in Google Video search.
  useEffect(() => {
    if (!demoVideos || demoVideos.length === 0) return;
    const origin = (typeof window !== 'undefined' && window.location.origin) || '';
    const toAbs = (rel) => {
      if (!rel) return '';
      if (/^https?:\/\//i.test(rel)) return rel;
      // Backend-streamed uploads go through the same origin in production
      // (reverse-proxied under /api). Frontend-static paths (/videos, /posters)
      // are also served from the same origin.
      return `${origin}${rel.startsWith('/') ? '' : '/'}${rel}`;
    };
    const fallbackIso = new Date().toISOString();
    const data = demoVideos.map((v) => ({
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: v.title,
      description: v.description,
      thumbnailUrl: toAbs(v.thumbnail_url),
      contentUrl: toAbs(v.video_url),
      // Google requires ISO 8601 with timezone. `created_at` from the API is a full
      // UTC ISO string (e.g. "2026-04-22T09:23:48.432101+00:00") — pass it through.
      uploadDate: v.created_at || fallbackIso,
      publisher: {
        '@type': 'Organization',
        name: 'Ocean2Joy',
        logo: {
          '@type': 'ImageObject',
          url: `${origin}/logo-vertical.png`,
        },
      },
    }));
    const elId = 'ocean2joy-videoobject-ld';
    let script = document.getElementById(elId);
    if (!script) {
      script = document.createElement('script');
      script.id = elId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data.length === 1 ? data[0] : data);
    return () => {
      const s = document.getElementById(elId);
      if (s) s.remove();
    };
  }, [demoVideos]);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (e) { /* fallback */ }
  };

  const fetchDemoVideos = async () => {
    try {
      const response = await axios.get(`${API}/demo-videos`);
      setDemoVideos(response.data);
    } catch (e) { /* fallback */ }
  };

  const fetchPaymentSettings = async () => {
    try {
      const response = await axios.get(`${API}/payment-settings`);
      setPaymentSettings(response.data);
    } catch (e) { /* fallback */ }
  };

  const renderVideoPlayer = (video) => {
    const toFullUrl = (url) => {
      if (!url) return null;
      if (/^https?:\/\//i.test(url)) return url;
      // Backend-served paths (streaming or legacy uploads) need the API host.
      // Frontend-static paths (/videos/, /posters/) stay relative.
      if (url.startsWith('/api/') || url.startsWith('/uploads/')) return `${BACKEND_URL}${url}`;
      return url;
    };
    const fullThumbnailUrl = toFullUrl(video.thumbnail_url);
    const fullVideoUrl = toFullUrl(video.video_url);

    if (video.video_type === 'url') {
      if (video.video_url.includes('disk.yandex') || video.video_url.includes('drive.google')) {
        const platform = video.video_url.includes('disk.yandex') ? 'Яндекс.Диск' : 'Google Drive';
        return (
          <div className="relative cursor-pointer group aspect-video bg-gray-900 rounded-lg overflow-hidden" onClick={() => window.open(video.video_url, '_blank')}>
            {fullThumbnailUrl && <img src={fullThumbnailUrl} alt={video.title} className="w-full h-full object-cover" />}
            {!fullThumbnailUrl && <div className="w-full h-full bg-gradient-to-br from-sky-900 to-teal-900" />}
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center group-hover:bg-black/50 transition">
              <span className="text-4xl mb-2">🎥</span>
              <p className="text-white font-semibold">Watch on {platform}</p>
              <p className="text-sky-300 text-sm mt-1">Open Video→</p>
            </div>
          </div>
        );
      }
      return (
        <video controls className="w-full aspect-video rounded-lg bg-black" poster={fullThumbnailUrl}>
          <source src={fullVideoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    return (
      <video controls className="w-full aspect-video rounded-lg bg-black" poster={fullThumbnailUrl}>
        <source src={fullVideoUrl || `${BACKEND_URL}${video.video_url}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section
        className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(14, 165, 233, 0.85), rgba(20, 184, 166, 0.85)), url('https://images.unsplash.com/photo-1599622465858-a0b63fdc9b80?auto=format&fit=crop&w=1920&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Animated waves overlay */}
        <div className="absolute inset-0 opacity-30">
          <svg className="absolute bottom-0 w-full animate-wave" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
            <path fill="#ffffff" fillOpacity="0.3" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-float">
            Dive Into an <span className="text-yellow-300">Ocean</span> of Video Possibilities
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-sky-50">
            Live-action with actors, cinematic VFX and AI-generated video — all delivered digitally. Pay only after you accept the final result.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/request" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 inline-flex items-center justify-center">
              <FaRocket className="mr-2" />
              Start Your Project
            </Link>
            <Link to="/services" className="bg-white/20 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition inline-flex items-center justify-center">
              <FaPlay className="mr-2" />
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-ocean">Video Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three waves of creativity to bring your vision to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {services.map((service, index) => (
              <div
                key={service.id || index}
                className="card-ocean group hover:scale-105 transition-transform duration-300 flex flex-col h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-sky-600 transition">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="mb-4 mt-auto">
                    <span className="text-2xl font-bold text-sky-600">
                      {service.pricing_model === 'per_minute' ? `From $${service.base_price}/min` : service.pricing_model === 'custom' ? `From $${service.base_price}/min` : `From $${service.base_price}`}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">{service.price_description}</p>
                  </div>
                  <Link
                    to={`/services/${service.id}`}
                    className="inline-block w-full text-center bg-gradient-to-r from-sky-500 to-teal-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-sky-600 hover:to-teal-600 transition"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 ocean-gradient-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Ride the <span className="text-ocean">Ocean2joy Wave?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaVideo className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Quality</h3>
              <p className="text-gray-600">High-end equipment and experienced team for stunning results</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaMagic className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Custom Made</h3>
              <p className="text-gray-600">Every project tailored to your specific vision and needs</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaRocket className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Digital Delivery</h3>
              <p className="text-gray-600">Fast electronic delivery through secure client portal</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <FaCheckCircle className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Revisions Included</h3>
              <p className="text-gray-600">Multiple revision rounds to ensure your satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Videos Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              See Our <span className="text-ocean">Work in Action</span>
            </h2>
            <p className="text-xl text-gray-600">Sample projects that showcase our capabilities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {demoVideos.length > 0 ? (
              demoVideos.map((video) => (
                <div key={video.id || video.title} className="card-ocean">
                  <div className="aspect-video bg-gray-900 relative overflow-hidden">
                    {renderVideoPlayer(video)}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
                    <p className="text-gray-600">{video.description}</p>
                    {video.tags && video.tags.length > 0 && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {video.tags.map((tag, idx) => {
                          const palette = [
                            'bg-sky-100 text-sky-800',
                            'bg-teal-100 text-teal-800',
                            'bg-purple-100 text-purple-800',
                          ];
                          return (
                            <span key={tag} className={`${palette[idx % palette.length]} text-xs px-2 py-1 rounded`}>{tag}</span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <>
                {/* Demo Video 1 - Custom Production */}
                <div className="card-ocean">
                  <div className="aspect-video bg-gray-900 relative overflow-hidden">
                    <iframe
                      src="https://player.vimeo.com/video/115098447?background=1&autoplay=0&loop=0&byline=0&title=0"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="Custom Video Production Demo"
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Professional Custom Video</h3>
                    <p className="text-gray-600">Example of our custom video production with professional actors and crew</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded">Drama</span>
                      <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">Professional</span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">HD Quality</span>
                    </div>
                  </div>
                </div>
                {/* Demo Video 2 - AI Generated / Tech Demo */}
                <div className="card-ocean">
                  <div className="aspect-video bg-gray-900 relative overflow-hidden">
                    <iframe
                      src="https://player.vimeo.com/video/342333493?background=1&autoplay=0&loop=0&byline=0&title=0"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="AI-Generated Video Demo"
                    ></iframe>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">AI-Powered Creation</h3>
                    <p className="text-gray-600">Example of our cutting-edge AI-generated video content with digital effects</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded">AI Tech</span>
                      <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded">Innovative</span>
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Digital</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Note about demo videos */}
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 italic">
              * Demo videos are representative examples. Your custom project will be created specifically for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* Questions-first / Consultation Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-sky-50 via-white to-teal-50 border-y border-sky-100" data-testid="consultation-section">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3">
              <p className="text-xs uppercase tracking-[0.2em] font-bold text-sky-600 mb-3">Have questions first?</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-5 leading-tight">
                Not sure yet? <span className="text-ocean">Chat with us</span> — get a quick answer.
              </h2>
              <p className="text-gray-600 text-base leading-relaxed mb-5">
                You do not need a finished script or a completed brief to begin.
                <strong className="text-gray-900"> Start a project with a short request</strong>, and the project chat inside the portal will open immediately. You can ask preliminary questions there before moving deeper into the workflow.
              </p>
              <ul className="space-y-2.5 mb-7">
                <li className="flex items-start gap-2.5 text-sm text-gray-700">
                  <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>A short idea is enough to open the workspace.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-700">
                  <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>Scripts, references, mood boards, and supporting files can be uploaded later inside the portal.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-700">
                  <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>The portal chat is the primary channel for preliminary questions, project communication, and document workflow.</span>
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-700">
                  <FaCheckCircle className="text-emerald-500 mt-0.5 shrink-0" />
                  <span>No payment is required to open the workspace and ask preliminary questions.</span>
                </li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/start"
                  className="bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white px-6 py-3 rounded-lg font-bold text-sm shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition inline-flex items-center gap-2"
                  data-testid="cta-start-consultation"
                >
                  <FaComments />
                  Chat with us — get a quick answer
                </Link>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-400 to-teal-400 rounded-2xl opacity-10 blur-2xl" />
                <div className="relative bg-white border-2 border-sky-100 rounded-2xl shadow-xl p-5 space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">O2J</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Project chat</p>
                      <p className="text-[10px] text-emerald-600">● Manager online</p>
                    </div>
                  </div>
                  <div className="bg-sky-50 rounded-xl rounded-tl-sm px-3 py-2 text-xs text-gray-800 max-w-[85%]">
                    Hi! Can you do a 30-second clip for my café opening?
                  </div>
                  <div className="bg-gradient-to-br from-sky-500 to-teal-500 text-white rounded-xl rounded-tr-sm px-3 py-2 text-xs max-w-[85%] ml-auto">
                    Absolutely — tell us your date, location and any reference videos you like. No script needed to start.
                  </div>
                  <div className="bg-sky-50 rounded-xl rounded-tl-sm px-3 py-2 text-xs text-gray-800 max-w-[85%]">
                    Great, here's a link to a similar vibe.
                  </div>
                  <p className="text-[10px] text-gray-400 text-center italic pt-1">Example preview — the actual project chat opens after you create a project in the portal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payments Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Payments
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Payment systems are currently not integrated into the portal. Payments are processed in semi-manual mode.
              Payment details are made available inside the project portal as part of the formal project workflow.
            </p>
          </div>
          {paymentSettings ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8" data-testid="payment-methods-grid">
              {(paymentSettings.methods || []).map((m) => {
                const ICONS = {
                  paypal: { emoji: '💳', gradient: 'from-blue-500 to-blue-600', accent: 'border-blue-100' },
                  bank_transfer: { emoji: '🏦', gradient: 'from-sky-400 to-teal-400', accent: 'border-sky-100' },
                  crypto: { emoji: '₮', gradient: 'from-emerald-500 to-green-600', accent: 'border-emerald-100' },
                };
                const ic = ICONS[m.code] || ICONS.paypal;
                return (
                  <div key={m.code} className={`bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 border-2 ${ic.accent}`} data-testid={`payment-method-card-${m.code}`}>
                    <div className="flex items-center justify-center mb-3">
                      <div className={`w-14 h-14 bg-gradient-to-br ${ic.gradient} rounded-full flex items-center justify-center`}>
                        <span className="text-2xl text-white">{ic.emoji}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-center text-gray-900">{m.label}</h3>
                    <p className="text-sm text-gray-600 text-center mt-1.5 leading-snug">{m.description}</p>
                    {m.public_account && (
                      <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                        <p className="text-[10px] uppercase tracking-wider text-gray-400">{m.public_account_label}</p>
                        <p className="text-xs font-mono text-gray-700 break-all mt-0.5">{m.public_account}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 text-sm mt-4">Loading payment information...</p>
            </div>
          )}

          {paymentSettings && (
            <div className="text-center mb-8 text-sm text-gray-600">
              Accepted currency: <strong>{paymentSettings.currency}</strong> · Beneficiary: <strong>{paymentSettings.beneficiary}</strong>
              <p className="text-xs text-gray-500 mt-1">{paymentSettings.note}</p>
            </div>
          )}

          {/* How Payment Works */}
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 border-l-4 border-sky-500">
            <div className="flex items-start gap-4">
              <div className="text-3xl">ℹ️</div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">How Payment Works</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  After your order is activated, payment details are made available inside your project portal.
                  The project then proceeds through invoice signature, production, electronic delivery, and client acceptance inside the portal workflow.
                  Once the client accepts the completed work, the client transfers payment using the selected payment channel and reports the payment inside the portal by providing the transaction reference.
                  Our team then verifies the payment and records the confirmation in the system.
                  Project documents are issued throughout the project lifecycle and remain available inside the portal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 ocean-gradient text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make Waves?
          </h2>
          <p className="text-xl mb-8 text-sky-50">
            Start your video project today. Quick request form takes less than 2 minutes.
          </p>
          <Link
            to="/request"
            className="inline-block bg-yellow-400 text-gray-900 px-10 py-4 rounded-lg font-bold text-xl hover:bg-yellow-300 transition shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105"
          >
            Get Started Now
          </Link>
          <p className="mt-6 text-sky-100 text-sm">
            Or <Link to="/contact" className="underline hover:text-white">contact us</Link> to discuss your project
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
