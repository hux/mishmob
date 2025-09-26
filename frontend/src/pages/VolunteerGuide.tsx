import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Clock,
  Heart,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Calendar,
  Shield,
  Trophy,
  MessageSquare,
  Lightbulb,
  Target,
  ArrowRight,
} from 'lucide-react';

export function VolunteerGuide() {
  const gettingStartedSteps = [
    {
      step: 1,
      title: 'Create Your Profile',
      description: 'Sign up and tell us about your skills, interests, and availability',
      icon: Users,
    },
    {
      step: 2,
      title: 'Browse Opportunities',
      description: 'Explore volunteer opportunities that match your interests',
      icon: Target,
    },
    {
      step: 3,
      title: 'Apply & Connect',
      description: 'Apply to opportunities and connect with organizations',
      icon: Heart,
    },
    {
      step: 4,
      title: 'Make an Impact',
      description: 'Show up, contribute, and track your volunteer hours',
      icon: Trophy,
    },
  ];

  const bestPractices = [
    {
      icon: Clock,
      title: 'Be Reliable',
      tips: [
        'Show up on time for your volunteer shifts',
        'Notify the organization if you need to cancel',
        'Complete your committed hours',
      ],
    },
    {
      icon: MessageSquare,
      title: 'Communicate Effectively',
      tips: [
        'Respond to messages promptly',
        'Ask questions when unclear',
        'Provide feedback to help improve programs',
      ],
    },
    {
      icon: Shield,
      title: 'Stay Safe',
      tips: [
        'Follow all safety guidelines',
        'Report any concerns immediately',
        'Know emergency procedures',
      ],
    },
    {
      icon: Star,
      title: 'Be Professional',
      tips: [
        'Dress appropriately for the activity',
        'Respect confidentiality',
        'Work well with other volunteers',
      ],
    },
  ];

  const faqs = [
    {
      question: 'Do I need any special skills to volunteer?',
      answer: 'Most opportunities welcome volunteers of all skill levels. Some specialized roles may require specific skills, which will be clearly stated in the opportunity description.',
    },
    {
      question: 'How much time do I need to commit?',
      answer: 'Time commitments vary greatly. You can find one-time events lasting a few hours or ongoing commitments requiring weekly participation. Choose what works for your schedule.',
    },
    {
      question: 'Can I volunteer with friends or family?',
      answer: 'Absolutely! Many organizations welcome group volunteers. Check the opportunity details or contact the organization to arrange group volunteering.',
    },
    {
      question: 'Will I receive training?',
      answer: 'Most organizations provide orientation and training for their volunteers. This ensures you feel prepared and confident in your role.',
    },
    {
      question: 'Can I get a verification of my volunteer hours?',
      answer: 'Yes! MishMob tracks your volunteer hours automatically, and you can download verification letters for school, work, or personal records.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Volunteer Guide</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Everything you need to know to start your volunteering journey and make a meaningful impact in your community
          </p>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow these simple steps to begin your volunteer journey
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
              <Link to="/register">
                Start Volunteering Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Finding the Right Opportunity */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lightbulb className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle>Finding the Right Opportunity</CardTitle>
                  <CardDescription>Tips for choosing volunteer work that's perfect for you</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Consider Your Interests</h3>
                <p className="text-muted-foreground">
                  Choose causes you're passionate about. Whether it's education, environment, animals, or social services, volunteering is more rewarding when it aligns with your values.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Assess Your Skills</h3>
                <p className="text-muted-foreground">
                  Think about what you can offer. Professional skills, hobbies, or just enthusiasm can all be valuable. Many opportunities also help you develop new skills.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Check Logistics</h3>
                <p className="text-muted-foreground">
                  Consider location, time commitment, and physical requirements. Be realistic about what you can commit to ensure a positive experience for everyone.
                </p>
              </div>
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription>
                  <strong>Pro Tip:</strong> Start with a one-time event to get a feel for an organization before committing to ongoing volunteering.
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
            <h2 className="text-3xl font-bold mb-4">Volunteer Best Practices</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Follow these guidelines to be an outstanding volunteer
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {bestPractices.map((practice, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <practice.icon className="h-6 w-6 text-primary" />
                    <CardTitle className="text-lg">{practice.title}</CardTitle>
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

      {/* Making the Most of Your Experience */}
      <section className="py-16 bg-blue-50 dark:bg-blue-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Making the Most of Your Experience</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Track Your Impact</h3>
                <p className="text-sm text-muted-foreground">
                  Log your hours and see the difference you're making over time
                </p>
              </div>
              <div className="text-center">
                <Users className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Build Connections</h3>
                <p className="text-sm text-muted-foreground">
                  Network with like-minded volunteers and organization staff
                </p>
              </div>
              <div className="text-center">
                <Trophy className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Gain Recognition</h3>
                <p className="text-sm text-muted-foreground">
                  Earn badges and certificates for your volunteer achievements
                </p>
              </div>
            </div>

            <Alert className="bg-white dark:bg-gray-800">
              <Star className="h-4 w-4" />
              <AlertDescription>
                <strong>Remember:</strong> Every hour you volunteer makes a difference. Whether you're teaching a child to read, cleaning a park, or serving meals, you're contributing to positive change in your community.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-4">Have more questions?</p>
              <Button asChild variant="outline">
                <Link to="/help">Visit Help Center</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <Heart className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your journey to creating positive change in your community starts here. 
            Join thousands of volunteers making an impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/opportunities">Browse Opportunities</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}