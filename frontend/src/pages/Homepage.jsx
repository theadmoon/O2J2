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
    if (video.url && video.url.includes('yadi.sk')) {
      return (
        <a href={video.url} target="_blank" rel="noopener noreferrer" className="block relative group">
          <img src={video.thumbnail || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80'} alt={video.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center"><FaPlay className="text-sky-600 text-xl ml-1" /></div>
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">Open Video</div>
        </a>
      );
    }
    if (video.url && video.url.includes('drive.google.com')) {
      return (
        <a href={video.url} target="_blank" rel="noopener noreferrer" className="block relative group">
          <img src={video.thumbnail || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80'} alt={video.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center"><FaPlay className="text-sky-600 text-xl ml-1" /></div>
          </div>
          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">Open Video</div>
        </a>
      );
    }
    return (
      <video controls className="w-full h-full object-cover" poster={video.thumbnail}>
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
            Dive Into an <span className="text-yellow-400">Ocean</span> of Video Possibilities
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
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Our <span className="text-ocean">Video Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three waves of creativity to bring your vision to life
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="card-ocean group hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${services.indexOf(service) * 100}ms` }}
                data-testid={`service-card-${service.id}`}
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={service.image_url}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-sky-600 transition">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-sky-600">
                      {service.pricing_model === 'per_minute'
                        ? `$${service.base_price}/min`
                        : `From $${service.base_price}`}
                    </span>
                    {service.price_description && (
                      <p className="text-sm text-gray-500 mt-1">{service.price_description}</p>
                    )}
                  </div>
                  <Link
                    to={`/services/${service.id}`}
                    className="inline-flex items-center justify-center gap-2 w-full text-center bg-sky-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-sky-700 transition-all duration-200 shadow-md hover:shadow-lg group"
                  >
                    Learn More
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 3. WHY CHOOSE US ====== */}
      <section className="py-20 px-4 ocean-gradient-light" id="how-it-works" data-testid="why-choose-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why Ride the <span className="text-ocean">Ocean2Joy Wave?</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: FaVideo, title: 'Professional Quality', desc: 'High-end equipment and experienced team for stunning results' },
              { icon: FaMagic, title: 'Custom Made', desc: 'Every video tailored to your brand, message, and audience' },
              { icon: FaRocket, title: 'Digital Delivery', desc: 'Fast electronic delivery with no physical shipping hassles' },
              { icon: FaCheckCircle, title: 'Revisions Included', desc: 'We work with you until the final product is perfect' },
            ].map((item, i) => (
              <div key={i} className="text-center" data-testid={`why-card-${i}`}>
                <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <item.icon className="text-3xl text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== 4. DEMO VIDEOS ====== */}
      <section className="py-20 px-4" id="demo-videos" data-testid="demo-videos-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              See Our <span className="text-ocean">Work in Action</span>
            </h2>
            <p className="text-xl text-gray-600">Sample projects that showcase our capabilities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {demoVideos.length > 0 ? (
              demoVideos.map((video, idx) => (
                <div key={idx} className="card-ocean" data-testid={`demo-video-${idx}`}>
                  <div className="aspect-video bg-gray-900 relative overflow-hidden">
                    {renderVideoPlayer(video)}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{video.title}</h3>
                    <p className="text-gray-600">{video.description}</p>
                    {video.tags && (
                      <div className="mt-3 flex items-center gap-2">
                        {video.tags.map((tag, j) => (
                          <span key={j} className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="card-ocean" data-testid="demo-vimeo-1">
                  <div className="aspect-video bg-gray-900 relative overflow-hidden">
                    <iframe
                      src="https://player.vimeo.com/video/824804225?background=1&autoplay=0&loop=0&byline=0&title=0"
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
                <div className="card-ocean" data-testid="demo-vimeo-2">
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
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500 italic">
              * Demo videos are representative examples. Your custom project will be created specifically for your needs.
            </p>
          </div>
        </div>
      </section>

      {/* ====== 5. PAYMENTS SECTION ====== */}
      <section className="py-20 px-4 bg-gray-50" data-testid="payments-section">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Payments
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Payment systems are currently not integrated. Payments are processed in semi-manual mode.
              Once you confirm your order, you'll receive payment details directly in your project portal.
            </p>
          </div>
          {paymentSettings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Bank Transfer Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-sky-100" data-testid="payment-bank">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center">
                    <span className="text-3xl">🏦</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">
                  Bank Transfer (SWIFT)
                </h3>
                <div className="bg-sky-50 rounded-lg p-4 mb-4 text-sm space-y-3">
                  <div>
                    <p className="font-semibold text-gray-700">Beneficiary Bank:</p>
                    <p className="text-gray-900">{paymentSettings.bank_name}</p>
                    <p className="text-gray-600 text-xs">{paymentSettings.bank_location}</p>
                    <p className="text-gray-600 text-xs">SWIFT: {paymentSettings.swift}</p>
                  </div>
                  <div className="border-t border-sky-200 pt-2">
                    <p className="font-semibold text-gray-700">IBAN:</p>
                    <p className="text-gray-900 font-mono text-base break-all">{paymentSettings.iban}</p>
                  </div>
                  <div className="border-t border-sky-200 pt-2">
                    <p className="font-semibold text-gray-700">Beneficiary:</p>
                    <p className="text-gray-900">{paymentSettings.beneficiary}</p>
                  </div>
                  {paymentSettings.intermediary_bank && (
                    <div className="border-t border-sky-200 pt-2">
                      <p className="font-semibold text-gray-700 mb-1">Intermediary Banks:</p>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>1. {paymentSettings.intermediary_bank}</p>
                        <p className="ml-3">SWIFT: {paymentSettings.intermediary_swift}</p>
                        {paymentSettings.intermediary_bank_2 && (
                          <>
                            <p>2. {paymentSettings.intermediary_bank_2}</p>
                            <p className="ml-3">SWIFT: {paymentSettings.intermediary_swift_2}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {paymentSettings.qr_code_url && (
                  <div className="text-center">
                    <a href={`${BACKEND_URL}${paymentSettings.qr_code_url}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition text-sm font-semibold">
                      View QR Code
                    </a>
                  </div>
                )}
              </div>

              {/* PayPal Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100" data-testid="payment-paypal">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-3xl">💳</span>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-4">PayPal</h3>
                <div className="bg-blue-50 rounded-lg p-4 mb-4 text-sm space-y-3">
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Send payment to:</p>
                    <p className="text-gray-900 font-mono text-base break-all bg-white px-3 py-2 rounded border border-blue-200">
                      {paymentSettings.paypal_email}
                    </p>
                  </div>
                  <div className="border-t border-blue-200 pt-3">
                    <p className="font-semibold text-gray-700 mb-2">Instructions:</p>
                    <ul className="space-y-1 text-gray-700 text-xs">
                      <li>&#10003; Include your project reference number</li>
                      <li>&#10003; Add invoice number in payment notes</li>
                      <li>&#10003; Mark payment as completed in your portal</li>
                      <li>&#10003; Production starts after confirmation</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-xs text-blue-900">
                  <p className="font-semibold mb-1">Quick & Easy</p>
                  <p>PayPal payments are typically confirmed faster than bank transfers.</p>
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
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 border-l-4 border-sky-500" data-testid="payment-info">
            <div className="flex items-start gap-4">
              <div className="text-3xl">&#8505;&#65039;</div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">How Payment Works</h4>
                <p className="text-gray-700 text-sm leading-relaxed">
                  After you accept our quote, you'll receive complete payment details in your client dashboard.
                  Simply copy the payment information, make the transfer using your preferred method, and mark it as paid in your portal.
                  We'll verify the payment and immediately start production. You'll receive transaction documents (Invoice, Receipt, Certificate) at each stage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== 6. CTA SECTION ====== */}
      <section className="py-20 px-4 ocean-gradient text-white" data-testid="cta-section">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make Waves?
          </h2>
          <p className="text-xl mb-8 text-sky-50">
            Start your video project today. Quick request form takes less than 2 minutes.
          </p>
          <Link
            to={user && user.id ? "/projects/new" : "/register"}
            className="inline-block bg-yellow-400 text-gray-900 px-10 py-4 rounded-lg font-bold text-xl hover:bg-yellow-300 transition shadow-2xl hover:shadow-yellow-400/50 transform hover:scale-105"
            data-testid="cta-button"
          >
            Get Started Now
          </Link>
          <p className="mt-6 text-sky-100 text-sm">
            Or <Link to="/login" className="underline hover:text-white">contact us</Link> to discuss your project
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
