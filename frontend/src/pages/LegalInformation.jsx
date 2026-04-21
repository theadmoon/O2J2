import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFileContract, FaBuilding, FaCreditCard } from 'react-icons/fa';

function LegalInformation() {
  return (
    <div className="legal-information py-16 px-4 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Legal Information
          </h1>
          <p className="text-lg text-gray-600">
            Business registration and contact details
          </p>
        </div>

        {/* Legal Entity & Brand Relationship */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 border-2 border-sky-200 rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FaBuilding className="text-3xl text-sky-600" />
            <h2 className="text-2xl font-bold text-gray-900">Legal Entity & Brand Relationship</h2>
          </div>
          
          <div className="bg-white rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Legal Form
                </label>
                <p className="text-gray-900">
                  Individual Entrepreneur (Sole Proprietorship)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tax ID
                </label>
                <p className="text-gray-900 font-mono">
                  302335809
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Legal Entity
              </label>
              <p className="text-lg font-bold text-gray-900">
                Individual Entrepreneur Vera Iambaeva
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Registered in Georgia: February 17, 2025
              </p>
            </div>

            <div className="border-t pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand Name
              </label>
              <p className="text-lg font-bold text-sky-600">
                Ocean2Joy Digital Video Production
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Used for service identification and marketing
              </p>
            </div>

            <div className="bg-sky-50 rounded-lg p-4 border-l-4 border-sky-500">
              <p className="text-sm text-gray-700 leading-relaxed">
                Individual Entrepreneur Vera Iambaeva operates this business under the brand name 
                "Ocean2Joy Digital Video Production" for service identification and marketing purposes. 
                All contracts, invoices, receipts, and legal documents are issued in the name of 
                Individual Entrepreneur Vera Iambaeva.
              </p>
            </div>
          </div>
        </div>

        {/* Business Registration */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FaFileContract className="text-3xl text-sky-600" />
            <h2 className="text-2xl font-bold text-gray-900">Business Registration</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand Name
              </label>
              <p className="text-gray-900 bg-sky-50 px-4 py-3 rounded-lg font-semibold">
                Ocean2Joy Digital Video Production
              </p>
              <p className="text-xs text-gray-500 mt-1 px-1">
                For marketing and service identification
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Legal Entity
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                Individual Entrepreneur Vera Iambaeva
              </p>
              <p className="text-xs text-gray-500 mt-1 px-1">
                All legal documents issued in this name
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Registration Number / Tax ID
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg font-mono">
                302335809
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Registration Date
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                February 17, 2025
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Country of Registration
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                Georgia
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Jurisdiction
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                Georgia
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Registered Address
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                Tbilisi, Georgia
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Registering Authority
              </label>
              <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">
                LEPL National Agency of Public Registry
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-left">Contact Information</h2>
          
          <div className="space-y-4 text-left">
            <div className="flex items-start gap-4">
              <FaEnvelope className="text-2xl text-sky-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <a 
                  href="mailto:ocean2joy@gmail.com"
                  className="text-sky-600 hover:text-sky-700 font-medium"
                >
                  ocean2joy@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaPhone className="text-2xl text-sky-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Phone
                </label>
                <a 
                  href="tel:+995555375032"
                  className="text-sky-600 hover:text-sky-700 font-medium"
                >
                  +995 555 375 032
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FaMapMarkerAlt className="text-2xl text-sky-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Business Location
                </label>
                <p className="text-gray-900">
                  Tbilisi, Georgia
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FaCreditCard className="text-3xl text-sky-600" />
            <h2 className="text-2xl font-bold text-gray-900">Payment Information</h2>
          </div>
          
          <p className="text-gray-700 mb-6 text-left">
            Our business is registered and operates legally in Georgia. We accept payments through:
          </p>

          {/* PayPal Section */}
          <div className="bg-sky-50 rounded-lg p-6 mb-4 border-l-4 border-sky-500">
            <h3 className="text-lg font-bold text-gray-900 mb-4">PayPal</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Account
                </label>
                <p className="text-gray-900 font-mono bg-white px-3 py-2 rounded">
                  302335809@postbox.ge
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Account Holder
                </label>
                <p className="text-gray-900">
                  Individual Entrepreneur Vera Iambaeva
                </p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Brand Name
                </label>
                <p className="text-sky-600 font-semibold">
                  Ocean2Joy Digital Video Production
                </p>
              </div>
            </div>
          </div>

          {/* Bank Transfer Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">International Bank Transfer (SWIFT)</h3>
            <p className="text-sm text-gray-600">
              Details available upon request for corporate clients.
            </p>
          </div>

          {/* Crypto Section */}
          <div className="bg-gray-50 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cryptocurrency (USDT-TRC20)</h3>
            <p className="text-sm text-gray-600">
              We accept stablecoin payments in <strong>USDT on the TRON network (TRC20)</strong>. The wallet address is shared privately inside your project portal after the quote is activated. Please send only USDT-TRC20 — tokens on other networks (ERC20, BEP20, etc.) will not be credited.
            </p>
          </div>

          <p className="text-sm text-gray-600 text-left">
            For detailed payment information, please visit our{' '}
            <Link to="/" className="text-sky-600 hover:text-sky-700 font-semibold">
              Payments section
            </Link>
            {' '}on the homepage.
          </p>
        </div>

        {/* Tax & Legal Compliance */}
        <div className="bg-sky-50 border-l-4 border-sky-500 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Tax & Legal Compliance</h3>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            Individual Entrepreneur Vera Iambaeva operates under the brand name "Ocean2Joy Digital 
            Video Production" as a registered Individual Entrepreneur in Georgia. All business 
            activities are conducted in compliance with Georgian tax laws and regulations.
          </p>
          <p className="text-gray-700 text-sm leading-relaxed mb-4">
            We maintain full transparency in our financial operations and provide proper documentation 
            for all transactions:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
            <li>Invoices issued in the name of Individual Entrepreneur Vera Iambaeva</li>
            <li>Official payment receipts</li>
            <li>Certificates of delivery for digital services</li>
            <li>Certificates of completion</li>
          </ul>
          <p className="text-gray-700 text-sm leading-relaxed mt-4">
            All legal documents are issued in the name of Individual Entrepreneur Vera Iambaeva 
            (Tax ID: 302335809). The brand name "Ocean2Joy Digital Video Production" is used 
            for service identification and marketing purposes.
          </p>
        </div>

        {/* Service Description */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-left">Business Activity</h2>
          <p className="text-gray-700 leading-relaxed mb-4 text-left">
            Individual Entrepreneur Vera Iambaeva, operating under the trade name 
            "Ocean2Joy Digital Video Production", specializes in digital video production 
            services delivered electronically.
          </p>
          <p className="text-gray-700 font-semibold mb-3 text-left">
            Our services include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4 text-left ml-4">
            <li>Custom video production according to client specifications</li>
            <li>Professional video editing services</li>
            <li>AI-assisted video content creation</li>
          </ul>
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              <strong className="text-amber-700">Important:</strong> All services are delivered digitally. 
              No physical products are shipped. Payment terms and conditions are specified in individual 
              project quotes and invoices.
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link to="/" className="btn-ocean inline-block">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LegalInformation;
