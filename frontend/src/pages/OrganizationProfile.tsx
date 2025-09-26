import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building,
  Globe,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Users,
  Heart,
  Star,
  CheckCircle,
  ExternalLink,
  Share2,
} from 'lucide-react';

// Mock data - replace with API call
const mockOrganization = {
  id: 1,
  name: 'Green Earth Foundation',
  type: 'Environmental',
  website: 'https://greenearth.org',
  email: 'contact@greenearth.org',
  phone: '(555) 123-4567',
  description: 'Green Earth Foundation is dedicated to environmental conservation and community education. We work to protect natural habitats, promote sustainable practices, and engage communities in environmental stewardship.',
  mission: 'To inspire and empower communities to protect and preserve our natural environment for future generations.',
  address: '456 Eco Way, San Francisco, CA 94105',
  founded_year: 2015,
  is_verified: true,
  logo_url: 'https://api.dicebear.com/7.x/identicon/svg?seed=GreenEarth',
  cover_image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80',
  stats: {
    total_opportunities: 24,
    active_opportunities: 5,
    total_volunteers: 312,
    total_hours: 8420,
    rating_average: 4.8,
    rating_count: 67,
  },
  social_links: {
    facebook: 'https://facebook.com/greenearthfoundation',
    twitter: 'https://twitter.com/greenearth',
    instagram: 'https://instagram.com/greenearthfound',
  },
  impact_areas: ['Environment', 'Education', 'Community Development'],
  recent_opportunities: [
    {
      id: '1',
      title: 'Beach Cleanup Initiative',
      status: 'open',
      start_date: '2025-02-15',
      location: 'Ocean Beach',
      volunteers_needed: 20,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    },
    {
      id: '2',
      title: 'Community Garden Project',
      status: 'open',
      start_date: '2025-02-01',
      location: 'Downtown Park',
      volunteers_needed: 15,
      image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&q=80',
    },
    {
      id: '3',
      title: 'Tree Planting Day',
      status: 'open',
      start_date: '2025-03-01',
      location: 'City Park',
      volunteers_needed: 30,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80',
    },
  ],
  testimonials: [
    {
      id: '1',
      author: 'Sarah Johnson',
      role: 'Volunteer',
      content: 'Volunteering with Green Earth has been an incredible experience. The team is passionate, organized, and truly makes a difference in our community.',
      rating: 5,
      date: '2024-12-15',
    },
    {
      id: '2',
      author: 'Mike Chen',
      role: 'Volunteer',
      content: 'I love how they make it easy to contribute to environmental causes. Every event is well-planned and impactful.',
      rating: 5,
      date: '2024-11-20',
    },
  ],
};

export default function OrganizationProfile() {
  const { id } = useParams<{ id: string }>();

  // TODO: Replace with actual API call
  const { data: organization, isLoading } = useQuery({
    queryKey: ['organization', id],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockOrganization;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="h-64 w-full" />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Organization not found</h1>
        <Button asChild>
          <Link to="/opportunities">Browse Opportunities</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80">
        <img
          src={organization.cover_image}
          alt={organization.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Organization Header */}
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative -mt-20 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    <img
                      src={organization.logo_url}
                      alt={organization.name}
                      className="w-24 h-24 rounded-lg bg-white shadow-sm"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h1 className="text-2xl font-bold">{organization.name}</h1>
                          {organization.is_verified && (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-3">{organization.type} • Founded {organization.founded_year}</p>
                        <div className="flex items-center gap-2 text-sm">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{organization.stats.rating_average}</span>
                          <span className="text-muted-foreground">({organization.stats.rating_count} reviews)</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button>
                          <Heart className="mr-2 h-4 w-4" />
                          Follow
                        </Button>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid md:grid-cols-3 gap-4 mt-6">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{organization.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Website
                          <ExternalLink className="inline ml-1 h-3 w-3" />
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <a href={`mailto:${organization.email}`} className="text-primary hover:underline">
                          {organization.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{organization.stats.total_opportunities}</p>
                <p className="text-sm text-muted-foreground">Total Opportunities</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{organization.stats.active_opportunities}</p>
                <p className="text-sm text-muted-foreground">Active Now</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{organization.stats.total_volunteers}</p>
                <p className="text-sm text-muted-foreground">Volunteers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{organization.stats.total_hours.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Hours Contributed</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="about" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>About {organization.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{organization.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Mission</h3>
                    <p className="text-muted-foreground">{organization.mission}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Impact Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {organization.impact_areas.map((area) => (
                        <Badge key={area} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="opportunities" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Active Opportunities</h2>
                <Button asChild variant="outline">
                  <Link to={`/opportunities?organization=${organization.id}`}>
                    View All
                  </Link>
                </Button>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {organization.recent_opportunities.map((opp) => (
                  <Card key={opp.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={opp.image}
                      alt={opp.title}
                      className="h-48 w-full object-cover"
                    />
                    <CardHeader>
                      <CardTitle className="text-lg">{opp.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Starts {new Date(opp.start_date).toLocaleDateString()}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {opp.location}
                        </p>
                        <p className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {opp.volunteers_needed} volunteers needed
                        </p>
                      </div>
                      <Button asChild className="w-full mt-4">
                        <Link to={`/opportunities/${opp.id}`}>Learn More</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Volunteer Reviews</CardTitle>
                  <CardDescription>
                    What volunteers say about their experience with {organization.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {organization.testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border-b last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(testimonial.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{testimonial.content}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}