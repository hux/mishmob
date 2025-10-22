import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, Plus, Search, Loader2, Zap } from 'lucide-react';

interface QuickWinsStepProps {
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

export function QuickWinsStep({ data, updateData }: QuickWinsStepProps) {
  const [commonSkills, setCommonSkills] = useState<SkillSuggestion[]>([]);
  const [searchResults, setSearchResults] = useState<SkillSuggestion[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const selectedSkills = data.selectedSkills || [];

  useEffect(() => {
    // Fetch common skills
    fetch('/api/skills-assessment/common-skills')
      .then(res => res.json())
      .then(skills => {
        setCommonSkills(skills);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load common skills:', err);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setIsSearching(true);
      // Debounce search
      const timer = setTimeout(() => {
        fetch(`/api/skills/search?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(results => {
            setSearchResults(results.map((r: any) => ({
              id: r.id,
              name: r.name,
              category: r.category,
              reason: 'Search result',
              popularity: 0,
              is_common: false
            })));
            setIsSearching(false);
          })
          .catch(() => setIsSearching(false));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const toggleSkill = (skill: SkillSuggestion) => {
    const existing = selectedSkills.find((s: any) => s.id === skill.id);

    if (existing) {
      // Remove skill
      updateData(
        'selectedSkills',
        selectedSkills.filter((s: any) => s.id !== skill.id)
      );
    } else {
      // Add skill with intermediate proficiency
      updateData('selectedSkills', [
        ...selectedSkills,
        {
          id: skill.id,
          name: skill.name,
          category: skill.category,
          proficiency_level: 'intermediate'
        }
      ]);
    }
  };

  const isSkillSelected = (skillId: string) => {
    return selectedSkills.some((s: any) => s.id === skillId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <p className="text-sm font-medium">
            Great! Here are some skills you might already have:
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Tap to confirm or deselect. These are common skills most volunteers have.
        </p>
      </div>

      {/* Common skills grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {commonSkills.map((skill, index) => {
          const isSelected = isSkillSelected(skill.id);

          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                onClick={() => toggleSkill(skill)}
                className={cn(
                  "p-3 cursor-pointer transition-all hover:scale-105",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium truncate">
                    {skill.name}
                  </span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring' }}
                    >
                      <Check className="h-4 w-4 flex-shrink-0" />
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Search section */}
      <div className="space-y-3 pt-4 border-t">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for more skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {isSearching && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {searchResults.length > 0 && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {searchResults.map(skill => {
              const isSelected = isSkillSelected(skill.id);

              return (
                <Card
                  key={skill.id}
                  onClick={() => toggleSkill(skill)}
                  className={cn(
                    "p-3 cursor-pointer transition-all hover:bg-accent",
                    isSelected && "bg-primary/10 border-primary"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm">{skill.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {skill.category}
                      </Badge>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Counter */}
      {selectedSkills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <Card className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                  {selectedSkills.length}
                </Badge>
                <span className="text-sm font-medium">
                  {selectedSkills.length === 1 ? 'skill' : 'skills'} selected
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Looking good! 🎉
              </span>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
