import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Heart, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-hero rounded-lg p-2">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">MishMob</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#opportunities" className="text-muted-foreground hover:text-foreground transition-smooth">
              Find Opportunities
            </a>
            <a href="#for-hosts" className="text-muted-foreground hover:text-foreground transition-smooth">
              For Organizations
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-smooth">
              How It Works
            </a>
            <a href="#impact" className="text-muted-foreground hover:text-foreground transition-smooth">
              Impact
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-smooth"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fade-in">
          <div className="px-4 py-4 space-y-4">
            <a href="#opportunities" className="block py-2 text-muted-foreground hover:text-foreground transition-smooth">
              Find Opportunities
            </a>
            <a href="#for-hosts" className="block py-2 text-muted-foreground hover:text-foreground transition-smooth">
              For Organizations
            </a>
            <a href="#how-it-works" className="block py-2 text-muted-foreground hover:text-foreground transition-smooth">
              How It Works
            </a>
            <a href="#impact" className="block py-2 text-muted-foreground hover:text-foreground transition-smooth">
              Impact
            </a>
            <div className="pt-4 border-t border-border space-y-2">
              <Button variant="ghost" className="w-full justify-start" size="sm">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
              <Button variant="hero" className="w-full" size="sm">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;