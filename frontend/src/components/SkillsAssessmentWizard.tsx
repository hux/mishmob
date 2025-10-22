import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles, ArrowRight, ArrowLeft, Check, Clock,
  Heart, GraduationCap, Users, Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Import step components (we'll create these next)
import { WelcomeStep } from './wizard-steps/WelcomeStep';
import { InterestsStep } from './wizard-steps/InterestsStep';
import { QuickWinsStep } from './wizard-steps/QuickWinsStep';
import { ExperienceStep } from './wizard-steps/ExperienceStep';
import { ReviewStep } from './wizard-steps/ReviewStep';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  estimatedSeconds: number;
  component: React.ComponentType<any>;
}

const STEPS: WizardStep[] = [
  {
    id: 1,
    title: 'Welcome',
    description: 'Let\'s get started',
    estimatedSeconds: 15,
    component: WelcomeStep
  },
  {
    id: 2,
    title: 'Interests',
    description: 'What excites you?',
    estimatedSeconds: 20,
    component: InterestsStep
  },
  {
    id: 3,
    title: 'Quick Wins',
    description: 'Skills you already have',
    estimatedSeconds: 25,
    component: QuickWinsStep
  },
  {
    id: 4,
    title: 'Experience',
    description: 'Your expertise',
    estimatedSeconds: 30,
    component: ExperienceStep
  },
  {
    id: 5,
    title: 'Review',
    description: 'Polish your profile',
    estimatedSeconds: 10,
    component: ReviewStep
  }
];

interface SkillSelection {
  id: string;
  name: string;
  category: string;
  proficiency_level: string;
}

export function SkillsAssessmentWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({
    motivation: [] as string[],
    selectedInterests: [] as string[],
    selectedSkills: [] as SkillSelection[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate progress and time
  const totalSteps = STEPS.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const timeRemaining = STEPS.slice(currentStep).reduce(
    (sum, step) => sum + step.estimatedSeconds,
    0
  );

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      // Submit all skills at once
      const response = await fetch('/api/skills-assessment/add-skills-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          skills: wizardData.selectedSkills.map(skill => ({
            skill_id: skill.id,
            proficiency_level: skill.proficiency_level
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();

        toast({
          title: '🎉 Profile Complete!',
          description: `Added ${data.added} skills to your profile. You're ready to find opportunities!`,
        });

        // Redirect to dashboard or opportunities
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        throw new Error('Failed to save skills');
      }
    } catch (error) {
      toast({
        title: 'Oops!',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateWizardData = (field: string, value: any) => {
    setWizardData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const CurrentStepComponent = STEPS[currentStep].component;
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Skills Assessment</h1>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeRemaining)} remaining</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-6">
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center gap-1 transition-all",
                  index <= currentStep ? "opacity-100" : "opacity-40"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                    index < currentStep
                      ? "bg-primary border-primary text-primary-foreground"
                      : index === currentStep
                      ? "bg-primary/10 border-primary text-primary animate-pulse"
                      : "bg-background border-border"
                  )}
                >
                  {index < currentStep ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step content with animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg">
              <CardContent className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {STEPS[currentStep].title}
                  </h2>
                  <p className="text-muted-foreground">
                    {STEPS[currentStep].description}
                  </p>
                </div>

                {/* Current step component */}
                <CurrentStepComponent
                  data={wizardData}
                  updateData={updateWizardData}
                  onNext={handleNext}
                />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          {!isLastStep ? (
            <Button onClick={handleNext} className="gap-2">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isSubmitting || wizardData.selectedSkills.length === 0}
              className="gap-2 bg-gradient-to-r from-primary to-secondary"
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  Complete Profile
                  <Check className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Skip option */}
        {currentStep < STEPS.length - 1 && (
          <div className="text-center mt-4">
            <Button
              variant="link"
              onClick={() => setCurrentStep(STEPS.length - 1)}
              className="text-sm text-muted-foreground"
            >
              Skip to review
            </Button>
          </div>
        )}

        {/* Skills counter */}
        {wizardData.selectedSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {wizardData.selectedSkills.length}
                    </Badge>
                    <span className="text-sm font-medium">
                      {wizardData.selectedSkills.length === 1 ? 'skill' : 'skills'} added
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentStep(STEPS.length - 1)}
                  >
                    View all
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
