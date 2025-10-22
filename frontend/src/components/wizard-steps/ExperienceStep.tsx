import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, ChevronRight, Sparkles } from 'lucide-react';

interface ExperienceStepProps {
  data: any;
  updateData: (field: string, value: any) => void;
  onNext: () => void;
}

interface SkillSuggestion {
  id: string;
  name: string;
  category: string;
  reason: string;
  popularity: number;
  is_common: boolean;
}

const PROFICIENCY_LEVELS = [
  { value: 'beginner', label: 'Learning', emoji: '🌱', color: 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300' },
  { value: 'intermediate', label: 'Can Do', emoji: '💪', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300' },
  { value: 'advanced', label: 'Strong', emoji: '⭐', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300' },
  { value: 'expert', label: 'Expert', emoji: '🏆', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300' },
];

export function ExperienceStep({ data, updateData }: ExperienceStepProps) {
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  const selectedSkills = data.selectedSkills || [];
  const selectedInterests = data.selectedInterests || [];

  useEffect(() => {
    // Fetch skill suggestions based on interests
    if (selectedInterests.length > 0) {
      fetch('/api/skills-assessment/suggest-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interest_ids: selectedInterests })
      })
        .then(res => res.json())
        .then(skills => {
          // Filter out already selected skills
          const selectedIds = selectedSkills.map((s: any) => s.id);
          const filtered = skills.filter((s: SkillSuggestion) => !selectedIds.includes(s.id));
          setSuggestions(filtered);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Failed to load suggestions:', err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [selectedInterests]);

  const addSkillWithProficiency = (skill: SkillSuggestion, proficiency: string) => {
    updateData('selectedSkills', [
      ...selectedSkills,
      {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        proficiency_level: proficiency
      }
    ]);
  };

  const isSkillSelected = (skillId: string) => {
    return selectedSkills.some((s: any) => s.id === skillId);
  };

  // Group skills by category
  const skillsByCategory = suggestions.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillSuggestion[]>);

  const categories = Object.keys(skillsByCategory);
  const currentCategory = categories[currentCategoryIndex];
  const currentSkills = skillsByCategory[currentCategory] || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-lg font-semibold">You're doing great!</h3>
        <p className="text-muted-foreground">
          {selectedSkills.length > 0
            ? `You've added ${selectedSkills.length} skills. Ready to review?`
            : 'No additional suggestions right now. You can add skills manually or continue.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <p className="text-sm font-medium">
            Based on your interests, do you have experience with:
          </p>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {currentCategory} skills
          </Badge>
          <span className="text-xs text-muted-foreground">
            Category {currentCategoryIndex + 1} of {categories.length}
          </span>
        </div>
      </div>

      {/* Skills list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentCategory}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-3"
        >
          {currentSkills.slice(0, 6).map((skill, index) => {
            const isSelected = isSkillSelected(skill.id);

            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "p-4",
                  isSelected && "bg-accent border-primary"
                )}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{skill.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {skill.reason}
                        </p>
                      </div>
                      {isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          Added ✓
                        </Badge>
                      )}
                    </div>

                    {!isSelected && (
                      <div className="grid grid-cols-4 gap-2">
                        {PROFICIENCY_LEVELS.map((level) => (
                          <Button
                            key={level.value}
                            variant="outline"
                            size="sm"
                            onClick={() => addSkillWithProficiency(skill, level.value)}
                            className={cn(
                              "flex-col h-auto py-2 gap-1 transition-all hover:scale-105",
                              level.color
                            )}
                          >
                            <span className="text-lg">{level.emoji}</span>
                            <span className="text-xs">{level.label}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          variant="ghost"
          onClick={() => setCurrentCategoryIndex(Math.max(0, currentCategoryIndex - 1))}
          disabled={currentCategoryIndex === 0}
        >
          Previous
        </Button>

        {currentCategoryIndex < categories.length - 1 ? (
          <Button
            onClick={() => setCurrentCategoryIndex(currentCategoryIndex + 1)}
            className="gap-2"
          >
            Next Category
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Badge variant="outline" className="text-xs">
            All categories shown
          </Badge>
        )}
      </div>

      {/* Progress indicator */}
      <div className="flex gap-1 justify-center">
        {categories.map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all",
              index === currentCategoryIndex
                ? "w-8 bg-primary"
                : "w-1.5 bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}
