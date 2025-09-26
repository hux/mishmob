import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  Building,
  Users,
  Heart,
  Globe,
  Award,
  Handshake,
  ExternalLink,
  Mail,
} from 'lucide-react';

export function Partners() {
  const partners = [
    {
      category: 'Corporate Partners',
      icon: Building,
      description: 'Leading companies supporting volunteer initiatives',
      partners: [
        {
          name: 'TechCorp Solutions',
          logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=TechCorp',
          description: 'Providing technology infrastructure and employee volunteer programs',
          website: 'https://example.com',
          contribution: '500+ volunteer hours monthly',
        },
        {
          name: 'Global Finance Group',
          logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=GlobalFinance',
          description: 'Supporting financial literacy programs and community development',
          website: 'https://example.com',
          contribution: 'Skills-based volunteering',
        },
        {
          name: 'Green Industries Inc.',
          logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=GreenIndustries',
          description: 'Environmental sustainability and conservation projects',
          website: 'https://example.com',
          contribution: 'Environmental initiatives',
        },
      ],
    },
    {
      category: 'Nonprofit Partners',
      icon: Heart,
      description: 'Organizations creating volunteer opportunities',
      partners: [
        {
          name: 'Community Food Network',
          logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=FoodNetwork',
          description: 'Fighting hunger through community-driven food programs',
          website: 'https://example.com',
          contribution: '50,000+ meals distributed',
        },
        {
          name: 'Youth Education Alliance',
          logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=YouthEducation',
          description: 'Empowering youth through mentorship and education',
          website: 'https://example.com',
          contribution: '1,000+ students mentored',
        },
        {
          name: 'Senior Care Foundation',
          logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=SeniorCare',
          description: 'Improving quality of life for seniors in our community',
          website: 'https://example.com',
          contribution: 'Elder care programs',
        },
      ],
    },
    {
      category: 'Technology Partners',
      icon: Globe,
      description: 'Powering our platform with innovative solutions',
      partners: [
        {
          name: 'CloudTech Services',
          logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=CloudTech',
          description: 'Cloud infrastructure and security solutions',
          website: 'https://example.com',
          contribution: 'Platform infrastructure',
        },
        {
          name: 'DataSafe Analytics',
          logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=DataSafe',
          description: 'Background check and verification services',
          website: 'https://example.com',
          contribution: 'Volunteer screening',
        },
      ],
    },
    {
      category: 'Community Partners',
      icon: Users,
      description: 'Local organizations and government agencies',
      partners: [
        {
          name: 'City of San Francisco',
          logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=SFCity',
          description: 'Municipal programs and civic engagement initiatives',
          website: 'https://example.com',
          contribution: 'Civic programs',
        },
        {
          name: 'Bay Area United Way',
          logo: 'https://api.dicebear.com/7.x/identicon/svg?seed=UnitedWay',
          description: 'Mobilizing community resources for lasting change',
          website: 'https://example.com',
          contribution: 'Community impact',
        },
      ],
    },
  ];

  const benefits = [
    {
      icon: Award,
      title: 'Brand Visibility',
      description: 'Showcase your commitment to social responsibility',
    },
    {
      icon: Users,
      title: 'Employee Engagement',
      description: 'Boost morale with meaningful volunteer opportunities',
    },
    {
      icon: Heart,
      title: 'Community Impact',
      description: 'Make a tangible difference in local communities',
    },
    {
      icon: Globe,
      title: 'Network Access',
      description: 'Connect with like-minded organizations',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Handshake className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Partners</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Together with our partners, we're building stronger communities through 
            volunteering and social impact.
          </p>
        </div>
      </section>

      {/* Partner Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {partners.map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-16 last:mb-0">
              <div className="flex items-center gap-3 mb-8">
                <category.icon className="h-8 w-8 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold">{category.category}</h2>
                  <p className="text-muted-foreground">{category.description}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.partners.map((partner, index) => (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <img
                          src={partner.logo}
                          alt={partner.name}
                          className="w-16 h-16 rounded-lg"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg">{partner.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {partner.contribution}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {partner.description}
                      </p>
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Visit Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partnership Benefits */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Partner With MishMob?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join a growing network of organizations committed to creating positive change
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <benefit.icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Tiers */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Partnership Opportunities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose a partnership level that aligns with your organization's goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Community Partner</CardTitle>
                <CardDescription>Perfect for local organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li>✓ Logo on partners page</li>
                  <li>✓ Quarterly impact reports</li>
                  <li>✓ Basic platform access</li>
                  <li>✓ Community recognition</li>
                </ul>
                <Button className="w-full" variant="outline">
                  Learn More
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary">
              <CardHeader>
                <CardTitle>Strategic Partner</CardTitle>
                <CardDescription>For growing impact</CardDescription>
                <Badge className="mt-2">Most Popular</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li>✓ Everything in Community</li>
                  <li>✓ Featured partner status</li>
                  <li>✓ Custom volunteer programs</li>
                  <li>✓ Priority support</li>
                  <li>✓ Co-branded campaigns</li>
                </ul>
                <Button className="w-full">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle>Premier Partner</CardTitle>
                <CardDescription>Maximum visibility & impact</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm mb-6">
                  <li>✓ Everything in Strategic</li>
                  <li>✓ Homepage placement</li>
                  <li>✓ Executive briefings</li>
                  <li>✓ Custom integrations</li>
                  <li>✓ Dedicated success team</li>
                </ul>
                <Button className="w-full" variant="outline">
                  Contact Us
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Become a Partner</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join us in our mission to connect volunteers with meaningful opportunities 
            and create lasting community impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Mail className="mr-2 h-4 w-4" />
              partnerships@mishmob.com
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Our Team</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}