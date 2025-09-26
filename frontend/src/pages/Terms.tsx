import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Terms() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <Card>
          <ScrollArea className="h-[600px]">
            <CardContent className="p-8 prose prose-gray max-w-none dark:prose-invert">
              <p className="text-muted-foreground mb-6">
                Effective Date: January 26, 2025
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing or using MishMob's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
              <p>
                MishMob provides a platform that connects volunteers with nonprofit organizations and community service opportunities. Our services include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Volunteer opportunity matching</li>
                <li>Application and communication tools</li>
                <li>Volunteer hour tracking</li>
                <li>Skills assessment and development</li>
                <li>Community engagement features</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Account Creation</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining account security</li>
                <li>You must notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Account Types</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Volunteer Accounts:</strong> For individuals seeking volunteer opportunities</li>
                <li><strong>Organization Accounts:</strong> For nonprofit organizations posting opportunities</li>
                <li><strong>Admin Accounts:</strong> For platform administrators</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Conduct</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide false or misleading information</li>
                <li>Impersonate others or misrepresent affiliations</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Use the platform for commercial solicitation</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to breach platform security</li>
                <li>Scrape or collect user data without permission</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Organization Responsibilities</h2>
              <p>Organizations using our platform agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verify their nonprofit status</li>
                <li>Post accurate opportunity descriptions</li>
                <li>Respond to volunteer applications timely</li>
                <li>Provide safe volunteering environments</li>
                <li>Comply with all applicable laws</li>
                <li>Maintain appropriate insurance coverage</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Volunteer Responsibilities</h2>
              <p>Volunteers using our platform agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Honor commitments to organizations</li>
                <li>Provide accurate availability information</li>
                <li>Communicate cancellations promptly</li>
                <li>Follow organization guidelines and safety protocols</li>
                <li>Represent themselves honestly</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Intellectual Property</h2>
              <p>
                All content on MishMob, including text, graphics, logos, and software, is owned by or licensed to us. You may not use our intellectual property without written permission.
              </p>
              <p className="mt-4">
                By posting content on our platform, you grant us a non-exclusive, worldwide license to use, display, and distribute that content in connection with our services.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Privacy and Data Protection</h2>
              <p>
                Your use of our services is also governed by our Privacy Policy. By using MishMob, you consent to our collection and use of information as described in the Privacy Policy.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">No Employment Relationship</h3>
              <p>
                MishMob is not an employer, and volunteers are not employees of MishMob or necessarily of the organizations they serve.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Background Checks</h3>
              <p>
                While we may facilitate background checks, we do not guarantee the accuracy or completeness of any background check information.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Platform Availability</h3>
              <p>
                We strive for continuous availability but do not guarantee uninterrupted service. We may modify or discontinue services at any time.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Indemnification</h2>
              <p>
                You agree to indemnify and hold MishMob harmless from any claims, losses, or damages arising from your use of our services or violation of these terms.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">11. Dispute Resolution</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Disputes will be resolved through binding arbitration</li>
                <li>Arbitration will be conducted in San Francisco, California</li>
                <li>You waive the right to participate in class actions</li>
                <li>Small claims court actions are exempt from arbitration</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-8 mb-4">12. Governing Law</h2>
              <p>
                These terms are governed by the laws of California, without regard to conflict of law principles.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the modified terms.
              </p>

              <h2 className="text-2xl font-semibold mt-8 mb-4">14. Contact Information</h2>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-4">
                <p className="font-semibold">MishMob Legal Team</p>
                <p>Email: legal@mishmob.com</p>
                <p>Address: 123 Mission Street, San Francisco, CA 94103</p>
              </div>
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}