import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lmsApi, Question, QuizAttempt } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  PlayCircle,
  FileText,
  HelpCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  Award,
} from 'lucide-react';

export function ModuleViewer() {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [startTime] = useState(Date.now());
  const [quizAttempt, setQuizAttempt] = useState<QuizAttempt | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, any>>({});
  const [quizResults, setQuizResults] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: moduleData, isLoading: isLoadingModule } = useQuery({
    queryKey: ['module', moduleId],
    queryFn: () => lmsApi.getModuleContent(Number(moduleId)),
    enabled: !!moduleId,
  });

  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => lmsApi.getCourseDetail(courseId!),
    enabled: !!courseId,
  });

  const { data: quiz, isLoading: isLoadingQuiz } = useQuery({
    queryKey: ['quiz', moduleId],
    queryFn: () => lmsApi.getQuiz(Number(moduleId)),
    enabled: !!moduleData?.has_quiz,
  });

  const { data: questions } = useQuery({
    queryKey: ['quiz-questions', quiz?.id],
    queryFn: () => lmsApi.getQuizQuestions(quiz!.id),
    enabled: !!quiz?.id && !!quizAttempt,
  });

  const progressMutation = useMutation({
    mutationFn: ({ completed, timeSpent }: { completed: boolean; timeSpent: number }) =>
      lmsApi.updateProgress(Number(moduleId), completed, timeSpent),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      
      if (data.course_completed) {
        toast({
          title: 'Course Completed!',
          description: 'Congratulations on completing the course!',
        });
      }
    },
  });

  const startQuizMutation = useMutation({
    mutationFn: () => lmsApi.startQuizAttempt(quiz!.id),
    onSuccess: (attempt) => {
      setQuizAttempt(attempt);
    },
  });

  const submitQuizMutation = useMutation({
    mutationFn: (answers: any[]) => lmsApi.submitQuiz(quizAttempt!.id, answers),
    onSuccess: (results) => {
      setQuizResults(results);
      if (results.passed) {
        toast({
          title: 'Quiz Passed!',
          description: `You scored ${results.score}%. Great job!`,
        });
      } else {
        toast({
          title: 'Quiz Not Passed',
          description: `You scored ${results.score}%. The passing score is ${results.passing_score}%.`,
          variant: 'destructive',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['module', moduleId] });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
    },
  });

  useEffect(() => {
    // Track time spent when leaving the module
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpent > 5) { // Only track if spent more than 5 seconds
        progressMutation.mutate({ completed: false, timeSpent });
      }
    };
  }, []);

  const handleMarkComplete = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    progressMutation.mutate({ completed: true, timeSpent });
  };

  const handleStartQuiz = () => {
    startQuizMutation.mutate();
  };

  const handleSubmitQuiz = () => {
    const answers = Object.entries(quizAnswers).map(([questionId, value]) => {
      const question = questions?.find(q => q.id === Number(questionId));
      if (!question) return null;

      if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
        return {
          question_id: Number(questionId),
          answer_id: value,
        };
      } else {
        return {
          question_id: Number(questionId),
          text_answer: value,
        };
      }
    }).filter(Boolean);

    submitQuizMutation.mutate(answers);
  };

  const navigateToNextModule = () => {
    if (course) {
      const currentIndex = course.modules.findIndex(m => m.id === Number(moduleId));
      if (currentIndex < course.modules.length - 1) {
        const nextModule = course.modules[currentIndex + 1];
        navigate(`/courses/${courseId}/module/${nextModule.id}`);
      }
    }
  };

  const navigateToPrevModule = () => {
    if (course) {
      const currentIndex = course.modules.findIndex(m => m.id === Number(moduleId));
      if (currentIndex > 0) {
        const prevModule = course.modules[currentIndex - 1];
        navigate(`/courses/${courseId}/module/${prevModule.id}`);
      }
    }
  };

  if (isLoadingModule) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Module not found</h3>
            <Button onClick={() => navigate(`/courses/${courseId}`)}>
              Back to Course
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderModuleContent = () => {
    if (moduleData.module.content_type === 'video' && moduleData.module.video_url) {
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={moduleData.module.video_url}
            controls
            className="w-full h-full"
          />
        </div>
      );
    }

    return (
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: moduleData.module.content }} />
    );
  };

  const renderQuiz = () => {
    if (!quiz || !quizAttempt) return null;

    if (quizResults) {
      return (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {quizResults.passed ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  Quiz Passed!
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  Quiz Not Passed
                </>
              )}
            </CardTitle>
            <CardDescription>
              You scored {quizResults.score}% (Passing score: {quizResults.passing_score}%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quizResults.passed ? (
              <Alert>
                <Award className="h-4 w-4" />
                <AlertTitle>Congratulations!</AlertTitle>
                <AlertDescription>
                  You have successfully completed this module's quiz.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Try Again</AlertTitle>
                <AlertDescription>
                  {quizAttempt.remaining_attempts > 0 
                    ? `You have ${quizAttempt.remaining_attempts} attempts remaining.`
                    : 'You have no more attempts remaining for this quiz.'}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-4 flex gap-2">
              <Button onClick={() => navigateToNextModule()}>
                Continue to Next Module
              </Button>
              {!quizResults.passed && quizAttempt.remaining_attempts > 0 && (
                <Button variant="outline" onClick={() => {
                  setQuizAttempt(null);
                  setQuizResults(null);
                  setQuizAnswers({});
                  handleStartQuiz();
                }}>
                  Retry Quiz
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (questions) {
      return (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{quiz.title}</CardTitle>
            <CardDescription>
              {quiz.questions_count} questions • {quiz.total_points} points • 
              {quiz.time_limit_minutes ? ` ${quiz.time_limit_minutes} minutes` : ' No time limit'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <div key={question.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">
                      {index + 1}. {question.question_text}
                    </h4>
                    <Badge variant="secondary">{question.points} points</Badge>
                  </div>

                  {question.question_type === 'multiple_choice' && question.answers && (
                    <RadioGroup
                      value={quizAnswers[question.id] || ''}
                      onValueChange={(value) => 
                        setQuizAnswers({ ...quizAnswers, [question.id]: Number(value) })
                      }
                    >
                      {question.answers.map((answer) => (
                        <div key={answer.id} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={String(answer.id)} id={`answer-${answer.id}`} />
                          <Label htmlFor={`answer-${answer.id}`} className="cursor-pointer">
                            {answer.answer_text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {question.question_type === 'true_false' && question.answers && (
                    <RadioGroup
                      value={quizAnswers[question.id] || ''}
                      onValueChange={(value) => 
                        setQuizAnswers({ ...quizAnswers, [question.id]: Number(value) })
                      }
                    >
                      {question.answers.map((answer) => (
                        <div key={answer.id} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={String(answer.id)} id={`answer-${answer.id}`} />
                          <Label htmlFor={`answer-${answer.id}`} className="cursor-pointer">
                            {answer.answer_text}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {(question.question_type === 'short_answer' || question.question_type === 'essay') && (
                    <Textarea
                      placeholder="Type your answer here..."
                      value={quizAnswers[question.id] || ''}
                      onChange={(e) => 
                        setQuizAnswers({ ...quizAnswers, [question.id]: e.target.value })
                      }
                      rows={question.question_type === 'essay' ? 4 : 2}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setQuizAttempt(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitQuiz}
                disabled={Object.keys(quizAnswers).length < questions.length || submitQuizMutation.isPending}
              >
                {submitQuizMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Quiz'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>

          {course && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToPrevModule}
                disabled={course.modules.findIndex(m => m.id === Number(moduleId)) === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Module {course.modules.findIndex(m => m.id === Number(moduleId)) + 1} of {course.modules.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={navigateToNextModule}
                disabled={course.modules.findIndex(m => m.id === Number(moduleId)) === course.modules.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Module Content */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {moduleData.module.content_type === 'video' && <PlayCircle className="h-5 w-5" />}
                  {moduleData.module.content_type === 'text' && <FileText className="h-5 w-5" />}
                  {moduleData.module.content_type === 'quiz' && <HelpCircle className="h-5 w-5" />}
                  {moduleData.module.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Clock className="h-4 w-4" />
                  {moduleData.module.duration} minutes
                  {moduleData.has_quiz && (
                    <>
                      <span className="mx-2">•</span>
                      <HelpCircle className="h-4 w-4" />
                      Quiz required
                    </>
                  )}
                </CardDescription>
              </div>
              {moduleData.progress.completed && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {renderModuleContent()}

            {!moduleData.progress.completed && !moduleData.has_quiz && (
              <div className="mt-6">
                <Button
                  onClick={handleMarkComplete}
                  disabled={progressMutation.isPending}
                  className="w-full"
                >
                  {progressMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Marking as Complete...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              </div>
            )}

            {moduleData.has_quiz && quiz && !moduleData.progress.completed && (
              <div className="mt-6">
                {!quizAttempt && !quizResults && (
                  <Alert>
                    <HelpCircle className="h-4 w-4" />
                    <AlertTitle>Quiz Required</AlertTitle>
                    <AlertDescription>
                      Complete the quiz to finish this module. You need {quiz.passing_score}% to pass.
                      {quiz.max_attempts > 0 && ` You have ${quiz.max_attempts} attempts.`}
                    </AlertDescription>
                  </Alert>
                )}
                
                {!quizAttempt && !quizResults && (
                  <Button
                    onClick={handleStartQuiz}
                    disabled={startQuizMutation.isPending}
                    className="w-full mt-4"
                  >
                    {startQuizMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading Quiz...
                      </>
                    ) : (
                      <>
                        <HelpCircle className="mr-2 h-4 w-4" />
                        Start Quiz
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quiz Section */}
        {(quizAttempt || quizResults) && renderQuiz()}
      </div>
    </div>
  );
}