import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { X, Plus, Search, PartyPopper, Edit2 } from 'lucide-react';

interface ReviewStepProps {
  data: any;
  updateData: (field: string, value: any) => void;
  onNext: () => void;
}

const PROFICIENCY_CONFIG = {
  beginner: { emoji: '🌱', label: 'Learning', color: 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300' },
  intermediate: { emoji: '💪', label: 'Can Do', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-300' },
  advanced: { emoji: '⭐', label: 'Strong', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-300' },
  expert: { emoji: '🏆', label: 'Expert', color: 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300' },
};

export function ReviewStep({ data, updateData }: ReviewStepProps) {
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);

  const selectedSkills = data.selectedSkills || [];

  const removeSkill = (skillId: string) => {
    updateData(
      'selectedSkills',
      selectedSkills.filter((s: any) => s.id !== skillId)
    );
  };

  const updateProficiency = (skillId: string, newProficiency: string) => {
    updateData(
      'selectedSkills',
      selectedSkills.map((s: any) =>
        s.id === skillId ? { ...s, proficiency_level: newProficiency } : s
      )
    );
    setEditingSkillId(null);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      try {
        const res = await fetch(`/api/skills/search?q=${encodeURIComponent(query)}`);
        const results = await res.json();
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      }
    } else {
      setSearchResults([]);
    }
  };

  const addSkill = (skill: any, proficiency: string = 'intermediate') => {
    updateData('selectedSkills', [
      ...selectedSkills,
      {
        id: skill.id,
        name: skill.name,
        category: skill.category,
        proficiency_level: proficiency
      }
    ]);
    setSearchQuery('');
    setSearchResults([]);
    setIsAddingSkill(false);
  };

  // Group skills by category
  const skillsByCategory = selectedSkills.reduce((acc: any, skill: any) => {
    const category = skill.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(skill);
    return acc;
  }, {});

  const categories = Object.keys(skillsByCategory);

  return (
    <div className="space-y-6">
      {selectedSkills.length > 0 ? (
        <>
          <div className="text-center space-y-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="text-6xl mb-2"
            >
              <PartyPopper className="h-16 w-16 mx-auto text-primary" />
            </motion.div>
            <h3 className="text-2xl font-bold">
              You've added {selectedSkills.length} skill{selectedSkills.length !== 1 && 's'}!
            </h3>
            <p className="text-muted-foreground">
              Here's your profile. You can edit proficiency levels or add more skills.
            </p>
          </div>

          {/* Skills by category */}
          <div className="space-y-4">
            {categories.map((category, categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold capitalize text-muted-foreground">
                    {category} Skills
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {skillsByCategory[category].map((skill: any, index: number) => {
                      const proficiency = PROFICIENCY_CONFIG[skill.proficiency_level as keyof typeof PROFICIENCY_CONFIG] || PROFICIENCY_CONFIG.intermediate;
                      const isEditing = editingSkillId === skill.id;

                      return (
                        <motion.div
                          key={skill.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="font-medium truncate">{skill.name}</span>

                                {isEditing ? (
                                  <Select
                                    value={skill.proficiency_level}
                                    onValueChange={(value) => updateProficiency(skill.id, value)}
                                  >
                                    <SelectTrigger className="w-32 h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(PROFICIENCY_CONFIG).map(([value, config]) => (
                                        <SelectItem key={value} value={value}>
                                          <span className="flex items-center gap-2">
                                            <span>{config.emoji}</span>
                                            <span>{config.label}</span>
                                          </span>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className={cn("text-xs cursor-pointer", proficiency.color)}
                                    onClick={() => setEditingSkillId(skill.id)}
                                  >
                                    <span className="mr-1">{proficiency.emoji}</span>
                                    {proficiency.label}
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => setEditingSkillId(skill.id)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => removeSkill(skill.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold">No skills added yet</h3>
          <p className="text-muted-foreground">
            Go back and add some skills, or add them manually below.
          </p>
        </div>
      )}

      {/* Add more skills */}
      <div className="pt-4 border-t">
        {!isAddingSkill ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAddingSkill(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add More Skills
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for skills..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {searchResults
                  .filter((result) => !selectedSkills.some((s: any) => s.id === result.id))
                  .map((skill) => (
                    <Card
                      key={skill.id}
                      onClick={() => addSkill(skill)}
                      className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-sm">{skill.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {skill.category}
                          </Badge>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setIsAddingSkill(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
