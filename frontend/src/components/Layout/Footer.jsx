import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone } from 'react-icons/fa';
import Logo from './Logo';

function Footer() {
  return (
    <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="relative -mt-10 -ml-12 -mb-8">
              <Logo variant="vertical" className="max-h-64 w-auto" style={{ objectFit: 'contain', display: 'block' }} />
            </div>
            <p className="text-gray-400 text-base mb-6 max-w-xs leading-relaxed mt-6">
              Where video dreams come true. Professional video production services delivered digitally.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-base">
              <li>
                <Link to="/services" className="text-gray-400 hover:text-sky-400 transition">
                  All Services
                </Link>
              </li>
              <li>
                <Link to="/services/custom-video" className="text-gray-400 hover:text-sky-400 transition">
                  Custom Video Production
                </Link>
              </li>
              <li>
                <Link to="/services/video-editing" className="text-gray-400 hover:text-sky-400 transition">
                  Video Editing
                </Link>
              </li>
              <li>
                <Link to="/services/ai-video" className="text-gray-400 hover:text-sky-400 transition">
                  AI-Generated Videos
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-base">
              <li>
                <Link to="/how-it-works" className="text-gray-400 hover:text-sky-400 transition">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-sky-400 transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="text-gray-400 hover:text-sky-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="text-gray-400 hover:text-sky-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-gray-400 hover:text-sky-400 transition">
                  Legal Information
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Policies</h3>
            <ul className="space-y-2 text-base">
              <li>
                <Link to="/policies/digital_delivery" className="text-gray-400 hover:text-sky-400 transition">
                  Digital Delivery
                </Link>
              </li>
              <li>
                <Link to="/policies/refund" className="text-gray-400 hover:text-sky-400 transition">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/revision" className="text-gray-400 hover:text-sky-400 transition">
                  Revision Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p className="mb-3">&copy; 2025-2026 Ocean2Joy Digital Video Production</p>
          <p className="text-xs mb-2">
            Individual Entrepreneur Vera Iambaeva | Tax ID: 302335809 | Georgia
          </p>
          <p className="text-xs mb-3">
            <FaEnvelope className="inline mr-1" />
            ocean2joy@gmail.com | 
            <FaPhone className="inline mx-2" />
            +995 555 375 032
          </p>
          <p className="text-xs text-gray-500 mb-1">
            Primary project communication takes place inside the secure client portal. Email is used only as an emergency fallback channel.
          </p>
          <p className="text-xs text-gray-500">
            Digital video production services are delivered electronically. No physical products are shipped.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
