import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Layout/Footer';
import { FaPlay, FaRocket, FaVideo, FaMagic, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Homepage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [demoVideos, setDemoVideos] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState(null);

  useEffect(() => {
    fetchServices();
    fetchDemoVideos();
    fetchPaymentSettings();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (e) { /* fallback: empty array */ }
  };

  const fetchDemoVideos = async () => {
    try {
      const response = await axios.get(`${API}/demo-videos`);
      setDemoVideos(response.data);
    } catch (e) { /* fallback: empty array */ }
  };

  const fetchPaymentSettings = async () => {
    try {
      const response = await axios.get(`${API}/payment-settings`);
      setPaymentSettings(response.data);
    } catch (e) { /* fallback: null */ }
  };

  const renderVideoPlayer = (video) => {
    if (video.url && video.url.includes('yadi.sk')) {
      return (
        <a href={video.url} target="_blank" rel="noopener noreferrer" className="block relative group">
          <img src={video.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80'} alt={video.title} className="w-full h-64 object-cover rounded-lg" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg group-hover:bg-black/40 transition">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center"><FaPlay className="text-sky-600 text-xl ml-1" /></div>
          </div>
        </a>
      );
    }
    if (video.url && video.url.includes('drive.google.com')) {
      return (
        <a href={video.url} target="_blank" rel="noopener noreferrer" className="block relative group">
          <img src={video.thumbnail || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80'} alt={video.title} className="w-full h-64 object-cover rounded-lg" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-lg group-hover:bg-black/40 transition">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center"><FaPlay className="text-sky-600 text-xl ml-1" /></div>
          </div>
        </a>
      );
    }
    return (
      <video controls className="w-full h-64 rounded-lg bg-black" poster={video.thumbnail}>
        <source src={video.url} type="video/mp4" />
      </video>
    );
  };

  return (
    <div className="min-h-screen bg-white" data-testid="homepage">

      {/* ====== 1. HERO SECTION ====== */}
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
              className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 inline-flex items-center justify-center"
              data-testid="hero-cta-button"
            >
              <FaRocket className="mr-2" /> Start Your Project
            </Link>
            <a
              href="#services"
              className="bg-white/20 backdrop-blur-sm text-white border-2 border-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition inline-flex items-center justify-center"
              data-testid="hero-explore-button"
            >
              <FaPlay className="mr-2" /> Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* ====== 2. SERVICES OVERVIEW ====== */}
      <section className="py-20 px-4" id="services" data-testid="services-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Our <span className="text-ocean">Video Services</span>
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Three waves of creativity to bring your vision to life
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="card-ocean group hover:scale-105 transition-transform" data-testid={`service-card-${service.id}`}>
                <img
                  src={service.image_url}
                  alt={service.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sky-600 font-bold text-lg">From ${service.base_price}</span>
                    <Link
                      to={`/projects/new`}
                      className="text-sky-600 hover:text-sky-800 font-semibold text-sm transition"
                    >
                      Learn More &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 3. WHY CHOOSE US ====== */}
      <section className="py-20 px-4 ocean-gradient-light" data-testid="why-choose-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Why Ride the <span className="text-ocean">Ocean2Joy Wave?</span>
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            We bring expertise, creativity, and reliability to every project
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FaVideo, title: 'Professional Quality', desc: 'High-end equipment and experienced team for cinematic results' },
              { icon: FaMagic, title: 'Custom Made', desc: 'Every video tailored to your brand, message, and audience' },
              { icon: FaRocket, title: 'Digital Delivery', desc: 'Fast electronic delivery with no physical shipping hassles' },
              { icon: FaCheckCircle, title: 'Revisions Included', desc: 'We work with you until the final product is perfect' },
            ].map((item, i) => (
              <div key={i} className="text-center" data-testid={`why-card-${i}`}>
                <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <item.icon className="text-3xl text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 4. DEMO VIDEOS ====== */}
      <section className="py-20 px-4 bg-gray-50" data-testid="demo-videos-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            See Our <span className="text-ocean">Work in Action</span>
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            Watch samples of our recent video productions
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {demoVideos.length > 0 ? (
              demoVideos.map((video, idx) => (
                <div key={idx} className="card-ocean" data-testid={`demo-video-${idx}`}>
                  {renderVideoPlayer(video)}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">{video.title}</h3>
                    {video.tags && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {video.tags.map((tag, j) => (
                          <span key={j} className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="card-ocean overflow-hidden" data-testid="demo-vimeo-1">
                  <div className="relative" style={{ padding: '56.25% 0 0 0' }}>
                    <iframe
                      src="https://player.vimeo.com/video/115098447?h=0&title=0&byline=0&portrait=0"
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="Demo Video 1"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">Corporate Production</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full">Corporate</span>
                      <span className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full">Professional</span>
                    </div>
                  </div>
                </div>
                <div className="card-ocean overflow-hidden" data-testid="demo-vimeo-2">
                  <div className="relative" style={{ padding: '56.25% 0 0 0' }}>
                    <iframe
                      src="https://player.vimeo.com/video/342333493?h=0&title=0&byline=0&portrait=0"
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="Demo Video 2"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900">Creative Showcase</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full">Creative</span>
                      <span className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded-full">Showcase</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <p className="text-center text-gray-400 text-xs mt-8">
            * Demo videos are representative examples of our production capabilities
          </p>
        </div>
      </section>

      {/* ====== 5. PAYMENTS SECTION ====== */}
      <section className="py-20 px-4 bg-white" data-testid="payments-section">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Secure <span className="text-ocean">Payment Options</span>
          </h2>
          <p className="text-gray-500 text-center mb-12 max-w-2xl mx-auto">
            We accept multiple payment methods for your convenience
          </p>
          {paymentSettings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* Bank Transfer Card */}
              <div className="card-ocean p-8" data-testid="payment-bank">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                    <span className="text-sky-600 font-bold text-lg">$</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Bank Transfer</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Bank</span>
                    <span className="font-medium text-gray-900">{paymentSettings.bank_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">Beneficiary</span>
                    <span className="font-medium text-gray-900">{paymentSettings.account_holder}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">IBAN</span>
                    <span className="font-mono font-medium text-gray-900 text-xs">{paymentSettings.iban}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-500">SWIFT</span>
                    <span className="font-mono font-medium text-gray-900">{paymentSettings.swift}</span>
                  </div>
                  {paymentSettings.intermediary_bank && (
                    <>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Intermediary Bank</span>
                        <span className="font-medium text-gray-900 text-right text-xs">{paymentSettings.intermediary_bank}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Intermediary SWIFT</span>
                        <span className="font-mono font-medium text-gray-900">{paymentSettings.intermediary_swift}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* PayPal Card */}
              <div className="card-ocean p-8" data-testid="payment-paypal">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">P</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">PayPal</h3>
                </div>
                <p className="text-gray-500 text-sm mb-4">Send payment to:</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="font-mono text-sky-600 font-medium">{paymentSettings.paypal_email}</p>
                </div>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>1. Log in to your PayPal account</p>
                  <p>2. Select "Send Money"</p>
                  <p>3. Enter the email address above</p>
                  <p>4. Specify the invoice amount in USD</p>
                  <p>5. Add your project number in the note</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-gray-400 text-sm mt-4">Loading payment information...</p>
            </div>
          )}

          {/* How Payment Works */}
          <div className="bg-gray-50 rounded-xl p-8 max-w-3xl mx-auto" data-testid="payment-info">
            <h3 className="text-lg font-bold text-gray-900 text-center mb-6">How Payment Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-sm">
              <div>
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-sky-600 font-bold">1</span>
                </div>
                <p className="text-gray-700 font-medium">Receive Invoice</p>
                <p className="text-gray-400 text-xs mt-1">We send you a detailed invoice</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-sky-600 font-bold">2</span>
                </div>
                <p className="text-gray-700 font-medium">Make Payment</p>
                <p className="text-gray-400 text-xs mt-1">Choose bank transfer or PayPal</p>
              </div>
              <div>
                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-sky-600 font-bold">3</span>
                </div>
                <p className="text-gray-700 font-medium">Confirmation</p>
                <p className="text-gray-400 text-xs mt-1">We confirm and begin production</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 6. CTA SECTION ====== */}
      <section className="py-20 px-4 ocean-gradient text-white" data-testid="cta-section">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Make Waves?</h2>
          <p className="text-xl text-sky-100 mb-8">
            Start your video project today and let us bring your vision to life
          </p>
          <Link
            to={user && user.id ? "/projects/new" : "/register"}
            className="bg-yellow-400 text-gray-900 px-10 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105 inline-flex items-center justify-center"
            data-testid="cta-button"
          >
            <FaRocket className="mr-2" /> Get Started Now
          </Link>
          <p className="mt-6 text-sky-200 text-sm">
            Or <Link to="/login" className="underline hover:text-white">contact us</Link> to discuss your project first
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
