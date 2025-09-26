import { useQuery } from '@tanstack/react-query';
import { skillsApi } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SkillMatchBreakdownProps {
  opportunityId: number;
  requiredSkills: Array<{ name: string }>;
  matchScore?: number;
}

export function SkillMatchBreakdown({ opportunityId, requiredSkills, matchScore }: SkillMatchBreakdownProps) {
  const { data: mySkills } = useQuery({
    queryKey: ['mySkills'],
    queryFn: () => skillsApi.getMySkills(),
  });

  if (!mySkills || requiredSkills.length === 0) {
    return null;
  }

  const mySkillNames = new Set(mySkills.map(s => s.skill.name.toLowerCase()));
  const matchedSkills = requiredSkills.filter(skill => 
    mySkillNames.has(skill.name.toLowerCase())
  );
  const missingSkills = requiredSkills.filter(skill => 
    !mySkillNames.has(skill.name.toLowerCase())
  );

  const calculatedScore = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  const displayScore = matchScore ?? calculatedScore;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Skill Match Analysis
          </span>
          <Badge 
            variant={displayScore >= 80 ? "default" : displayScore >= 50 ? "secondary" : "outline"}
            className="text-lg px-3 py-1"
          >
            {displayScore}% Match
          </Badge>
        </CardTitle>
        <CardDescription>
          See how your skills align with this opportunity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Match Score</span>
            <span className="text-sm text-muted-foreground">
              {matchedSkills.length} of {requiredSkills.length} skills matched
            </span>
          </div>
          <Progress value={displayScore} className="h-2" />
        </div>

        {matchedSkills.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Skills You Have
            </h4>
            <div className="flex flex-wrap gap-2">
              {matchedSkills.map((skill) => (
                <Badge key={skill.name} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {missingSkills.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-700 dark:text-orange-400">
              <XCircle className="h-4 w-4" />
              Skills to Develop
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <Badge key={skill.name} variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-700 dark:text-orange-400">
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {displayScore < 100 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-3">
              Don't have all the required skills? You can still apply! Many organizations provide training.
            </p>
            {mySkills.length === 0 && (
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to="/profile?tab=profile">
                  Add Your Skills
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}