import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Heart,
  Users,
  Target,
  TrendingUp,
  Award,
  Globe,
  Sparkles,
  HandshakeIcon,
} from 'lucide-react';

export function About() {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'Founder & CEO',
      bio: 'Passionate about connecting communities through meaningful volunteer work.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Building technology that makes volunteering accessible to everyone.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Community',
      bio: 'Fostering connections between volunteers and organizations.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    },
    {
      name: 'David Kim',
      role: 'Head of Impact',
      bio: 'Measuring and maximizing the positive change we create together.',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Purpose-Driven',
      description: 'We believe everyone deserves to find meaning and purpose through service.',
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Strong communities are built through collective action and mutual support.',
    },
    {
      icon: Target,
      title: 'Impact Focused',
      description: 'Every action, no matter how small, contributes to meaningful change.',
    },
    {
      icon: Sparkles,
      title: 'Innovation',
      description: 'Using technology to remove barriers and create new possibilities for service.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About MishMob</h1>
          <p className="text-xl max-w-3xl mx-auto">
            We're on a mission to mobilize communities around purpose, creating a world where 
            everyone can find belonging and meaning through service.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Globe className="h-8 w-8 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold">Our Mission</h2>
                </div>
                <p className="text-muted-foreground">
                  To connect skilled volunteers with meaningful opportunities, enabling individuals 
                  to discover purpose while addressing critical community needs. We leverage 
                  technology to make volunteering accessible, impactful, and rewarding for everyone.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                  <h2 className="text-2xl font-bold">Our Vision</h2>
                </div>
                <p className="text-muted-foreground">
                  A world where every person has discovered their unique ability to contribute, 
                  where communities thrive through collective action, and where the act of 
                  service creates lasting connections and transformative change.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Our Story</h2>
            <div className="text-left space-y-4 text-muted-foreground">
              <p>
                MishMob was born from a simple observation: while millions of people want to 
                volunteer and make a difference, they often don't know where to start. At the 
                same time, organizations struggle to find and engage the right volunteers for 
                their missions.
              </p>
              <p>
                Founded in 2025, we set out to bridge this gap using AI-powered matching 
                technology. By analyzing skills, interests, and availability, we connect 
                volunteers with opportunities where they can make the greatest impact while 
                developing new capabilities and building meaningful relationships.
              </p>
              <p>
                Today, MishMob has facilitated thousands of volunteer connections, contributed 
                millions of hours of service, and helped transform communities across the country. 
                But we're just getting started. Our dream is to make volunteering as easy and 
                rewarding as possible for everyone, everywhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <value.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                  <h3 className="font-semibold mb-1">{member.name}</h3>
                  <p className="text-sm text-blue-600 mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <HandshakeIcon className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Join Our Mission</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Whether you're looking to volunteer, host opportunities, or partner with us, 
            we'd love to have you on this journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}