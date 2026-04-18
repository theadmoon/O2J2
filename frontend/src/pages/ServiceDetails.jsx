import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaClock, FaSync, FaDownload, FaRocket } from 'react-icons/fa';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function ServiceDetails() {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServiceDetails();
  }, [serviceId]);

  const fetchServiceDetails = async () => {
    try {
      const response = await axios.get(`${API}/services/${serviceId}`);
      setService(response.data);
    } catch (error) {
      console.error('Error fetching service details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-sky-600">Loading...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Service not found</h2>
          <Link to="/services" className="btn-ocean">Back to Services</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="service-details-page py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link to="/services" className="text-sky-600 hover:text-sky-700 font-semibold mb-4 inline-block">
            ← Back to All Services
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {service.title}
          </h1>
          <p className="text-xl text-gray-600">
            {service.description}
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-12 rounded-2xl overflow-hidden shadow-2xl">
          <img 
            src={service.image_url} 
            alt={service.title}
            className="w-full aspect-video object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features */}
            <div className="card-ocean p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Get</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <FaCheckCircle className="text-teal-500 mt-1 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverable Details */}
            <div className="card-ocean p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Deliverables</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Type:</h3>
                  <p className="text-gray-700">{service.deliverable_type}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Output Formats:</h3>
                  <div className="flex flex-wrap gap-2">
                    {service.output_format.map((format, index) => (
                      <span key={index} className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm font-medium">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-teal-50 rounded-lg p-4 mt-4">
                  <p className="text-teal-900 font-semibold mb-2">
                    <FaDownload className="inline mr-2" />
                    Electronic Delivery Only
                  </p>
                  <p className="text-teal-800 text-sm">
                    All files delivered digitally through secure client portal. No physical media or shipment involved.
                  </p>
                </div>
              </div>
            </div>

            {/* Genres (if applicable) */}
            {service.genres && service.genres.length > 0 && (
              <div className="card-ocean p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Genres</h2>
                <div className="flex flex-wrap gap-3">
                  {service.genres.map((genre, index) => (
                    <span key={index} className="bg-gradient-to-r from-sky-100 to-teal-100 text-gray-800 px-4 py-2 rounded-lg font-medium">
                      {genre}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  All content produced in publicly acceptable genres only. Adult content strictly prohibited.
                </p>
              </div>
            )}

            {/* Process */}
            <div className="card-ocean p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-sky-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Submit Your Request</h3>
                    <p className="text-gray-600">Fill out our detailed brief form with your project requirements</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-sky-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Receive Custom Quote</h3>
                    <p className="text-gray-600">Get a detailed quote within 24 hours based on your specific needs</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-sky-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Production Begins</h3>
                    <p className="text-gray-600">Our team starts working on your custom video project</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-sky-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Review & Revisions</h3>
                    <p className="text-gray-600">Review deliverables and request revisions as needed</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-teal-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">5</div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Final Delivery</h3>
                    <p className="text-gray-600">Download your final files from secure client portal</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Pricing Card */}
              <div className="card-ocean p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                <div className="text-4xl font-bold text-sky-600 mb-2">
                  {service.pricing_model === 'per_minute' 
                    ? `$${service.base_price}/min`
                    : service.pricing_model === 'per_project'
                    ? `From $${service.base_price}`
                    : 'Custom Quote'
                  }
                </div>
                <p className="text-sm text-gray-600 mb-6">{service.price_description}</p>
                <Link to="/request" className="block w-full text-center btn-ocean mb-3">
                  <FaRocket className="inline mr-2" />
                  Request Quote
                </Link>
                <Link to="/contact" className="block w-full text-center btn-ocean-outline">
                  Contact Us
                </Link>
              </div>

              {/* Key Info */}
              <div className="card-ocean p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <FaClock className="text-sky-500 mt-1 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Turnaround Time</p>
                      <p className="text-gray-600 text-sm">{service.turnaround_time}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaSync className="text-teal-500 mt-1 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Revisions</p>
                      <p className="text-gray-600 text-sm">{service.revision_policy}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FaDownload className="text-purple-500 mt-1 mr-3" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Delivery Method</p>
                      <p className="text-gray-600 text-sm">Electronic via client portal</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Links */}
              <div className="card-ocean p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Learn More</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link to="/how-it-works" className="text-sky-600 hover:text-sky-700 font-medium">
                      How Our Process Works →
                    </Link>
                  </li>
                  <li>
                    <Link to="/policies/revision" className="text-sky-600 hover:text-sky-700 font-medium">
                      Revision Policy →
                    </Link>
                  </li>
                  <li>
                    <Link to="/policies/digital_delivery" className="text-sky-600 hover:text-sky-700 font-medium">
                      Digital Delivery Info →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetails;
