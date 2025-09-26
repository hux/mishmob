import { useQuery } from '@tanstack/react-query';
import { opportunitiesApi, skillsApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Users,
  Target,
  ChevronRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export function RecommendedOpportunities() {
  const { data, isLoading } = useQuery({
    queryKey: ['recommendedOpportunities'],
    queryFn: () => opportunitiesApi.getRecommendations({ page_size: 6 }),
  });

  const { data: mySkills } = useQuery({
    queryKey: ['mySkills'],
    queryFn: () => skillsApi.getMySkills(),
  });

  const mySkillNames = mySkills ? new Set(mySkills.map(s => s.skill.name.toLowerCase())) : new Set();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recommended for You
          </CardTitle>
          <CardDescription>
            Based on your skills and interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recommended for You
          </CardTitle>
          <CardDescription>
            Based on your skills and interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Add skills to your profile to get personalized recommendations
            </p>
            <Button asChild>
              <Link to="/profile?tab=profile">Add Skills</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Recommended for You
            </CardTitle>
            <CardDescription>
              Based on your skills and interests
            </CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/opportunities">
              View All
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.results.slice(0, 4).map((opportunity) => (
            <div
              key={opportunity.id}
              className="p-4 border rounded-lg hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <Link
                    to={`/opportunities/${opportunity.id}`}
                    className="font-semibold hover:text-primary"
                  >
                    {opportunity.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {opportunity.organization}
                  </p>
                </div>
                {opportunity.match_score && (
                  <Badge variant="secondary" className="ml-2">
                    <Target className="mr-1 h-3 w-3" />
                    {opportunity.match_score}% match
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {opportunity.skills.slice(0, 3).map((skill) => (
                  <Badge 
                    key={skill} 
                    variant={mySkillNames.has(skill.toLowerCase()) ? "default" : "outline"} 
                    className="text-xs"
                  >
                    {mySkillNames.has(skill.toLowerCase()) && (
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

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {opportunity.is_remote ? 'Remote' : opportunity.location}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {opportunity.commitment}
                </span>
                {opportunity.spots_available > 0 && (
                  <span className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {opportunity.spots_available} spots
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {data.results.length > 4 && (
          <div className="mt-4 text-center">
            <Button asChild variant="outline" className="w-full">
              <Link to="/opportunities">
                View More Recommendations
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}