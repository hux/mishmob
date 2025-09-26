import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillsApi, UserSkillInfo } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, X, Search, Star, TrendingUp } from 'lucide-react';

export function SkillsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [proficiencyLevel, setProficiencyLevel] = useState('intermediate');

  // Fetch user's skills
  const { data: mySkills, isLoading } = useQuery({
    queryKey: ['mySkills'],
    queryFn: () => skillsApi.getMySkills(),
  });

  // Search skills
  const { data: searchResults } = useQuery({
    queryKey: ['searchSkills', searchQuery],
    queryFn: () => skillsApi.searchSkills(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  // Get popular skills
  const { data: popularSkills } = useQuery({
    queryKey: ['popularSkills'],
    queryFn: () => skillsApi.getPopularSkills(6),
  });

  // Add skill mutation
  const addSkillMutation = useMutation({
    mutationFn: ({ skillName, proficiency }: { skillName: string; proficiency: string }) =>
      skillsApi.addSkill(skillName, proficiency),
    onSuccess: () => {
      toast({
        title: 'Skill added',
        description: 'Your skill has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['mySkills'] });
      setIsAddingSkill(false);
      setSelectedSkill('');
      setSearchQuery('');
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to add skill',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  // Remove skill mutation
  const removeSkillMutation = useMutation({
    mutationFn: (skillId: number) => skillsApi.removeSkill(skillId),
    onSuccess: () => {
      toast({
        title: 'Skill removed',
        description: 'The skill has been removed from your profile.',
      });
      queryClient.invalidateQueries({ queryKey: ['mySkills'] });
    },
    onError: () => {
      toast({
        title: 'Failed to remove skill',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  // Update proficiency mutation
  const updateProficiencyMutation = useMutation({
    mutationFn: ({ skillId, level }: { skillId: number; level: string }) =>
      skillsApi.updateProficiency(skillId, level),
    onSuccess: () => {
      toast({
        title: 'Proficiency updated',
        description: 'Your skill proficiency has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['mySkills'] });
    },
  });

  const handleAddSkill = () => {
    if (!selectedSkill) {
      toast({
        title: 'Please select a skill',
        variant: 'destructive',
      });
      return;
    }

    addSkillMutation.mutate({
      skillName: selectedSkill,
      proficiency: proficiencyLevel,
    });
  };

  const proficiencyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800',
    expert: 'bg-orange-100 text-orange-800',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Skills & Expertise</CardTitle>
            <CardDescription>
              Add your skills to get better matched opportunities
            </CardDescription>
          </div>
          <Dialog open={isAddingSkill} onOpenChange={setIsAddingSkill}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a New Skill</DialogTitle>
                <DialogDescription>
                  Search for a skill or add a custom one
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="skill-search">Search Skills</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="skill-search"
                      placeholder="e.g. Python, Project Management, Teaching..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSelectedSkill(e.target.value);
                      }}
                      className="pl-9"
                    />
                  </div>
                  
                  {searchResults && searchResults.length > 0 && (
                    <div className="mt-2 border rounded-md max-h-32 overflow-y-auto">
                      {searchResults.map((skill) => (
                        <button
                          key={skill.id}
                          onClick={() => {
                            setSelectedSkill(skill.name);
                            setSearchQuery(skill.name);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                        >
                          {skill.name}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({skill.category})
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="proficiency">Proficiency Level</Label>
                  <Select
                    value={proficiencyLevel}
                    onValueChange={setProficiencyLevel}
                  >
                    <SelectTrigger id="proficiency" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {popularSkills && popularSkills.length > 0 && !searchQuery && (
                  <div>
                    <Label>Popular Skills</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {popularSkills.map((item) => (
                        <Badge
                          key={item.skill.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-secondary"
                          onClick={() => {
                            setSelectedSkill(item.skill.name);
                            setSearchQuery(item.skill.name);
                          }}
                        >
                          <TrendingUp className="mr-1 h-3 w-3" />
                          {item.skill.name}
                          <span className="text-xs ml-1 text-muted-foreground">
                            ({item.user_count})
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleAddSkill}
                  className="w-full"
                  disabled={!selectedSkill || addSkillMutation.isPending}
                >
                  {addSkillMutation.isPending ? 'Adding...' : 'Add Skill'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
          </div>
        ) : mySkills && mySkills.length > 0 ? (
          <div className="space-y-3">
            {mySkills.map((userSkill) => (
              <div
                key={userSkill.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-medium">{userSkill.skill.name}</span>
                    {userSkill.is_verified && (
                      <Star className="inline ml-2 h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <Select
                    value={userSkill.proficiency_level || 'intermediate'}
                    onValueChange={(value) =>
                      updateProficiencyMutation.mutate({
                        skillId: userSkill.skill.id,
                        level: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSkillMutation.mutate(userSkill.skill.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No skills added yet. Add your skills to get better matched opportunities!
            </p>
            <Button
              variant="outline"
              onClick={() => setIsAddingSkill(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Skill
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}