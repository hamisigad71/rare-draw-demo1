import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 font-['Cinzel'] text-foreground">
            Terms of Service
          </h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-muted-foreground">
            <p className="text-sm text-muted-foreground">
              Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
              <p>
                By accessing and using RareDraw ("the Service"), you agree to be bound by these Terms of Service. 
                If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Use of Service</h2>
              <h3 className="text-xl font-semibold text-foreground mb-3">Eligibility</h3>
              <p>
                You must be at least 13 years old to use RareDraw. By using this service, you represent that you 
                meet this age requirement.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">Account Responsibility</h3>
              <p>You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Purchases and Payments</h2>
              <h3 className="text-xl font-semibold text-foreground mb-3">Premium Decks</h3>
              <p>
                Some card decks are available for purchase. All purchases are final and non-refundable unless 
                otherwise stated or required by law.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">Pricing</h3>
              <p>
                Prices are subject to change without notice. We reserve the right to modify pricing for our decks 
                at any time.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">Payment Processing</h3>
              <p>
                Payments are processed through third-party payment providers. You agree to comply with their terms 
                and conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">User Conduct</h2>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful code, viruses, or malware</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Share or distribute purchased content without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
              <p>
                All content on RareDraw, including card designs, text, graphics, logos, and software, is the 
                property of RareDraw or its licensors and is protected by copyright and trademark laws.
              </p>
              <p className="mt-3">
                Purchased decks grant you a personal, non-transferable license to use the content for personal 
                entertainment purposes only.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Disclaimers</h2>
              <h3 className="text-xl font-semibold text-foreground mb-3">"As Is" Service</h3>
              <p>
                The service is provided "as is" without warranties of any kind, either express or implied. 
                We do not guarantee uninterrupted, timely, secure, or error-free service.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3 mt-4">Content Accuracy</h3>
              <p>
                While we strive for quality, we do not warrant the accuracy, completeness, or usefulness of 
                any information provided through the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, RareDraw shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages arising from your use of the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Termination</h2>
              <p>
                We reserve the right to suspend or terminate your access to the service at any time, with or 
                without notice, for any reason, including violation of these terms.
              </p>
              <p className="mt-3">
                Upon termination, your right to use the service will immediately cease. Purchased content may 
                no longer be accessible.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Modifications</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. We will notify users of 
                significant changes. Your continued use of the service after changes constitutes acceptance 
                of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance with applicable laws, without 
                regard to conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
              <p>
                For questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-2">
                <a href="mailto:play@raredraw.com" className="text-primary hover:underline">
                  play@raredraw.com
                </a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Severability</h2>
              <p>
                If any provision of these terms is found to be unenforceable, the remaining provisions will 
                continue in full force and effect.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsOfService;
