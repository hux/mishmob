import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface OpportunityCardProps {
  title: string;
  organization: string;
  description: string;
  location: string;
  timeCommitment: string;
  spotsAvailable: number;
  skills: string[];
  rating: number;
  image?: string;
  isUrgent?: boolean;
  className?: string;
}

const OpportunityCard = ({
  title,
  organization,
  description,
  location,
  timeCommitment,
  spotsAvailable,
  skills,
  rating,
  image,
  isUrgent,
  className
}: OpportunityCardProps) => {
  return (
    <Card className={cn(
      "group hover:shadow-medium transition-smooth cursor-pointer overflow-hidden bg-gradient-card border-border/50",
      isUrgent && "ring-2 ring-secondary",
      className
    )}>
      {image && (
        <div className="aspect-video overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-smooth">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">{organization}</p>
          </div>
          {isUrgent && (
            <Badge variant="secondary" className="ml-2">
              Urgent
            </Badge>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
          {description}
        </p>
      </CardHeader>

      <CardContent className="py-0">
        <div className="space-y-3">
          {/* Location and Time */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{timeCommitment}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{spotsAvailable} spots left</span>
            </div>
            <div className="flex items-center gap-1 text-accent">
              <Star className="h-4 w-4 fill-current" />
              <span>{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-4">
        <Button 
          className="w-full group-hover:bg-primary-dark transition-smooth" 
          size="sm"
        >
          Apply Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OpportunityCard;