import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <Card>
          <ScrollArea className="h-[600px]">
            <CardContent className="p-8 prose prose-gray max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-6">
                Last updated: January 26, 2025
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p>
                MishMob ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name and contact information (email, phone number)</li>
                <li>Location information (zip code, city)</li>
                <li>Professional information (skills, resume, LinkedIn profile)</li>
                <li>Account credentials</li>
                <li>Volunteer history and preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Usage Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Browser type and version</li>
                <li>IP address</li>
                <li>Pages visited and time spent</li>
                <li>Click patterns and feature usage</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
              <p>We use the collected information for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Matching volunteers with appropriate opportunities</li>
                <li>Communicating about volunteer opportunities and updates</li>
                <li>Improving our matching algorithms and services</li>
                <li>Conducting background checks (with your consent)</li>
                <li>Preventing fraud and ensuring platform security</li>
                <li>Complying with legal obligations</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Information Sharing</h2>
              <p>We share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Organizations:</strong> When you apply to volunteer opportunities</li>
                <li><strong>Service Providers:</strong> Third parties that help us operate our platform</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
                <li><strong>Business Transfers:</strong> In case of merger or acquisition</li>
              </ul>
              <p className="mt-4">
                We never sell your personal information to third parties for marketing purposes.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
              <p>
                We implement industry-standard security measures including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and testing</li>
                <li>Access controls and authentication</li>
                <li>Employee training on data protection</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Delete your account and information</li>
                <li>Opt-out of certain communications</li>
                <li>Export your data</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences</li>
                <li>Understand usage patterns</li>
                <li>Improve site performance</li>
                <li>Provide personalized experiences</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Children's Privacy</h2>
              <p>
                Our services are not intended for users under 18 years of age. We do not knowingly collect information from minors without parental consent.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. We will notify you of significant changes via email or through the platform.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
              <p>
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-4">
                <p className="font-semibold">MishMob Privacy Team</p>
                <p>Email: privacy@mishmob.com</p>
                <p>Address: 123 Mission Street, San Francisco, CA 94103</p>
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}