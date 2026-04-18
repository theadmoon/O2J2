import { useState } from 'react';
import axios from 'axios';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await axios.post(`${API}/contact`, formData);
      setStatus({ 
        type: 'success', 
        message: 'Thank you for contacting us! We\'ll get back to you within 24 hours.' 
      });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: 'Failed to send message. Please try again or email us directly.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Get in <span className="text-ocean">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about our video production services? We're here to help bring your vision to life.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="card-ocean p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            
            {status.message && (
              <div className={`p-4 rounded-lg mb-6 ${
                status.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Project inquiry"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Tell us about your project..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-ocean flex items-center justify-center"
              >
                {loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="card-ocean p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <FaEnvelope className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href="mailto:ocean2joy@gmail.com" className="text-sky-600 hover:text-sky-700">
                      ocean2joy@gmail.com
                    </a>
                    <p className="text-sm text-gray-600 mt-1">Response within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <FaPhone className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-700">+995 555 375 032</p>
                    <p className="text-sm text-gray-600 mt-1">Mon-Fri, 9AM-6PM (Georgia Time)</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                    <FaMapMarkerAlt className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Digital Service</h3>
                    <p className="text-gray-700">We operate 100% digitally</p>
                    <p className="text-sm text-gray-600 mt-1">Electronic delivery worldwide</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card-ocean p-8 bg-gradient-to-br from-sky-50 to-teal-50">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/request" className="text-sky-600 hover:text-sky-700 font-medium">
                    → Start a Project (Quick Form)
                  </a>
                </li>
                <li>
                  <a href="/services" className="text-sky-600 hover:text-sky-700 font-medium">
                    → View All Services
                  </a>
                </li>
                <li>
                  <a href="/how-it-works" className="text-sky-600 hover:text-sky-700 font-medium">
                    → How Our Process Works
                  </a>
                </li>
                <li>
                  <a href="/policies/terms" className="text-sky-600 hover:text-sky-700 font-medium">
                    → Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <div className="card-ocean p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Business Hours</h3>
              <div className="space-y-2 text-gray-700">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span className="font-semibold">9:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span className="font-semibold">10:00 AM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span className="font-semibold">Closed</span>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  * Support available via email 24/7. We respond within 24 hours.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <strong>Legal Entity:</strong> Individual Entrepreneur Vera Iambaeva<br/>
                    Tax ID: 302335809 | Registered in Georgia<br/>
                    Brand: Ocean2Joy Digital Video Production
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
