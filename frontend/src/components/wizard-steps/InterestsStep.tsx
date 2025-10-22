import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface InterestsStepProps {
  data: any;
  updateData: (field: string, value: any) => void;
  onNext: () => void;
}

interface InterestArea {
  id: string;
  name: string;
  icon: string;
  description: string;
  related_skills: string[];
}

export function InterestsStep({ data, updateData }: InterestsStepProps) {
  const [interestAreas, setInterestAreas] = useState<InterestArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedInterests = data.selectedInterests || [];

  useEffect(() => {
    // Fetch interest areas from API
    fetch('/api/skills-assessment/interest-areas')
      .then(res => res.json())
      .then(areas => {
        setInterestAreas(areas);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load interest areas:', err);
        setIsLoading(false);
      });
  }, []);

  const toggleInterest = (id: string) => {
    const updated = selectedInterests.includes(id)
      ? selectedInterests.filter((i: string) => i !== id)
      : [...selectedInterests, id];
    updateData('selectedInterests', updated);
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
        <p className="text-sm font-medium">
          What areas excite you?{' '}
          <span className="text-muted-foreground font-normal">
            (Select all that apply)
          </span>
        </p>
        {selectedInterests.length > 0 && (
          <Badge variant="secondary">
            {selectedInterests.length} selected
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {interestAreas.map((area, index) => {
          const isSelected = selectedInterests.includes(area.id);

          return (
            <motion.div
              key={area.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                onClick={() => toggleInterest(area.id)}
                className={cn(
                  "p-4 cursor-pointer transition-all hover:scale-[1.02]",
                  isSelected
                    ? "bg-primary/10 border-primary border-2 shadow-md"
                    : "border-2 border-transparent hover:border-border"
                )}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-3xl" role="img" aria-label={area.name}>
                      {area.icon}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-primary text-primary-foreground rounded-full p-1"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm">{area.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {area.description}
                    </p>
                  </div>

                  {/* Preview skills */}
                  {isSelected && area.related_skills.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-2"
                    >
                      <div className="flex flex-wrap gap-1">
                        {area.related_skills.slice(0, 3).map(skill => (
                          <Badge
                            key={skill}
                            variant="outline"
                            className="text-xs bg-background"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {area.related_skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{area.related_skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {selectedInterests.length === 0 && (
        <p className="text-sm text-center text-muted-foreground italic">
          💡 Tip: Select at least one area to get personalized skill suggestions
        </p>
      )}
    </div>
  );
}
