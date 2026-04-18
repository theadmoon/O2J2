import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API}/services`);
      setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-sky-600">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="services-page py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Our <span className="text-ocean">Video Services</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional digital video production services tailored to your needs. All deliverables created in-house and delivered electronically.
          </p>
        </div>

        {/* Services Grid */}
        <div className="space-y-16">
          {services.map((service, index) => (
            <div 
              key={service.id}
              className={`card-ocean overflow-hidden ${index % 2 === 0 ? '' : 'md:flex-row-reverse'}`}
            >
              <div className="md:flex items-center">
                {/* Image */}
                <div className="md:w-1/2">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={service.image_url} 
                      alt={service.title}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="md:w-1/2 p-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 mb-6 text-lg">
                    {service.description}
                  </p>

                  {/* Pricing */}
                  <div className="bg-sky-50 rounded-lg p-4 mb-6">
                    <div className="text-3xl font-bold text-sky-600 mb-2">
                      {service.pricing_model === 'per_minute' 
                        ? `$${service.base_price}-${service.base_price + 10}/min`
                        : `Starting at $${service.base_price}`
                      }
                    </div>
                    <p className="text-sm text-gray-600">{service.price_description}</p>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">What's Included:</h3>
                    <ul className="space-y-2">
                      {service.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Deliverable Info */}
                  <div className="bg-teal-50 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-teal-900 mb-1">Deliverable Type:</p>
                    <p className="text-teal-800">{service.deliverable_type}</p>
                    <p className="text-sm font-semibold text-teal-900 mb-1 mt-2">Output Formats:</p>
                    <p className="text-teal-800">{service.output_format.join(', ')}</p>
                  </div>

                  {/* CTA */}
                  <div className="flex gap-4">
                    <Link 
                      to={`/services/${service.id}`}
                      className="flex-1 text-center btn-ocean"
                    >
                      View Details
                      <FaArrowRight className="inline ml-2" />
                    </Link>
                    <Link 
                      to="/request"
                      className="flex-1 text-center btn-ocean-outline"
                    >
                      Request Quote
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Digital Delivery Notice */}
        <div className="mt-16 bg-gradient-to-r from-sky-50 to-teal-50 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            All Services Delivered Electronically
          </h3>
          <p className="text-gray-700 max-w-2xl mx-auto mb-6">
            Every project is custom-made by our in-house team and delivered digitally through our secure client portal. No physical shipment involved - just fast, professional electronic delivery.
          </p>
          <Link to="/policies/digital_delivery" className="text-sky-600 hover:text-sky-700 font-semibold">
            Learn more about our digital delivery process →
          </Link>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Project?
          </h3>
          <p className="text-gray-600 mb-8 text-lg">
            Get a custom quote in 24 hours or less
          </p>
          <Link to="/request" className="btn-ocean text-lg">
            Start Your Project Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Services;
