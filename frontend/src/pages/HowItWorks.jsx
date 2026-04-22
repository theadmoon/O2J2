import { FaPlay, FaComments, FaPalette, FaDownload, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import useSeo from '../hooks/useSeo';
import useJsonLd from '../hooks/useJsonLd';

const HOW_IT_WORKS_FAQ = [
  {
    q: 'When do I pay for the project?',
    a: 'Ocean2Joy follows a pay-after-acceptance model. You sign the invoice upfront to lock the scope, but the actual payment is due only after you have reviewed the final delivery, confirmed it meets the brief, and signed the Acceptance Act. If you are not satisfied, you are not charged.',
  },
  {
    q: 'How long does a typical video project take?',
    a: 'Turnaround depends on the service and complexity. Custom live-action videos typically take 2–4 weeks end-to-end (script → shoot → post). Video editing of existing footage usually ships in 5–10 business days. AI-generated videos are the fastest — often delivered in 3–7 days.',
  },
  {
    q: 'How many revision rounds are included?',
    a: 'Every project includes 2–3 rounds of revisions at no extra cost, scoped to the agreed brief. Substantial re-directions that fall outside the original scope are quoted separately. See the Revision Policy for details.',
  },
  {
    q: 'What video formats do you deliver?',
    a: 'We deliver master files in MP4 and MOV as standard. On request we can also provide AVI or a bespoke codec/resolution for broadcast or streaming platforms. All deliverables are uploaded to a secure client portal — no physical media, no shipping.',
  },
  {
    q: 'Do you handle the script, storyboard and casting?',
    a: 'Yes. We offer end-to-end production: scriptwriting, storyboarding, casting professional actors, directing on-set, full post-production (editing, VFX, color grading, sound design). You can also come with your own script — we adapt the workflow to your starting point.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'PayPal, international SWIFT bank transfer, and USDT on the TRON network (TRC-20). All payment details are printed on the invoice issued at stage 3 of the workflow.',
  },
  {
    q: 'Do you work with clients internationally?',
    a: 'Yes — Ocean2Joy operates 100% digitally, and our service is available worldwide. Communication, briefs, revisions and final delivery all happen through the client portal. The legal entity is registered in Tbilisi, Georgia.',
  },
];

function HowItWorks() {
  useSeo({
    title: 'How It Works — 12-Stage Video Production Workflow | Ocean2Joy',
    description:
      "See Ocean2Joy's transparent 12-stage process: from project brief and invoice to delivery and acceptance. You pay only after you sign off on the final result.",
    path: '/how-it-works',
  });

  useJsonLd('faq-how-it-works', {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOW_IT_WORKS_FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  });

  useJsonLd('breadcrumb-how-it-works', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ocean2joy.com/' },
      { '@type': 'ListItem', position: 2, name: 'How It Works', item: 'https://ocean2joy.com/how-it-works' },
    ],
  });

  return (
    <div className="how-it-works-page py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            How <span className="text-ocean">Ocean2joy</span> Works
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From your first idea to final electronic delivery - a smooth, transparent process designed for your success
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Vertical line for desktop */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-sky-200 via-teal-200 to-sky-200 h-full"></div>

          <div className="space-y-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="md:flex items-center">
                <div className="md:w-1/2 md:pr-12">
                  <div className="card-ocean p-8 hover:shadow-2xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        1
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Submit Your Request</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Fill out our <strong>quick request form</strong> with basic information (takes under 2 minutes) or create a full account for detailed project submission.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Describe your video project and objectives</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Upload reference materials, scripts, or existing footage</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Specify your timeline and budget preferences</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="hidden md:block md:w-1/2 md:pl-12">
                  <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-br from-sky-100 to-teal-100 h-full flex items-center justify-center">
                      <FaPlay className="text-6xl text-sky-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="md:flex items-center md:flex-row-reverse">
                <div className="md:w-1/2 md:pl-12">
                  <div className="card-ocean p-8 hover:shadow-2xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        2
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Receive Custom Quote</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Our team reviews your request and prepares a <strong>detailed quote</strong> within 24 hours, including scope, timeline, and pricing.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Personalized quote based on your specific needs</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Clear breakdown of deliverables and timeline</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Receive via email or client portal</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="hidden md:block md:w-1/2 md:pr-12">
                  <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-full flex items-center justify-center">
                      <FaComments className="text-6xl text-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="md:flex items-center">
                <div className="md:w-1/2 md:pr-12">
                  <div className="card-ocean p-8 hover:shadow-2xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        3
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Confirm & Start Production</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Accept the quote, confirm project terms, and make payment. Your project immediately enters our <strong>production queue</strong>.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>One-click quote acceptance in portal</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Secure payment via PayPal or bank transfer</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Automatic project documents generated</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="hidden md:block md:w-1/2 md:pl-12">
                  <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-br from-green-100 to-teal-100 h-full flex items-center justify-center">
                      <FaCheckCircle className="text-6xl text-green-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="md:flex items-center md:flex-row-reverse">
                <div className="md:w-1/2 md:pl-12">
                  <div className="card-ocean p-8 hover:shadow-2xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        4
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">In-House Production</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Our professional team works on your custom video. Track progress, communicate with your project manager, and stay updated via your portal.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Real-time project status tracking</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Direct messaging with production team</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Preview drafts and provide feedback</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="hidden md:block md:w-1/2 md:pr-12">
                  <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-br from-orange-100 to-yellow-100 h-full flex items-center justify-center">
                      <FaPalette className="text-6xl text-orange-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="relative">
              <div className="md:flex items-center">
                <div className="md:w-1/2 md:pr-12">
                  <div className="card-ocean p-8 hover:shadow-2xl transition-shadow">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        5
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Review & Revisions</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Review deliverables in your portal. Request revisions if needed (included in your package). Approve when satisfied.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>2-3 revision rounds included (varies by service)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Easy feedback system in client portal</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Fast turnaround on revisions (3-5 days)</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="hidden md:block md:w-1/2 md:pl-12">
                  <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 h-full flex items-center justify-center">
                      <svg className="w-24 h-24 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="relative">
              <div className="md:flex items-center md:flex-row-reverse">
                <div className="md:w-1/2 md:pl-12">
                  <div className="card-ocean p-8 hover:shadow-2xl transition-shadow bg-gradient-to-br from-teal-50 to-sky-50">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                        6
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Electronic Delivery & Completion</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Download your <strong>final files electronically</strong> from the secure client portal. Receive completion documents. Project complete!
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span><strong>Electronic delivery only</strong> - no physical shipping</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>High-quality files in agreed formats (MP4, MOV, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Automatic completion certificate & invoice</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Files accessible for 90 days (extended on request)</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="hidden md:block md:w-1/2 md:pr-12">
                  <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
                    <div className="bg-gradient-to-br from-teal-100 to-emerald-100 h-full flex items-center justify-center">
                      <FaDownload className="text-6xl text-teal-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Digital Service Notice */}
        <div className="mt-20 bg-gradient-to-r from-sky-500 to-teal-500 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">100% Digital Service Model</h3>
          <p className="text-xl text-sky-50 mb-6 max-w-3xl mx-auto">
            Every project is <strong>custom-made by our in-house team</strong> and delivered <strong>electronically through our secure portal</strong>. No physical media. No shipping logistics. Just fast, professional digital delivery.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/policies/digital_delivery" className="bg-white text-sky-600 px-6 py-2 rounded-lg font-semibold hover:bg-sky-50 transition">
              Learn About Digital Delivery
            </Link>
            <Link to="/policies/terms" className="bg-white/20 backdrop-blur-sm text-white border-2 border-white px-6 py-2 rounded-lg font-semibold hover:bg-white/30 transition">
              Read Terms of Service
            </Link>
          </div>
        </div>

        {/* Frequently Asked Questions — kept visible for Google FAQ rich results. */}
        <div className="mt-20" data-testid="how-faq-section">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h3>
            <p className="text-gray-500">Everything clients ask before starting a project — in one place.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {HOW_IT_WORKS_FAQ.map((item, idx) => (
              <details
                key={idx}
                className="group bg-white border border-gray-200 rounded-lg open:shadow-sm transition"
                data-testid={`how-faq-item-${idx}`}
              >
                <summary className="flex items-start justify-between gap-4 px-5 py-4 cursor-pointer list-none">
                  <span className="text-sm font-semibold text-gray-900 flex-1">{item.q}</span>
                  <span className="shrink-0 w-6 h-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-lg leading-none transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="px-5 pb-5 -mt-1 text-sm text-gray-600 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
          <p className="text-gray-600 mb-8 text-lg">Submit your project request in under 2 minutes</p>
          <Link to="/request" className="btn-ocean text-lg">
            Start Your Project Now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
