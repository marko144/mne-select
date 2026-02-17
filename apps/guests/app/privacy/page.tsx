/* eslint-disable react/no-unescaped-entities */
import { Metadata } from 'next'
import Link from 'next/link'
import { Container } from '@mne-select/ui'
import { siteConfig } from '../../config/seo.config'

export const metadata: Metadata = {
  title: 'Privacy Policy | Montenegro Select',
  description:
    'Learn how Montenegro Select collects, uses, and protects your personal information. GDPR compliant privacy policy.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-navy py-16 md:py-24">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-cream mb-4">Privacy Policy</h1>
            <p className="text-lg text-cream-muted">Last updated: February 17, 2026</p>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-cream max-w-none space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-cream-muted leading-relaxed">
                Montenegro Select ("we", "our", "us") is committed to protecting your privacy and
                personal data. This Privacy Policy explains how we collect, use, store and safeguard
                your personal information when you use our website and related services.
              </p>
              <p className="text-cream-muted leading-relaxed mt-4">
                This policy complies with applicable data protection laws including the General Data
                Protection Regulation (GDPR) and the Montenegrin Law on Personal Data Protection.
              </p>
            </section>

            {/* 1. Data Controller */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">1. Data Controller</h2>
              <p className="text-cream-muted leading-relaxed mb-4">
                Montenegro Select, operated by <strong className="text-cream">Velocci D.O.O</strong>,
                is the data controller responsible for your personal data.
              </p>
              <div className="bg-navy-darker p-6 rounded-lg border border-gold/20">
                <p className="text-cream-muted mb-2">
                  <span className="font-medium text-cream">Company:</span> Velocci D.O.O
                </p>
                <p className="text-cream-muted">
                  <span className="font-medium text-cream">Contact:</span>{' '}
                  <a
                    href="mailto:privacy@montenegroselect.com"
                    className="text-gold hover:text-gold/80 underline"
                  >
                    privacy@montenegroselect.com
                  </a>
                </p>
              </div>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">2. Information We Collect</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gold mb-3">
                    Information You Provide Directly:
                  </h3>
                  <ul className="list-disc list-inside text-cream-muted space-y-2 ml-4">
                    <li>Name</li>
                    <li>Email address</li>
                    <li>Messages you voluntarily send us</li>
                    <li>Any other information you choose to provide</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gold mb-3">
                    Information Collected Automatically:
                  </h3>
                  <ul className="list-disc list-inside text-cream-muted space-y-2 ml-4">
                    <li>IP address</li>
                    <li>Browser type and version</li>
                    <li>Device information</li>
                    <li>Pages visited and time spent on each page</li>
                    <li>Referring website</li>
                    <li>Broad location data (e.g., country, city)</li>
                    <li>Date and time of access</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 3. Cookies and Tracking Technologies */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">
                3. Cookies and Tracking Technologies
              </h2>

              <p className="text-cream-muted leading-relaxed mb-6">
                We use cookies and similar tracking technologies to enhance your experience, analyze
                site traffic, and understand how visitors interact with our platform. We only use
                cookies with your explicit consent, except for essential cookies required for the site
                to function.
              </p>

              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="border-l-4 border-gold pl-4">
                  <h3 className="text-xl font-semibold text-gold mb-2">
                    3.1 Necessary Cookies (Always Active)
                  </h3>
                  <p className="text-cream-muted leading-relaxed mb-3">
                    These cookies are essential for the website to function properly. They cannot be
                    disabled as they enable core functionality.
                  </p>
                  <ul className="list-disc list-inside text-cream-muted space-y-2 ml-4">
                    <li>Cookie consent preferences</li>
                    <li>Session management</li>
                    <li>Security features</li>
                    <li>Load balancing</li>
                  </ul>
                  <div className="mt-3 text-sm">
                    <span className="font-medium text-cream">Duration:</span>{' '}
                    <span className="text-cream-muted">Session or 12 months</span>
                  </div>
                </div>

                {/* Preferences Cookies */}
                <div className="border-l-4 border-gold pl-4">
                  <h3 className="text-xl font-semibold text-gold mb-2">
                    3.2 Preference Cookies (Enabled by Default)
                  </h3>
                  <p className="text-cream-muted leading-relaxed mb-3">
                    These cookies remember your choices and preferences to provide a personalized
                    experience.
                  </p>
                  <ul className="list-disc list-inside text-cream-muted space-y-2 ml-4">
                    <li>Language preference (English/Montenegrin)</li>
                    <li>Display preferences</li>
                    <li>Accessibility settings</li>
                  </ul>
                  <div className="mt-3 text-sm">
                    <span className="font-medium text-cream">Duration:</span>{' '}
                    <span className="text-cream-muted">12 months</span>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="border-l-4 border-gold pl-4">
                  <h3 className="text-xl font-semibold text-gold mb-2">
                    3.3 Analytics Cookies (Requires Consent)
                  </h3>
                  <p className="text-cream-muted leading-relaxed mb-3">
                    These cookies help us understand how visitors interact with our website by
                    collecting anonymous information about page views, traffic sources, and user
                    behavior.
                  </p>
                  <ul className="list-disc list-inside text-cream-muted space-y-2 ml-4">
                    <li>
                      <strong className="text-cream">Google Analytics</strong> (_ga, _gid, _gat)
                    </li>
                    <li>Page view tracking</li>
                    <li>Traffic source analysis</li>
                    <li>User behavior patterns</li>
                    <li>Conversion tracking</li>
                  </ul>
                  <div className="mt-3 text-sm">
                    <span className="font-medium text-cream">Duration:</span>{' '}
                    <span className="text-cream-muted">Up to 2 years</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-cream">Provider:</span>{' '}
                    <span className="text-cream-muted">Google LLC</span>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="border-l-4 border-gold/30 pl-4 opacity-60">
                  <h3 className="text-xl font-semibold text-gold mb-2">
                    3.4 Marketing Cookies (Not Currently Used)
                  </h3>
                  <p className="text-cream-muted leading-relaxed">
                    We do not currently use marketing or advertising cookies. If we add them in the
                    future, we will update this policy and request your explicit consent.
                  </p>
                </div>
              </div>

              <div className="mt-6 bg-navy-darker p-6 rounded-lg border border-gold/20">
                <h4 className="text-lg font-semibold text-cream mb-3">Managing Cookies</h4>
                <p className="text-cream-muted leading-relaxed mb-3">
                  You can manage your cookie preferences at any time through the cookie banner when
                  you first visit our site, or by adjusting your browser settings.
                </p>
                <ul className="list-disc list-inside text-cream-muted space-y-2 ml-4">
                  <li>
                    <a
                      href="https://support.google.com/chrome/answer/95647"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-gold/80 underline"
                    >
                      Google Chrome
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-gold/80 underline"
                    >
                      Mozilla Firefox
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-gold/80 underline"
                    >
                      Safari
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:text-gold/80 underline"
                    >
                      Microsoft Edge
                    </a>
                  </li>
                </ul>
              </div>
            </section>

            {/* 4. How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">
                4. How We Use Your Information
              </h2>
              <p className="text-cream-muted leading-relaxed mb-4">
                We use your personal data for the following purposes:
              </p>
              <ul className="list-disc list-inside text-cream-muted space-y-2 ml-4">
                <li>
                  <strong className="text-cream">Provide and maintain services</strong> - To operate
                  our platform and deliver requested services
                </li>
                <li>
                  <strong className="text-cream">Communicate with you</strong> - To send updates,
                  respond to inquiries, and provide customer support
                </li>
                <li>
                  <strong className="text-cream">Improve our website</strong> - To analyze usage
                  patterns and enhance user experience
                </li>
                <li>
                  <strong className="text-cream">Marketing communications</strong> - To send you
                  information about our services (with your consent)
                </li>
                <li>
                  <strong className="text-cream">Security and fraud prevention</strong> - To protect
                  our platform and users from security threats
                </li>
                <li>
                  <strong className="text-cream">Comply with legal obligations</strong> - To meet
                  legal and regulatory requirements
                </li>
              </ul>
            </section>

            {/* 5. Legal Basis for Processing */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">
                5. Legal Basis for Processing
              </h2>
              <p className="text-cream-muted leading-relaxed mb-4">
                We process your personal data based on the following legal grounds:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-gold pl-4">
                  <h3 className="text-lg font-semibold text-gold mb-2">Consent</h3>
                  <p className="text-cream-muted leading-relaxed">
                    When you explicitly agree to our processing of your data (e.g., analytics
                    cookies, marketing communications)
                  </p>
                </div>
                <div className="border-l-4 border-gold pl-4">
                  <h3 className="text-lg font-semibold text-gold mb-2">Legitimate Interest</h3>
                  <p className="text-cream-muted leading-relaxed">
                    When processing is necessary for our legitimate business interests (e.g., improving
                    our services, security)
                  </p>
                </div>
                <div className="border-l-4 border-gold pl-4">
                  <h3 className="text-lg font-semibold text-gold mb-2">Legal Obligations</h3>
                  <p className="text-cream-muted leading-relaxed">
                    When required by law or to comply with legal processes
                  </p>
                </div>
              </div>
            </section>

            {/* 6. Sharing Information */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">6. Sharing Information</h2>
              <p className="text-cream-muted leading-relaxed mb-4">
                We do not sell your personal data. We may share your information with:
              </p>
              <ul className="list-disc list-inside text-cream-muted space-y-3 ml-4">
                <li>
                  <strong className="text-cream">Service Providers</strong> - Third-party companies
                  that help us operate our platform (e.g., hosting, email services)
                </li>
                <li>
                  <strong className="text-cream">Analytics Partners</strong> - Google Analytics for
                  website analytics (with your consent)
                </li>
                <li>
                  <strong className="text-cream">Legal Authorities</strong> - When required by law or
                  to protect our rights
                </li>
                <li>
                  <strong className="text-cream">Business Transfers</strong> - In connection with a
                  merger, acquisition, or sale of assets
                </li>
              </ul>
              <p className="text-cream-muted leading-relaxed mt-4">
                All third parties are required to respect the security of your personal data and treat
                it in accordance with applicable laws.
              </p>
            </section>

            {/* 7. Third-Party Services */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">7. Third-Party Services</h2>
              <p className="text-cream-muted leading-relaxed mb-4">
                We use the following third-party services that may collect personal data:
              </p>
              <div className="border-l-4 border-gold pl-4">
                <h3 className="text-lg font-semibold text-gold mb-2">Google Analytics</h3>
                <p className="text-cream-muted leading-relaxed mb-3">
                  Google Analytics is a web analytics service provided by Google LLC. It uses cookies
                  to help us analyze how visitors use our website.
                </p>
                <p className="text-cream-muted leading-relaxed">
                  For more information, see{' '}
                  <a
                    href="https://policies.google.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:text-gold/80 underline"
                  >
                    Google's Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold hover:text-gold/80 underline"
                  >
                    Google Analytics Opt-out
                  </a>
                  .
                </p>
              </div>
            </section>

            {/* 8. Data Retention */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">8. Data Retention</h2>
              <p className="text-cream-muted leading-relaxed mb-4">
                We retain your personal data only as long as necessary for the purposes outlined in
                this policy:
              </p>
              <ul className="list-disc list-inside text-cream-muted space-y-2 ml-4">
                <li>
                  <strong className="text-cream">Cookie consent:</strong> 12 months
                </li>
                <li>
                  <strong className="text-cream">Analytics data:</strong> Up to 26 months (Google
                  Analytics default)
                </li>
                <li>
                  <strong className="text-cream">Contact information:</strong> Until you request
                  deletion or we no longer need it
                </li>
                <li>
                  <strong className="text-cream">Legal retention:</strong> As required by law
                </li>
              </ul>
              <p className="text-cream-muted leading-relaxed mt-4">
                When data is no longer required, it is securely deleted or anonymized.
              </p>
            </section>

            {/* 9. Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">9. Your Rights Under GDPR</h2>
              <p className="text-cream-muted leading-relaxed mb-4">
                If you are in the European Economic Area (EEA) or Montenegro, you have the following
                rights regarding your personal data:
              </p>
              <div className="space-y-3">
                <div className="bg-navy-darker p-4 rounded border border-gold/20">
                  <h3 className="font-semibold text-gold mb-1">Right to Access</h3>
                  <p className="text-cream-muted text-sm">
                    Request copies of your personal data
                  </p>
                </div>
                <div className="bg-navy-darker p-4 rounded border border-gold/20">
                  <h3 className="font-semibold text-gold mb-1">Right to Rectification</h3>
                  <p className="text-cream-muted text-sm">
                    Request correction of inaccurate or incomplete data
                  </p>
                </div>
                <div className="bg-navy-darker p-4 rounded border border-gold/20">
                  <h3 className="font-semibold text-gold mb-1">Right to Erasure</h3>
                  <p className="text-cream-muted text-sm">
                    Request deletion of your personal data ("right to be forgotten")
                  </p>
                </div>
                <div className="bg-navy-darker p-4 rounded border border-gold/20">
                  <h3 className="font-semibold text-gold mb-1">Right to Restrict Processing</h3>
                  <p className="text-cream-muted text-sm">
                    Request limitation on how we use your data
                  </p>
                </div>
                <div className="bg-navy-darker p-4 rounded border border-gold/20">
                  <h3 className="font-semibold text-gold mb-1">Right to Data Portability</h3>
                  <p className="text-cream-muted text-sm">
                    Request transfer of your data to another organization
                  </p>
                </div>
                <div className="bg-navy-darker p-4 rounded border border-gold/20">
                  <h3 className="font-semibold text-gold mb-1">Right to Object</h3>
                  <p className="text-cream-muted text-sm">
                    Object to processing based on legitimate interests
                  </p>
                </div>
                <div className="bg-navy-darker p-4 rounded border border-gold/20">
                  <h3 className="font-semibold text-gold mb-1">Right to Withdraw Consent</h3>
                  <p className="text-cream-muted text-sm">
                    Withdraw consent at any time (where processing is based on consent)
                  </p>
                </div>
              </div>
              <p className="text-cream-muted leading-relaxed mt-6">
                To exercise any of these rights, please contact us at{' '}
                <a
                  href="mailto:privacy@montenegroselect.com"
                  className="text-gold hover:text-gold/80 underline"
                >
                  privacy@montenegroselect.com
                </a>
                . We will respond to your request within 30 days.
              </p>
            </section>

            {/* 10. Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">10. Data Security</h2>
              <p className="text-cream-muted leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your personal
                data against unauthorized access, alteration, disclosure, or destruction:
              </p>
              <ul className="list-disc list-inside text-cream-muted space-y-2 ml-4">
                <li>Encryption of data in transit (HTTPS/TLS)</li>
                <li>Secure hosting infrastructure</li>
                <li>Regular security assessments</li>
                <li>Access controls and authentication</li>
                <li>Staff training on data protection</li>
              </ul>
              <p className="text-cream-muted leading-relaxed mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive to
                protect your data, we cannot guarantee absolute security.
              </p>
            </section>

            {/* 11. Third-Party Links */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">11. Third-Party Links</h2>
              <p className="text-cream-muted leading-relaxed">
                Our website may contain links to third-party websites. We are not responsible for the
                privacy practices or content of these external sites. We encourage you to read the
                privacy policies of any third-party sites you visit.
              </p>
            </section>

            {/* 12. Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">12. Children's Privacy</h2>
              <p className="text-cream-muted leading-relaxed">
                Our services are not directed at children under 16 years of age. We do not knowingly
                collect personal information from children under 16. If you believe we have
                inadvertently collected such information, please contact us immediately, and we will
                take steps to delete it.
              </p>
            </section>

            {/* 13. International Data Transfers */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">
                13. International Data Transfers
              </h2>
              <p className="text-cream-muted leading-relaxed">
                Your personal data may be transferred to and processed in countries outside of
                Montenegro or the European Economic Area (EEA). When we transfer data internationally,
                we ensure appropriate safeguards are in place, such as:
              </p>
              <ul className="list-disc list-inside text-cream-muted space-y-2 ml-4 mt-4">
                <li>EU-approved Standard Contractual Clauses</li>
                <li>Adequacy decisions by the European Commission</li>
                <li>Other legally approved transfer mechanisms</li>
              </ul>
            </section>

            {/* 14. Updates to This Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-cream mb-4">
                14. Updates to This Privacy Policy
              </h2>
              <p className="text-cream-muted leading-relaxed">
                We may update this Privacy Policy periodically to reflect changes in our practices,
                technology, legal requirements, or other factors. We will notify you of any material
                changes by:
              </p>
              <ul className="list-disc list-inside text-cream-muted space-y-2 ml-4 mt-4">
                <li>Updating the "Last updated" date at the top of this policy</li>
                <li>Posting a notice on our website</li>
                <li>Sending you an email notification (if we have your email address)</li>
              </ul>
              <p className="text-cream-muted leading-relaxed mt-4">
                The latest version will always be available on our website. We encourage you to review
                this policy periodically.
              </p>
            </section>

            {/* 15. Contact Us */}
            <section className="border-t border-gold/20 pt-8">
              <h2 className="text-2xl font-semibold text-cream mb-4">15. Contact Us</h2>
              <p className="text-cream-muted leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or how
                we handle your personal data, please contact us:
              </p>
              <div className="bg-navy-darker p-6 rounded-lg border border-gold/20">
                <div className="space-y-3">
                  <p className="text-cream-muted">
                    <span className="font-medium text-cream">Company:</span> Velocci D.O.O
                  </p>
                  <p className="text-cream-muted">
                    <span className="font-medium text-cream">Privacy Contact:</span>{' '}
                    <a
                      href="mailto:privacy@montenegroselect.com"
                      className="text-gold hover:text-gold/80 underline"
                    >
                      privacy@montenegroselect.com
                    </a>
                  </p>
                  <p className="text-cream-muted">
                    <span className="font-medium text-cream">General Contact:</span>{' '}
                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="text-gold hover:text-gold/80 underline"
                    >
                      {siteConfig.email}
                    </a>
                  </p>
                </div>
              </div>
              <p className="text-cream-muted leading-relaxed mt-6 text-sm">
                You also have the right to lodge a complaint with a supervisory authority if you
                believe we have not complied with applicable data protection laws.
              </p>
            </section>
          </div>

          {/* Back to Home */}
          <div className="mt-12 pt-8 border-t border-gold/20">
            <Link
              href="/"
              className="inline-flex items-center text-gold hover:text-gold/80 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
