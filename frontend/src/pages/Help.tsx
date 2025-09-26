import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  Search,
  HelpCircle,
  BookOpen,
  Users,
  Building,
  Shield,
  CreditCard,
  Mail,
  MessageCircle,
  FileText,
  Video,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function Help() {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      icon: Users,
      title: 'For Volunteers',
      description: 'Getting started, finding opportunities, and making an impact',
      link: '#volunteers',
    },
    {
      icon: Building,
      title: 'For Organizations',
      description: 'Creating opportunities, managing volunteers, and growing impact',
      link: '#organizations',
    },
    {
      icon: Shield,
      title: 'Safety & Trust',
      description: 'Background checks, safety guidelines, and community standards',
      link: '#safety',
    },
    {
      icon: CreditCard,
      title: 'Account & Billing',
      description: 'Managing your account, subscriptions, and payment methods',
      link: '#account',
    },
  ];

  const volunteerFAQs = [
    {
      question: 'How do I find volunteer opportunities that match my skills?',
      answer: 'MishMob uses AI-powered matching to suggest opportunities based on your skills, interests, and location. Complete your profile, upload your resume or connect LinkedIn, and our system will recommend the best matches for you.',
    },
    {
      question: 'Do I need any special qualifications to volunteer?',
      answer: 'Most opportunities don\'t require special qualifications beyond enthusiasm and reliability. Some specialized roles may require specific skills or certifications, which will be clearly stated in the opportunity description.',
    },
    {
      question: 'Can I volunteer remotely?',
      answer: 'Yes! Many organizations offer remote volunteer opportunities. Use the "Remote" filter when browsing opportunities to find virtual volunteering options.',
    },
    {
      question: 'How do I track my volunteer hours?',
      answer: 'Your volunteer hours are automatically tracked when you check in and out of opportunities. You can view your total hours, download reports, and get verification letters from your dashboard.',
    },
    {
      question: 'What if I need to cancel my volunteer commitment?',
      answer: 'Life happens! If you need to cancel, please do so as soon as possible through your dashboard. This helps organizations plan accordingly. Repeated last-minute cancellations may affect your reliability rating.',
    },
  ];

  const organizationFAQs = [
    {
      question: 'How much does it cost to post opportunities?',
      answer: 'Basic opportunity posting is free for verified nonprofit organizations. Premium features like advanced matching, analytics, and priority placement are available with our Pro plans.',
    },
    {
      question: 'How do I verify my organization?',
      answer: 'Submit your 501(c)(3) documentation or equivalent nonprofit status through your organization settings. Verification typically takes 2-3 business days.',
    },
    {
      question: 'Can I require background checks for volunteers?',
      answer: 'Yes, you can require background checks for sensitive roles. MishMob partners with trusted providers to offer discounted background check services. Volunteers can complete checks once and share results with multiple organizations.',
    },
    {
      question: 'How do I manage multiple volunteer coordinators?',
      answer: 'You can add team members with different permission levels from your organization settings. Assign roles like coordinator, reviewer, or admin to manage who can post opportunities and review applications.',
    },
    {
      question: 'What kind of support is available?',
      answer: 'We offer email support for all users, with priority support for Pro subscribers. We also provide onboarding sessions, training resources, and a dedicated success manager for Enterprise plans.',
    },
  ];

  const resources = [
    {
      icon: BookOpen,
      title: 'Getting Started Guide',
      description: 'Step-by-step guide to using MishMob',
      link: '/guide/getting-started',
    },
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch how-to videos and webinars',
      link: '/tutorials',
    },
    {
      icon: FileText,
      title: 'Best Practices',
      description: 'Tips for successful volunteering',
      link: '/best-practices',
    },
    {
      icon: MessageCircle,
      title: 'Community Forum',
      description: 'Connect with other users',
      link: '/community',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-950 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <HelpCircle className="h-16 w-16 text-primary mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {helpCategories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <category.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs for Volunteers */}
      <section id="volunteers" className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              For Volunteers
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {volunteerFAQs.map((faq, index) => (
                <AccordionItem key={index} value={`volunteer-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* FAQs for Organizations */}
      <section id="organizations" className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <Building className="h-8 w-8 text-primary" />
              For Organizations
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {organizationFAQs.map((faq, index) => (
                <AccordionItem key={index} value={`org-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Resources */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-center">Helpful Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <resource.icon className="h-8 w-8 text-primary mb-3" />
                    <CardTitle className="text-lg">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {resource.description}
                    </p>
                    <Button variant="link" className="p-0">
                      Learn more →
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <Mail className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our support team is here to help you succeed. Reach out anytime!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/contact">Contact Support</Link>
            </Button>
            <Button size="lg" variant="outline">
              support@mishmob.com
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}