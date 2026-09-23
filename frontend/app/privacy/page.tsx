import Link from "next/link";
import NavbarWrapper from "@/components/NavbarWrapper";
import FooterWrapper from "@/components/FooterWrapper";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <NavbarWrapper />

      <div className="max-w-3xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/" className="hover:text-red-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">Privacy Policy</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">
          Last updated: March 1, 2026
        </p>

        <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
            <p className="text-justify">
              Pulse of Kigezi (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy and ensuring transparency in how we handle your personal information. This Privacy Policy explains in detail how we collect, use, disclose, and safeguard your information when you visit our website pulseofkigezi.com, including any other media form, media channel, mobile website, or mobile application related or connected thereto. By using our services, you agree to the collection and use of information in accordance with this policy. We encourage you to read this policy carefully to understand our practices regarding your personal data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>
            <p className="mb-3 text-justify">We may collect information about you in a variety of ways to provide and improve our services. The information we collect includes:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-justify"><strong>Personal Data:</strong> When you voluntarily interact with our services, we may collect personally identifiable information such as your name, email address, and phone number. This occurs when you subscribe to our newsletter, submit a contact form, comment on articles, or engage with our content.</li>
              <li className="text-justify"><strong>Usage Data:</strong> We automatically collect information about your device and how you interact with our website. This includes your IP address, browser type and version, device type, operating system, pages visited, time and date of visits, time spent on pages, unique device identifiers, and other diagnostic data. This helps us understand user behavior and improve our services.</li>
              <li className="text-justify"><strong>Cookies and Tracking Technologies:</strong> We use cookies, web beacons, and similar tracking technologies to track activity on our website and store certain information. Cookies help us remember your preferences, understand which content is most popular, and improve your overall experience. You can control cookie settings through your browser preferences.</li>
              <li className="text-justify"><strong>Reading Preferences:</strong> We may track which articles you read, how long you spend reading them, and your engagement patterns to provide personalized content recommendations and improve our editorial decisions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">3. How We Use Your Information</h2>
            <p className="mb-3 text-justify">We use the collected information for various purposes to provide, maintain, and improve our services:</p>
            <ul className="list-disc pl-6 space-y-3">
              <li className="text-justify"><strong>Service Delivery:</strong> To deliver and maintain our news platform, provide you with access to articles, and ensure the website functions properly across all devices.</li>
              <li className="text-justify"><strong>Communication:</strong> To send you newsletters, breaking news alerts, and updates you have explicitly subscribed to. You can unsubscribe from these communications at any time using the link provided in each email.</li>
              <li className="text-justify"><strong>Customer Support:</strong> To respond to your inquiries, feedback, and requests for assistance through our contact forms or email communications.</li>
              <li className="text-justify"><strong>Analytics and Improvement:</strong> To analyze usage patterns, understand reader preferences, measure the effectiveness of our content, and continuously improve our website design, functionality, and editorial strategy.</li>
              <li className="text-justify"><strong>Advertising:</strong> To display relevant advertisements that support our journalism and keep our content free. We may use your browsing behavior to show more relevant ads while respecting your privacy.</li>
              <li className="text-justify"><strong>Security:</strong> To detect, prevent, and address technical issues, fraudulent activities, and potential security threats to protect both our users and our platform.</li>
              <li className="text-justify"><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, or enforceable governmental requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">4. Third-Party Services</h2>
            <p className="text-justify mb-3">
              We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, perform service-related activities, or assist us in analyzing how our service is used. These third parties have access to your personal data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
            <p className="text-justify">
              Third-party services we may use include analytics providers (to understand user behavior), advertising networks (to display relevant ads), content delivery networks (to ensure fast page loading), email service providers (to send newsletters), and hosting services (to maintain our website infrastructure). We carefully select our partners and require them to maintain appropriate security measures and comply with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">5. Advertising</h2>
            <p className="text-justify mb-3">
              We may use third-party advertising companies to serve ads when you visit our website. These companies may use information about your visits to this and other websites (but not your name, address, email address, or telephone number) in order to provide advertisements about goods and services of interest to you.
            </p>
            <p className="text-justify">
              Advertising revenue helps us maintain our journalism and keep our content freely accessible to all readers. We strive to display relevant, non-intrusive advertisements while respecting your privacy. You may opt out of personalized advertising by adjusting your browser settings or using industry opt-out tools. Please note that opting out does not mean you will see fewer ads, but the ads may be less relevant to your interests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">6. Data Security</h2>
            <p className="text-justify mb-3">
              We take the security of your personal information seriously and use administrative, technical, and physical security measures to help protect it. Our security practices include encrypted data transmission (HTTPS), secure server infrastructure, regular security audits, access controls limiting who can view your data, and staff training on data protection best practices.
            </p>
            <p className="text-justify">
              However, please be aware that while we have taken reasonable steps to secure the personal information you provide to us, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against interception or other types of misuse. We cannot guarantee absolute security of your data. In the event of a data breach that affects your personal information, we will notify you in accordance with applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">7. Your Rights</h2>
            <p className="text-justify mb-3">Under applicable data protection laws, you have certain rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-3 mt-2">
              <li className="text-justify"><strong>Right to Access:</strong> You have the right to request and receive a copy of the personal data we hold about you.</li>
              <li className="text-justify"><strong>Right to Rectification:</strong> You can request correction of any inaccurate or incomplete personal data we hold about you.</li>
              <li className="text-justify"><strong>Right to Erasure:</strong> You can request deletion of your personal data, subject to certain legal obligations that may require us to retain some information.</li>
              <li className="text-justify"><strong>Right to Opt-Out:</strong> You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting us directly.</li>
              <li className="text-justify"><strong>Right to Object:</strong> You can object to the processing of your personal data for direct marketing purposes or based on legitimate interests.</li>
              <li className="text-justify"><strong>Right to Data Portability:</strong> You can request your personal data in a structured, commonly used, and machine-readable format.</li>
              <li className="text-justify"><strong>Right to Lodge a Complaint:</strong> You have the right to lodge a complaint with a data protection supervisory authority if you believe your rights have been violated.</li>
            </ul>
            <p className="text-justify mt-3">To exercise any of these rights, please contact us using the information provided in the Contact Us section below.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">8. Children&apos;s Privacy</h2>
            <p className="text-justify">
              Our service does not address anyone under the age of 13, and we do not knowingly collect personally identifiable information from children under 13. Our content is designed for a general adult audience interested in news and current affairs. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us immediately. If we become aware that we have collected personal data from children without verification of parental consent, we will take steps to remove that information from our servers promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">9. Data Retention</h2>
            <p className="text-justify">
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. Newsletter subscription data is retained until you unsubscribe. Usage analytics data may be retained in aggregated, anonymized form indefinitely for statistical purposes. Contact form submissions are typically retained for up to two years for customer service purposes. When we no longer need your personal information, we will securely delete or anonymize it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">10. International Data Transfers</h2>
            <p className="text-justify">
              Your information may be transferred to and maintained on computers located outside of your country, region, or jurisdiction where data protection laws may differ. If you are located outside Uganda and choose to provide information to us, please note that we may transfer your data to Uganda and process it there. By submitting your personal information, you consent to this transfer, storage, and processing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">11. Changes to This Policy</h2>
            <p className="text-justify">
              We may update our Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at the top. We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of our services after any changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">12. Contact Us</h2>
            <p className="text-justify mb-3">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, we encourage you to contact us. We are committed to resolving any privacy-related issues promptly and transparently.
            </p>
            <p className="text-justify">
              <strong>Email:</strong>{" "}
              <a href={`mailto:${process.env.NEXT_PUBLIC_EMAIL || 'info@pulseofkigezi.com'}`} className="text-red-600 hover:underline">
                {process.env.NEXT_PUBLIC_EMAIL || 'info@pulseofkigezi.com'}
              </a>
              <br />
              <strong>Contact Form:</strong> Visit our{" "}
              <Link href="/contact" className="text-red-600 hover:underline">
                Contact page
              </Link>
              <br />
              <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 5 business days.
            </p>
          </section>
        </div>
      </div>

      <FooterWrapper />
    </div>
  );
}
