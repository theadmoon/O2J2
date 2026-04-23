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
                      <h3 className="text-2xl font-bold text-gray-900">Submit Your Project in the Portal</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Create a project inside the secure client portal. A short idea or a single-sentence description is enough to open the workspace — <strong>no complete brief or finished script is required</strong>.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Describe the idea briefly — the project chat opens immediately.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Scripts, references, mood boards, or footage can be uploaded later, any time before the invoice is signed.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>No payment is required to open the workspace and start the conversation.</span>
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
                      <h3 className="text-2xl font-bold text-gray-900">Order Activation and Invoice Issuance</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Once enough information is collected inside the portal chat, the order is <strong>activated</strong>. Our team then issues the project invoice, which is stored inside the portal and accessible at any time.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>The invoice contains scope, timeline, deliverables, and payment details.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>All project documents are issued and stored inside the portal — no email delivery.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Issuing the invoice does not yet require payment — it locks the scope for signature.</span>
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
                      <h3 className="text-2xl font-bold text-gray-900">Invoice Signature and Production Start</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      The client <strong>signs the invoice inside the portal</strong>, confirming acceptance of the scope. Once the invoice is signed, the project enters production.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Signature is performed directly in the portal — no external signing tools.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Signing the invoice locks the scope but does not require payment at this stage.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Payment is processed only after the client accepts the completed work — the Pay-After-Acceptance model.</span>
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
                      <h3 className="text-2xl font-bold text-gray-900">In-House Production and Portal Communication</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Our team works on the project internally. All communication about the project — status updates, drafts, feedback — happens <strong>inside the portal chat</strong>. Email is not used as a standard channel.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Project status is tracked directly in the portal.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Direct messaging with the production team via portal chat.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Email is used only as an emergency fallback if portal communication is temporarily unavailable.</span>
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
                      <h3 className="text-2xl font-bold text-gray-900">Electronic Delivery, File Access & Client Acceptance</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      Once the work is complete, our team issues a <strong>Delivery Certificate</strong> in the portal and provides secure access to the final files. The client reviews the work, requests any included revisions, and then signs the <strong>Acceptance Act</strong> inside the portal.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>All deliverables are accessible through the secure portal — no external sharing services.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Included revision rounds are requested and processed inside the portal.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>Signing the Acceptance Act is the final confirmation before the payment stage.</span>
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
                      <h3 className="text-2xl font-bold text-gray-900">Payment Reporting, Confirmation, and Completion</h3>
                    </div>
                    <p className="text-gray-600 mb-4">
                      After the client signs the Acceptance Act, payment becomes due. The client transfers payment through the selected channel (PayPal, SWIFT bank transfer, or USDT on the TRON network) and then <strong>reports the payment inside the portal</strong> by providing the transaction reference. Our team verifies the payment and records the confirmation — a <strong>Certificate of Completion</strong> is then issued to close the project.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span><strong>Payment Reported</strong>: the client submits the transaction reference inside the portal.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span><strong>Payment Confirmed</strong>: our team verifies the transfer and records the confirmation in the portal.</span>
                      </li>
                      <li className="flex items-start">
                        <FaCheckCircle className="text-teal-500 mt-1 mr-2 flex-shrink-0" />
                        <span>The Certificate of Completion and all project documents remain available inside the portal.</span>
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
