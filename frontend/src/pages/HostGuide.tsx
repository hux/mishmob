import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import {
  Building,
  Users,
  Target,
  CheckCircle,
  TrendingUp,
  Shield,
  Calendar,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Award,
  Clock,
  FileText,
  Heart,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export function HostGuide() {
  const gettingStartedSteps = [
    {
      step: 1,
      title: 'Create Organization Profile',
      description: 'Register your organization and get verified',
      icon: Building,
    },
    {
      step: 2,
      title: 'Post Opportunities',
      description: 'Create detailed volunteer opportunities',
      icon: FileText,
    },
    {
      step: 3,
      title: 'Review Applications',
      description: 'Screen and approve volunteer applications',
      icon: Users,
    },
    {
      step: 4,
      title: 'Manage & Engage',
      description: 'Coordinate volunteers and track impact',
      icon: BarChart3,
    },
  ];

  const bestPractices = [
    {
      icon: FileText,
      title: 'Create Clear Opportunities',
      description: 'Write detailed, engaging opportunity descriptions',
      tips: [
        'Use descriptive titles that inspire action',
        'Clearly outline tasks and expectations',
        'Specify required skills and time commitment',
        'Highlight the impact volunteers will make',
      ],
    },
    {
      icon: Clock,
      title: 'Respond Promptly',
      description: 'Quick responses lead to better volunteer engagement',
      tips: [
        'Reply to applications within 48 hours',
        'Set up automated confirmation emails',
        'Provide clear next steps',
        'Keep volunteers informed of changes',
      ],
    },
    {
      icon: Users,
      title: 'Build Community',
      description: 'Create a welcoming environment for volunteers',
      tips: [
        'Provide thorough orientation and training',
        'Recognize volunteer contributions',
        'Foster connections between volunteers',
        'Gather and act on feedback',
      ],
    },
    {
      icon: Shield,
      title: 'Ensure Safety',
      description: 'Maintain a safe environment for all participants',
      tips: [
        'Conduct appropriate background checks',
        'Provide safety training and equipment',
        'Have clear emergency procedures',
        'Maintain proper insurance coverage',
      ],
    },
  ];

  const successMetrics = [
    {
      metric: 'Response Rate',
      description: 'Aim to respond to 90%+ of applications within 48 hours',
      icon: MessageSquare,
    },
    {
      metric: 'Completion Rate',
      description: 'Track percentage of volunteers who complete their commitment',
      icon: CheckCircle,
    },
    {
      metric: 'Retention Rate',
      description: 'Measure volunteers who return for additional opportunities',
      icon: Heart,
    },
    {
      metric: 'Impact Metrics',
      description: 'Document tangible outcomes from volunteer efforts',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Building className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Organization Guide</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Learn how to effectively recruit, manage, and engage volunteers to amplify your organization's impact
          </p>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Getting Started as a Host</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow these steps to start building your volunteer program on MishMob
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
            {gettingStartedSteps.map((item) => (
              <Card key={item.step}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="default" className="text-lg px-3 py-1">
                      {item.step}
                    </Badge>
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/register?type=host">
                Register Your Organization
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Creating Effective Opportunities */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Target className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Creating Effective Volunteer Opportunities</CardTitle>
                  <CardDescription>Key elements of opportunities that attract quality volunteers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Essential Information</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Clear, action-oriented title</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Detailed role description</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Specific time commitment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Location and accessibility info</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>Required skills or qualifications</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Make It Compelling</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Share your mission and impact</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Include photos or videos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Highlight skills volunteers will gain</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Show appreciation upfront</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-red-600 mt-0.5" />
                      <span>Use inclusive language</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Pro Tip</AlertTitle>
                <AlertDescription>
                  Include specific examples of tasks volunteers will do and the direct impact 
                  they'll have. Concrete details help volunteers visualize themselves in the role.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Best Practices */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Host Best Practices</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Build a thriving volunteer program with these proven strategies
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {bestPractices.map((practice, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <practice.icon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{practice.title}</CardTitle>
                      <CardDescription>{practice.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {practice.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Measuring Success</h2>
            <p className="text-center text-muted-foreground mb-12">
              Track these key metrics to optimize your volunteer program
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {successMetrics.map((item, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <item.icon className="h-8 w-8 text-primary" />
                    <h3 className="font-semibold">{item.metric}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Management Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Volunteer Management Tips</CardTitle>
              <CardDescription>Keep volunteers engaged and coming back</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Before They Arrive
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Send confirmation with date, time, location, and parking info</li>
                  <li>• Share what to expect and what to bring</li>
                  <li>• Provide contact information for questions</li>
                  <li>• Send a reminder 24-48 hours before</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  During Their Service
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Greet volunteers warmly and introduce them to the team</li>
                  <li>• Provide clear instructions and necessary training</li>
                  <li>• Check in regularly and be available for questions</li>
                  <li>• Take photos (with permission) to share their impact</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  After They Volunteer
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Thank them personally before they leave</li>
                  <li>• Send a follow-up thank you with impact metrics</li>
                  <li>• Share photos and stories from the day</li>
                  <li>• Invite them to future opportunities</li>
                  <li>• Ask for feedback to improve</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Resources */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Additional Resources</h2>
            <p className="text-muted-foreground mb-8">
              Tools and templates to help you succeed
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Opportunity Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Pre-written templates for common volunteer roles
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <BarChart3 className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Impact Tracking Guide</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn to measure and report volunteer impact
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <Users className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Volunteer Handbook</h3>
                  <p className="text-sm text-muted-foreground">
                    Customizable handbook template for your volunteers
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <Users className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Grow Your Volunteer Program?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of organizations using MishMob to connect with passionate volunteers 
            and amplify their impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register?type=host">Get Started</Link>
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