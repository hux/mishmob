import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  Search,
  Tag,
  TrendingUp,
  Heart,
  Users,
  BookOpen,
} from 'lucide-react';

// Mock blog posts data
const blogPosts = [
  {
    id: '1',
    title: 'The Rising Trend of Skills-Based Volunteering',
    excerpt: 'Discover how professionals are using their expertise to make a bigger impact through strategic volunteering.',
    author: 'Sarah Johnson',
    date: '2025-01-20',
    readTime: '5 min read',
    category: 'Trends',
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80',
    featured: true,
  },
  {
    id: '2',
    title: '10 Ways Volunteering Boosts Your Mental Health',
    excerpt: 'Research shows that helping others has profound benefits for your own wellbeing. Here\'s what you need to know.',
    author: 'Dr. Michael Chen',
    date: '2025-01-18',
    readTime: '7 min read',
    category: 'Wellness',
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3d66f4f?w=800&q=80',
    featured: false,
  },
  {
    id: '3',
    title: 'Building Stronger Communities Through Youth Engagement',
    excerpt: 'How organizations are successfully engaging Gen Z volunteers and creating lasting community impact.',
    author: 'Emily Rodriguez',
    date: '2025-01-15',
    readTime: '6 min read',
    category: 'Community',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
    featured: true,
  },
  {
    id: '4',
    title: 'Virtual Volunteering: Making an Impact from Anywhere',
    excerpt: 'The pandemic changed volunteering forever. Learn about the best remote volunteer opportunities available today.',
    author: 'David Kim',
    date: '2025-01-12',
    readTime: '4 min read',
    category: 'Technology',
    image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&q=80',
    featured: false,
  },
  {
    id: '5',
    title: 'Corporate Volunteering Programs That Actually Work',
    excerpt: 'Best practices for companies looking to create meaningful employee volunteer programs.',
    author: 'Lisa Thompson',
    date: '2025-01-10',
    readTime: '8 min read',
    category: 'Corporate',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    featured: false,
  },
  {
    id: '6',
    title: 'The Environmental Volunteer\'s Guide to 2025',
    excerpt: 'Top environmental causes and how you can contribute to sustainability efforts in your community.',
    author: 'James Wilson',
    date: '2025-01-08',
    readTime: '6 min read',
    category: 'Environment',
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
    featured: false,
  },
];

const categories = [
  { name: 'All Posts', count: 24 },
  { name: 'Community', count: 8 },
  { name: 'Trends', count: 6 },
  { name: 'Wellness', count: 4 },
  { name: 'Technology', count: 3 },
  { name: 'Corporate', count: 2 },
  { name: 'Environment', count: 1 },
];

const popularTags = [
  'volunteering',
  'community',
  'impact',
  'skills-based',
  'mental-health',
  'youth',
  'environment',
  'virtual',
  'corporate-giving',
];

export function Blog() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">MishMob Blog</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Stories, insights, and resources for volunteers and organizations 
            making a difference in their communities
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                className="pl-10 h-12"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {/* Blog Posts */}
            <div className="lg:col-span-3 space-y-8">
              {/* Featured Post */}
              {blogPosts.filter(post => post.featured).slice(0, 1).map(post => (
                <Card key={post.id} className="overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-2/5">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="md:w-3/5 p-6 md:p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="secondary">{post.category}</Badge>
                        <Badge variant="outline">Featured</Badge>
                      </div>
                      <h2 className="text-2xl font-bold mb-3">
                        <Link to={`/blog/${post.id}`} className="hover:text-primary">
                          {post.title}
                        </Link>
                      </h2>
                      <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {post.readTime}
                        </span>
                      </div>
                      <Button asChild variant="link" className="p-0">
                        <Link to={`/blog/${post.id}`}>
                          Read More
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Regular Posts Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {blogPosts.filter(post => !post.featured).map(post => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-48 w-full object-cover"
                    />
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{post.category}</Badge>
                      </div>
                      <CardTitle className="text-xl">
                        <Link to={`/blog/${post.id}`} className="hover:text-primary">
                          {post.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {post.readTime}
                          </span>
                        </div>
                        <Link 
                          to={`/blog/${post.id}`}
                          className="text-primary hover:underline flex items-center"
                        >
                          Read
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex justify-center gap-2 pt-8">
                <Button variant="outline" disabled>Previous</Button>
                <Button variant="outline">1</Button>
                <Button variant="default">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Next</Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {categories.map((category) => (
                      <li key={category.name}>
                        <Link
                          to={`/blog?category=${category.name.toLowerCase()}`}
                          className="flex items-center justify-between text-sm hover:text-primary"
                        >
                          <span>{category.name}</span>
                          <Badge variant="secondary">{category.count}</Badge>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Popular Tags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Popular Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Newsletter Signup */}
              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle className="text-lg">Stay Updated</CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    Get the latest volunteer stories and insights delivered to your inbox
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Input
                      type="email"
                      placeholder="Your email"
                      className="bg-white text-foreground"
                    />
                    <Button variant="secondary" className="w-full">
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/volunteer-guide" className="text-sm hover:text-primary flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Volunteer Guide
                      </Link>
                    </li>
                    <li>
                      <Link to="/host-guide" className="text-sm hover:text-primary flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Organization Guide
                      </Link>
                    </li>
                    <li>
                      <Link to="/impact" className="text-sm hover:text-primary flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Our Impact
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}