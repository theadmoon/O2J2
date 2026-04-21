import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function Contact() {
  return (
    <div className="contact-page py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Get in <span className="text-ocean">Touch</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about our video production services? We're here to help bring your vision to life.
          </p>
        </div>

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
                  <a href="/start" className="text-sky-600 hover:text-sky-700 font-medium">
                    → Start a Project
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
  );
}

export default Contact;
