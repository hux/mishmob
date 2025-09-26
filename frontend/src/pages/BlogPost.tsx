import { useParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  User,
  ChevronLeft,
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  Twitter,
  Facebook,
  Linkedin,
} from 'lucide-react';

// Mock blog post data
const mockBlogPost = {
  id: '1',
  title: 'The Rising Trend of Skills-Based Volunteering',
  excerpt: 'Discover how professionals are using their expertise to make a bigger impact through strategic volunteering.',
  content: `
    <p>In recent years, we've witnessed a significant shift in how professionals approach volunteering. Gone are the days when volunteering meant only manual labor or simple tasks. Today's volunteers are increasingly seeking opportunities to apply their professional skills to create meaningful change in their communities.</p>

    <h2>What is Skills-Based Volunteering?</h2>
    <p>Skills-based volunteering, also known as pro bono service, involves volunteers applying their professional expertise to help nonprofit organizations and community projects. This can range from marketing professionals helping with campaigns to software developers building websites for charities.</p>

    <h3>The Benefits Are Multifaceted</h3>
    <p>For volunteers, skills-based volunteering offers several advantages:</p>
    <ul>
      <li><strong>Professional Development:</strong> Volunteers can develop new skills and gain experience in different contexts</li>
      <li><strong>Networking:</strong> Connect with like-minded professionals and expand your network</li>
      <li><strong>Greater Impact:</strong> Use your expertise to create lasting change</li>
      <li><strong>Personal Satisfaction:</strong> The fulfillment of using your talents for good</li>
    </ul>

    <h2>Impact on Nonprofit Organizations</h2>
    <p>Nonprofits benefit tremendously from skills-based volunteers. These organizations often operate with limited budgets and can't always afford specialized services. When professionals volunteer their expertise, nonprofits can:</p>
    <ul>
      <li>Access high-quality professional services</li>
      <li>Implement more sophisticated strategies</li>
      <li>Improve their operations and efficiency</li>
      <li>Expand their reach and impact</li>
    </ul>

    <blockquote>
      "Skills-based volunteering has transformed how we operate. Having access to professional expertise has allowed us to scale our impact in ways we never imagined possible."
      <cite>- Sarah Chen, Executive Director, Community Tech Initiative</cite>
    </blockquote>

    <h2>Getting Started with Skills-Based Volunteering</h2>
    <p>If you're interested in skills-based volunteering, here are some steps to get started:</p>
    <ol>
      <li><strong>Identify Your Skills:</strong> List your professional skills and consider which ones could benefit nonprofits</li>
      <li><strong>Research Organizations:</strong> Look for nonprofits whose missions align with your values</li>
      <li><strong>Start Small:</strong> Begin with short-term projects to find the right fit</li>
      <li><strong>Be Clear About Commitment:</strong> Communicate your availability and boundaries upfront</li>
      <li><strong>Measure Your Impact:</strong> Track the outcomes of your volunteer work</li>
    </ol>

    <h2>The Future of Volunteering</h2>
    <p>As we look ahead, skills-based volunteering is poised to become even more prevalent. With remote work becoming normalized, professionals have more flexibility to volunteer their time and expertise. Platforms like MishMob are making it easier than ever to match skilled professionals with organizations that need their help.</p>

    <p>The future of volunteering is bright, and it's increasingly professional. By leveraging our skills for social good, we can create a more equitable and sustainable world while also growing personally and professionally.</p>
  `,
  author: {
    name: 'Sarah Johnson',
    role: 'Content Director',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'Sarah has been writing about volunteering and social impact for over 10 years.',
  },
  date: '2025-01-20',
  readTime: '5 min read',
  category: 'Trends',
  tags: ['skills-based volunteering', 'professional development', 'social impact'],
  image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80',
  relatedPosts: [
    {
      id: '2',
      title: '10 Ways Volunteering Boosts Your Mental Health',
      excerpt: 'Research shows that helping others has profound benefits for your own wellbeing.',
      image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3d66f4f?w=400&q=80',
      category: 'Wellness',
      date: '2025-01-18',
    },
    {
      id: '3',
      title: 'Building Stronger Communities Through Youth Engagement',
      excerpt: 'How organizations are successfully engaging Gen Z volunteers.',
      image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80',
      category: 'Community',
      date: '2025-01-15',
    },
  ],
};

export function BlogPost() {
  const { id } = useParams<{ id: string }>();
  // In a real app, fetch the blog post based on the ID
  const post = mockBlogPost;

  const shareUrl = window.location.href;
  const shareTitle = post.title;

  const handleShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Image */}
      <div className="relative h-[400px] md:h-[500px]">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <div className="absolute top-8 left-8">
          <Button asChild variant="secondary" size="sm">
            <Link to="/blog">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 md:p-12">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.readTime}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-6">{post.title}</h1>

              {/* Author */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback>
                    {post.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <p className="text-sm text-muted-foreground">{post.author.role}</p>
                </div>
              </div>

              {/* Article Content */}
              <div 
                className="prose prose-gray dark:prose-invert max-w-none mb-8"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Share Actions */}
              <div className="flex items-center justify-between py-6 border-y">
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Bookmark className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2">Share:</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare('twitter')}
                  >
                    <Twitter className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare('facebook')}
                  >
                    <Facebook className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShare('linkedin')}
                  >
                    <Linkedin className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Author Bio */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 mt-8">
                <h3 className="font-semibold mb-3">About the Author</h3>
                <div className="flex gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>
                      {post.author.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{post.author.name}</p>
                    <p className="text-sm text-muted-foreground mb-2">{post.author.role}</p>
                    <p className="text-sm text-muted-foreground">{post.author.bio}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          <div className="mt-12 mb-16">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {post.relatedPosts.map((relatedPost) => (
                <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <img
                    src={relatedPost.image}
                    alt={relatedPost.title}
                    className="h-48 w-full object-cover"
                  />
                  <CardContent className="p-6">
                    <Badge variant="secondary" className="mb-3">
                      {relatedPost.category}
                    </Badge>
                    <h3 className="font-semibold mb-2">
                      <Link to={`/blog/${relatedPost.id}`} className="hover:text-primary">
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {relatedPost.excerpt}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(relatedPost.date).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}