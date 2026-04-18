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
    const getThumbnailUrl = (thumbnailUrl) => {
      if (!thumbnailUrl) return null;
      if (thumbnailUrl.startsWith('/uploads/')) return `${BACKEND_URL}${thumbnailUrl}`;
      return thumbnailUrl;
    };
    const fullThumbnailUrl = getThumbnailUrl(video.thumbnail_url);

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
          <source src={video.video_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
    return (
      <video controls className="w-full aspect-video rounded-lg bg-black" poster={fullThumbnailUrl}>
        <source src={`${BACKEND_URL}${video.video_url}`} type="video/mp4" />
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
            Professional video production services delivered digitally. From custom filming to AI-powered content.
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={service.id || index}
                className="card-ocean group hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
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
                      {service.pricing_model === 'per_minute' ? `$${service.base_price}/min` : `From $${service.base_price}`}
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
                        {video.tags.map((tag, idx) => (
                          <span key={idx} className="bg-sky-100 text-sky-800 text-xs px-2 py-1 rounded">{tag}</span>
                        ))}
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

      {/* Payments Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
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
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-sky-100">
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
                    <p className="text-gray-900">{paymentSettings.bank_transfer.beneficiary_bank_name}</p>
                    <p className="text-gray-600 text-xs">{paymentSettings.bank_transfer.beneficiary_bank_location}</p>
                    <p className="text-gray-600 text-xs">SWIFT: {paymentSettings.bank_transfer.beneficiary_bank_swift}</p>
                  </div>
                  <div className="border-t border-sky-200 pt-2">
                    <p className="font-semibold text-gray-700">IBAN:</p>
                    <p className="text-gray-900 font-mono text-base break-all">{paymentSettings.bank_transfer.beneficiary_iban}</p>
                  </div>
                  <div className="border-t border-sky-200 pt-2">
                    <p className="font-semibold text-gray-700">Beneficiary:</p>
                    <p className="text-gray-900">{paymentSettings.bank_transfer.beneficiary_name}</p>
                  </div>
                  <div className="border-t border-sky-200 pt-2">
                    <p className="font-semibold text-gray-700 mb-1">Intermediary Banks:</p>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>1. {paymentSettings.bank_transfer.intermediary_bank_1.name}</p>
                      <p className="ml-3">SWIFT: {paymentSettings.bank_transfer.intermediary_bank_1.swift}</p>
                      <p>2. {paymentSettings.bank_transfer.intermediary_bank_2.name}</p>
                      <p className="ml-3">SWIFT: {paymentSettings.bank_transfer.intermediary_bank_2.swift}</p>
                    </div>
                  </div>
                </div>
                {paymentSettings.bank_transfer.qr_code_url && (
                  <div className="text-center">
                    <a href={`${BACKEND_URL}${paymentSettings.bank_transfer.qr_code_url}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition text-sm font-semibold">
                      📱 View QR Code
                    </a>
                  </div>
                )}
              </div>

              {/* PayPal Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
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
                      <li>✓ Include your project reference number</li>
                      <li>✓ Add invoice number in payment notes</li>
                      <li>✓ Mark payment as completed in your portal</li>
                      <li>✓ Production starts after confirmation</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-xs text-blue-900">
                  <p className="font-semibold mb-1">💡 Quick & Easy</p>
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
          <div className="mt-8 bg-white rounded-xl shadow-md p-6 border-l-4 border-sky-500">
            <div className="flex items-start gap-4">
              <div className="text-3xl">ℹ️</div>
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
