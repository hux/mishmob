import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Clock,
  Award,
  Heart,
  MapPin,
  Calendar,
  Quote,
  Star,
  BarChart3,
} from 'lucide-react';

export function Impact() {
  const stats = [
    { label: 'Volunteers Connected', value: '15,234', icon: Users },
    { label: 'Hours Contributed', value: '487,921', icon: Clock },
    { label: 'Organizations Served', value: '1,847', icon: Heart },
    { label: 'Communities Impacted', value: '324', icon: MapPin },
  ];

  const stories = [
    {
      title: 'Transforming Green Spaces in Downtown',
      organization: 'Urban Gardens Initiative',
      location: 'San Francisco, CA',
      date: 'December 2024',
      volunteers: 45,
      hours: 180,
      impact: 'Created 3 new community gardens serving 500+ families',
      image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80',
      quote: 'MishMob helped us find passionate gardeners who transformed empty lots into thriving community spaces.',
      quotee: 'Maria Rodriguez, Program Director',
    },
    {
      title: 'Teaching Tech Skills to Seniors',
      organization: 'Digital Bridge Foundation',
      location: 'Austin, TX',
      date: 'January 2025',
      volunteers: 28,
      hours: 112,
      impact: 'Taught 200+ seniors essential digital skills',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
      quote: 'The volunteers we found through MishMob were patient, skilled, and truly made a difference.',
      quotee: 'James Chen, Executive Director',
    },
    {
      title: 'Emergency Food Distribution',
      organization: 'Community Food Network',
      location: 'Chicago, IL',
      date: 'November 2024',
      volunteers: 120,
      hours: 480,
      impact: 'Distributed 50,000 meals to families in need',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
      quote: 'When we needed help urgently, MishMob mobilized an army of volunteers in just 48 hours.',
      quotee: 'Sarah Williams, Operations Manager',
    },
  ];

  const categories = [
    { name: 'Education', projects: 234, volunteers: 3420 },
    { name: 'Environment', projects: 189, volunteers: 2890 },
    { name: 'Food Security', projects: 156, volunteers: 4230 },
    { name: 'Health & Wellness', projects: 198, volunteers: 2150 },
    { name: 'Animal Welfare', projects: 87, volunteers: 1240 },
    { name: 'Arts & Culture', projects: 142, volunteers: 1780 },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Impact</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Every connection we make creates ripples of positive change. See how volunteers 
            and organizations are transforming communities together.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <stat.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <p className="text-3xl font-bold mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Impact Stories</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real stories from communities where MishMob volunteers have made a difference
            </p>
          </div>

          <div className="space-y-12 max-w-6xl mx-auto">
            {stories.map((story, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={story.image}
                      alt={story.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-6 md:p-8">
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <Badge variant="secondary">{story.organization}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {story.location}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {story.date}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold mb-3">{story.title}</h3>
                    
                    <div className="flex gap-6 mb-4">
                      <div>
                        <p className="text-2xl font-semibold text-primary">{story.volunteers}</p>
                        <p className="text-sm text-muted-foreground">Volunteers</p>
                      </div>
                      <div>
                        <p className="text-2xl font-semibold text-primary">{story.hours}</p>
                        <p className="text-sm text-muted-foreground">Hours</p>
                      </div>
                    </div>

                    <p className="text-lg font-medium mb-4 text-green-600 dark:text-green-400">
                      {story.impact}
                    </p>

                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                      <Quote className="h-6 w-6 text-gray-400 mb-2" />
                      <p className="italic text-muted-foreground mb-2">"{story.quote}"</p>
                      <p className="text-sm font-medium">— {story.quotee}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact by Category */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Impact by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our volunteers contribute across diverse areas, each making a unique difference
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto mb-12">
            {categories.map((category, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-semibold">{category.projects}</p>
                      <p className="text-sm text-muted-foreground">Projects</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold">{category.volunteers.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">Volunteers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Monthly Growth Chart Placeholder */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Volunteer Hours by Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                <p className="text-muted-foreground">Chart visualization coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What People Say</h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "MishMob made it so easy to find volunteer opportunities that match my skills. 
                  I've met amazing people and feel like I'm really making a difference."
                </p>
                <p className="font-medium">Alex Thompson</p>
                <p className="text-sm text-muted-foreground">Volunteer</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "As a small nonprofit, finding skilled volunteers was always a challenge. 
                  MishMob changed that completely. We've grown our impact 3x in just one year."
                </p>
                <p className="font-medium">Patricia Davis</p>
                <p className="text-sm text-muted-foreground">Executive Director, Hope Foundation</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">
                  "The quality of volunteers we get through MishMob is outstanding. They're 
                  passionate, skilled, and truly committed to our mission."
                </p>
                <p className="font-medium">Robert Lee</p>
                <p className="text-sm text-muted-foreground">Program Manager, Youth Mentors</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <TrendingUp className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Be Part of the Impact</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of volunteers and organizations creating positive change in 
            communities across the country.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/register">Start Volunteering</Link>
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