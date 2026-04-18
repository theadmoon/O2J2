import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaRocket, FaCheckCircle } from 'react-icons/fa';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function QuickRequest() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_type: '',
    brief_description: '',
    deadline: '',
    payment_method: 'paypal'
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, service_type: response.data[0].type }));
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(`${API}/quick-request`, formData);
      setStatus({ 
        type: 'success', 
        message: response.data.message,
        requestId: response.data.request_id
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service_type: services[0]?.type || '',
        brief_description: '',
        deadline: '',
        payment_method: 'paypal'
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus({ 
        type: 'error', 
        message: error.response?.data?.detail || 'Failed to submit request. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quick-request-page py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Start Your <span className="text-ocean">Video Project</span>
          </h1>
          <p className="text-xl text-gray-600">
            Quick request form - takes less than 2 minutes. We'll send you a custom quote within 24 hours.
          </p>
        </div>

        {status.type === 'success' ? (
          <div className="card-ocean p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCheckCircle className="text-4xl text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Request Submitted!</h2>
            <p className="text-xl text-gray-600 mb-2">{status.message}</p>
            <p className="text-gray-600 mb-8">
              Redirecting you to login page where you can track your project...
            </p>
            <p className="text-sm text-gray-500">
              Request ID: <span className="font-mono font-semibold">{status.requestId}</span>
            </p>
          </div>
        ) : (
          <div className="card-ocean p-8 md:p-12">
            {status.type === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
                {status.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Info */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Your Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
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
                </div>

                <div className="mt-6">
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Project Details</h3>
                
                <div className="mb-6">
                  <label htmlFor="service_type" className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    {services.map(service => (
                      <option key={service.id} value={service.type}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label htmlFor="brief_description" className="block text-sm font-semibold text-gray-700 mb-2">
                    Brief Description of Your Project *
                  </label>
                  <textarea
                    id="brief_description"
                    name="brief_description"
                    value={formData.brief_description}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="Describe what you need: video type, duration, style, purpose, target audience, etc."
                  ></textarea>
                  <p className="text-sm text-gray-500 mt-2">
                    The more details you provide, the more accurate our quote will be.
                  </p>
                </div>

                <div>
                  <label htmlFor="deadline" className="block text-sm font-semibold text-gray-700 mb-2">
                    Deadline Preference (Optional)
                  </label>
                  <input
                    type="text"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    placeholder="e.g., 2 weeks, by end of March"
                  />
                </div>

                {/* Payment Method Selection */}
                <div className="mt-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    💳 Preferred Payment Method *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-sky-50 transition-colors"
                      style={{ borderColor: formData.payment_method === 'paypal' ? '#0ea5e9' : '#d1d5db' }}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="paypal"
                        checked={formData.payment_method === 'paypal'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">💳 PayPal</p>
                        <p className="text-xs text-gray-600">Quick and secure online payment</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-sky-50 transition-colors"
                      style={{ borderColor: formData.payment_method === 'swift' ? '#0ea5e9' : '#d1d5db' }}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="swift"
                        checked={formData.payment_method === 'swift'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">🏦 SWIFT Transfer</p>
                        <p className="text-xs text-gray-600">International bank transfer (USD)</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-sky-50 transition-colors"
                      style={{ borderColor: formData.payment_method === 'qr_code' ? '#0ea5e9' : '#d1d5db' }}>
                      <input
                        type="radio"
                        name="payment_method"
                        value="qr_code"
                        checked={formData.payment_method === 'qr_code'}
                        onChange={handleChange}
                        className="mr-3"
                      />
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">📱 QR Code</p>
                        <p className="text-xs text-gray-600">Instant local payment (GEL)</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Info Notice */}
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                <h4 className="font-semibold text-sky-900 mb-2">What Happens Next?</h4>
                <ul className="text-sm text-sky-800 space-y-1">
                  <li>• We'll create an account for you automatically</li>
                  <li>• You'll receive a custom quote within 24 hours via email</li>
                  <li>• Login to your portal to view project details and communicate with our team</li>
                  <li>• All deliverables will be available electronically in your secure client portal</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-ocean text-lg py-4 flex items-center justify-center"
              >
                {loading ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <FaRocket className="mr-2" />
                    Submit Request & Get Quote
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account? <a href="/login" className="text-sky-600 hover:text-sky-700 font-semibold">Login here</a>
              </p>
            </form>
          </div>
        )}

        {/* Additional Info */}
        {status.type !== 'success' && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Submit Request</h3>
              <p className="text-sm text-gray-600">Fill out this quick form with your project details</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Quote</h3>
              <p className="text-sm text-gray-600">Receive custom quote within 24 hours</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Production Starts</h3>
              <p className="text-sm text-gray-600">Approve quote and we begin creating your video</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuickRequest;
