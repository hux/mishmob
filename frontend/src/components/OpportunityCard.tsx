import { useQuery } from '@tanstack/react-query';
import { skillsApi } from '@/services/api';
import type { Opportunity } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Users, Star, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewDetails: (opportunity: Opportunity) => void;
}

export function OpportunityCard({ opportunity, onViewDetails }: OpportunityCardProps) {
  const { isAuthenticated, user } = useAuth();
  
  // Get user's skills for matching
  const { data: mySkills } = useQuery({
    queryKey: ['mySkills'],
    queryFn: () => skillsApi.getMySkills(),
    enabled: isAuthenticated && user?.user_type === 'volunteer',
  });

  const mySkillNames = mySkills ? new Set(mySkills.map(s => s.skill.name.toLowerCase())) : new Set();
  
  const getSkillBadgeVariant = (skill: string) => {
    if (mySkillNames.has(skill.toLowerCase())) {
      return "default";
    }
    return "outline";
  };

  const hasMatchedSkill = (skill: string) => {
    return mySkillNames.has(skill.toLowerCase());
  };

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer" 
      onClick={() => onViewDetails(opportunity)}
    >
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-xl line-clamp-2">{opportunity.title}</CardTitle>
          <div className="flex gap-2">
            {opportunity.match_score && (
              <Badge 
                variant={opportunity.match_score >= 80 ? "default" : opportunity.match_score >= 50 ? "secondary" : "outline"}
                className="shrink-0"
              >
                {opportunity.match_score}% match
              </Badge>
            )}
            {opportunity.featured && (
              <Badge variant="secondary" className="shrink-0">Featured</Badge>
            )}
          </div>
        </div>
        <CardDescription className="flex items-center gap-4 text-sm">
          <span className="font-medium truncate">{opportunity.organization}</span>
          {opportunity.rating > 0 && (
            <span className="flex items-center gap-1 shrink-0">
              <Star className="h-3 w-3 fill-current text-yellow-500" />
              {opportunity.rating.toFixed(1)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {opportunity.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {opportunity.skills.slice(0, 3).map((skill) => (
            <Badge 
              key={skill} 
              variant={getSkillBadgeVariant(skill)}
              className={hasMatchedSkill(skill) ? "relative" : "text-xs"}
            >
              {hasMatchedSkill(skill) && (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              )}
              {skill}
            </Badge>
          ))}
          {opportunity.skills.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{opportunity.skills.length - 3}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{opportunity.is_remote ? 'Remote' : opportunity.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span>{opportunity.commitment}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" />
            <span className={opportunity.spots_available <= 3 ? 'text-orange-600 font-medium' : ''}>
              {opportunity.spots_available > 0 ? `${opportunity.spots_available} spots available` : 'No spots available'}
            </span>
          </div>
        </div>

        <Button 
          className="w-full" 
          variant={opportunity.spots_available > 0 ? "default" : "secondary"}
          disabled={opportunity.spots_available === 0}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(opportunity);
          }}
        >
          {opportunity.spots_available > 0 ? 'Apply Now' : 'View Details'}
        </Button>
      </CardContent>
    </Card>
  );
}