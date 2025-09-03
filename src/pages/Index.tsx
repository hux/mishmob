import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/ui/navigation";
import OpportunityCard from "@/components/ui/opportunity-card";
import { 
  Heart, 
  Users, 
  Target, 
  TrendingUp, 
  MapPin, 
  BookOpen, 
  Award,
  ArrowRight,
  Star,
  CheckCircle2
} from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";
import skillsImage from "@/assets/skills-matching.jpg";
import impactImage from "@/assets/impact-dashboard.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Mobilize Your
                  <span className="bg-gradient-hero bg-clip-text text-transparent"> Purpose</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  Connect with meaningful opportunities that match your unique skills. 
                  Build stronger communities through purposeful action, one mission at a time.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="xl">
                  Find Your Mission
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="xl">
                  For Organizations
                </Button>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-hero border-2 border-background" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">2,500+ active volunteers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-secondary text-secondary" />
                  <span className="text-sm font-medium">4.9/5 rating</span>
                </div>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <img 
                src={heroImage} 
                alt="Community volunteers working together"
                className="w-full rounded-2xl shadow-strong"
              />
              <div className="absolute inset-0 bg-gradient-hero opacity-20 rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How MishMob Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We match your unique skills with opportunities where you can make real impact
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="h-8 w-8" />,
                title: "Discover Your Match",
                description: "Our AI-powered system analyzes your skills and interests to find perfect volunteer opportunities."
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Join & Contribute",
                description: "Connect with like-minded volunteers and start making meaningful impact in your community."
              },
              {
                icon: <TrendingUp className="h-8 w-8" />,
                title: "Grow & Lead",
                description: "Develop new skills, track your impact, and unlock leadership opportunities."
              }
            ].map((step, index) => (
              <Card key={index} className="text-center p-8 bg-gradient-card border-border/50 hover:shadow-medium transition-smooth">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Matching Feature */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src={skillsImage} 
                alt="Skills matching visualization"
                className="w-full rounded-2xl shadow-medium"
              />
            </div>
            <div className="space-y-6 order-1 lg:order-2">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Smart Skills Matching
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Upload your resume or connect LinkedIn to get personalized opportunity recommendations 
                  based on your unique skillset and career goals.
                </p>
              </div>
              
              <div className="space-y-4">
                {[
                  "AI-powered skill extraction and matching",
                  "Opportunities to develop new competencies",
                  "Verification and endorsements from hosts",
                  "Skills-based learning pathways"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button variant="default" size="lg">
                Discover Your Skills
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Opportunities */}
      <section id="opportunities" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Featured Opportunities
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover meaningful ways to make impact in your community
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <OpportunityCard
              title="Community Garden Leadership"
              organization="Green City Initiative"
              description="Lead a team to establish sustainable gardens in underserved neighborhoods, teaching families to grow their own fresh produce."
              location="Downtown District"
              timeCommitment="10 hrs/week"
              spotsAvailable={3}
              skills={["Project Management", "Agriculture", "Community Outreach"]}
              rating={4.8}
              isUrgent={true}
            />
            <OpportunityCard
              title="Digital Literacy Training"
              organization="Tech for All"
              description="Teach essential computer and internet skills to seniors and low-income families to bridge the digital divide."
              location="Community Center"
              timeCommitment="4 hrs/week"
              spotsAvailable={8}
              skills={["Teaching", "Technology", "Patience"]}
              rating={4.9}
            />
            <OpportunityCard
              title="Youth Mentorship Program"
              organization="Future Leaders Foundation"
              description="Mentor at-risk youth in career planning, academic success, and life skills development."
              location="Various Schools"
              timeCommitment="6 hrs/week"
              spotsAvailable={12}
              skills={["Mentoring", "Communication", "Leadership"]}
              rating={4.7}
            />
          </div>
          
          <div className="text-center">
            <Button variant="outline" size="lg">
              View All Opportunities
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Impact Dashboard */}
      <section id="impact" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Track Your Impact
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  See the real difference you're making with detailed metrics, 
                  community feedback, and milestone tracking.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: "Volunteer Hours", value: "15K+", icon: <Heart /> },
                  { label: "Lives Impacted", value: "3.2K", icon: <Users /> },
                  { label: "Projects Completed", value: "450+", icon: <Award /> },
                  { label: "Skills Developed", value: "1.8K", icon: <BookOpen /> }
                ].map((stat, index) => (
                  <div key={index} className="text-center space-y-2">
                    <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent mx-auto">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <img 
                src={impactImage} 
                alt="Impact dashboard showing community metrics"
                className="w-full rounded-2xl shadow-medium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* For Organizations CTA */}
      <section id="for-hosts" className="py-20 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Mobilize Your Community Impact
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Connect with skilled volunteers who are passionate about your cause. 
              Our platform helps you build stronger teams and achieve greater impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl">
                Host Opportunities
                <ArrowRight className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="xl">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-hero rounded-lg p-2">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">MishMob</span>
              </div>
              <p className="text-muted-foreground">
                Mobilizing purpose, meaning, and belonging through community action.
              </p>
            </div>
            
            {[
              {
                title: "Platform",
                links: ["Find Opportunities", "For Organizations", "How It Works", "Impact Stories"]
              },
              {
                title: "Resources",
                links: ["Getting Started", "Skills Assessment", "Training Hub", "Support"]
              },
              {
                title: "Community",
                links: ["Events", "Blog", "Newsletter", "Contact Us"]
              }
            ].map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="font-semibold">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-muted-foreground hover:text-background transition-smooth">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-border/20 mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 MishMob. Building stronger communities through purposeful action.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
