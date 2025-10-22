import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Users, Lightbulb, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeStepProps {
  data: any;
  updateData: (field: string, value: any) => void;
  onNext: () => void;
}

const motivations = [
  {
    id: 'help',
    label: 'Help my community',
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800'
  },
  {
    id: 'learn',
    label: 'Learn new skills',
    icon: Lightbulb,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800'
  },
  {
    id: 'connect',
    label: 'Meet people',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800'
  },
  {
    id: 'explore',
    label: 'Exploring options',
    icon: Search,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800'
  }
];

export function WelcomeStep({ data, updateData, onNext }: WelcomeStepProps) {
  const selectedMotivations = data.motivation || [];

  const toggleMotivation = (id: string) => {
    const current = selectedMotivations;
    const updated = current.includes(id)
      ? current.filter((m: string) => m !== id)
      : [...current, id];
    updateData('motivation', updated);
  };

  const handleContinue = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="text-6xl mb-4"
        >
          ✨
        </motion.div>
        <h3 className="text-xl font-semibold">
          Let's find the perfect opportunities for you!
        </h3>
        <p className="text-muted-foreground">
          This will take less than 2 minutes
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">What brings you here today?</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {motivations.map((motivation, index) => {
            const Icon = motivation.icon;
            const isSelected = selectedMotivations.includes(motivation.id);

            return (
              <motion.div
                key={motivation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => toggleMotivation(motivation.id)}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:scale-105",
                    isSelected
                      ? `${motivation.bgColor} ${motivation.borderColor} border-2 shadow-md`
                      : "border-2 border-transparent hover:border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        isSelected ? "bg-white/80 dark:bg-gray-800/80" : "bg-muted"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", motivation.color)} />
                    </div>
                    <span className="font-medium">{motivation.label}</span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="pt-4">
        <Button
          onClick={handleContinue}
          className="w-full"
          size="lg"
        >
          {selectedMotivations.length > 0
            ? `Continue with ${selectedMotivations.length} ${selectedMotivations.length === 1 ? 'reason' : 'reasons'}`
            : 'Continue'
          }
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          You can select multiple options or skip
        </p>
      </div>
    </div>
  );
}
