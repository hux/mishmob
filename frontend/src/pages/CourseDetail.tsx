import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lmsApi, CourseDetail as CourseDetailType, Module } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  GraduationCap,
  Clock,
  BookOpen,
  CheckCircle,
  Circle,
  PlayCircle,
  FileText,
  HelpCircle,
  Award,
  ChevronRight,
  Users,
  Calendar,
  Target,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

export function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => lmsApi.getCourseDetail(courseId!),
    enabled: !!courseId,
  });

  const enrollMutation = useMutation({
    mutationFn: () => lmsApi.enrollInCourse(courseId!),
    onSuccess: () => {
      toast({
        title: 'Enrolled successfully',
        description: 'You have been enrolled in this course.',
      });
      queryClient.invalidateQueries({ queryKey: ['course', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: () => {
      toast({
        title: 'Enrollment failed',
        description: 'Unable to enroll in this course. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircle className="h-4 w-4" />;
      case 'text':
        return <FileText className="h-4 w-4" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const handleEnroll = () => {
    enrollMutation.mutate();
  };

  const handleStartLearning = () => {
    if (course && course.modules.length > 0) {
      const firstModule = course.modules[0];
      navigate(`/courses/${courseId}/module/${firstModule.id}`);
    }
  };

  const handleContinueLearning = () => {
    if (course) {
      // Find the first incomplete module
      const nextModule = course.modules.find(m => !m.is_completed);
      if (nextModule) {
        navigate(`/courses/${courseId}/module/${nextModule.id}`);
      } else {
        // All modules completed, go to the last one
        const lastModule = course.modules[course.modules.length - 1];
        navigate(`/courses/${courseId}/module/${lastModule.id}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-96 w-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div>
              <Skeleton className="h-60 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Course not found</h3>
            <p className="text-muted-foreground mb-4">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/courses')}>
              Back to Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedModules = course.modules.filter(m => m.is_completed).length;
  const progressPercentage = course.progress_percentage || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <Card className="mb-8">
          <div className="relative">
            {course.thumbnail_url && (
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <Badge className="mb-2">{course.difficulty_level}</Badge>
                  <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                  <p className="text-lg opacity-90">{course.description}</p>
                </div>
              </div>
            )}
            {!course.thumbnail_url && (
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-2">{course.difficulty_level}</Badge>
                    <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
                    <CardDescription className="text-lg">
                      {course.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            )}
          </div>
          
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{Math.ceil(course.estimated_duration / 60)} hours</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{course.modules_count} modules</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{course.enrolled_count} enrolled</span>
              </div>
              {course.created_by && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">By {course.created_by}</span>
                </div>
              )}
              {course.provides_certificate && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Certificate on completion</span>
                </div>
              )}
            </div>

            {course.is_enrolled ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Your Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {completedModules} of {course.modules_count} modules completed
                  </span>
                </div>
                <Progress value={progressPercentage} className="mb-4" />
                <div className="flex gap-4">
                  <Button onClick={handleContinueLearning} className="flex-1">
                    {progressPercentage === 100 ? 'Review Course' : 'Continue Learning'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  {progressPercentage === 100 && course.certificate_id && (
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/certificates/${course.certificate_id}`)}
                    >
                      <Award className="mr-2 h-4 w-4" />
                      View Certificate
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <Button
                  onClick={handleEnroll}
                  className="flex-1"
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    'Enroll in Course'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About this course</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>{course.description}</p>
                    
                    <h3>What you'll learn</h3>
                    <ul>
                      <li>Essential skills for {course.audience_type === 'volunteer' ? 'volunteering' : 'hosting opportunities'}</li>
                      <li>Best practices and guidelines</li>
                      <li>Real-world applications and scenarios</li>
                      <li>Community engagement strategies</li>
                    </ul>

                    <h3>Requirements</h3>
                    <ul>
                      <li>No prior experience required</li>
                      <li>Basic computer skills</li>
                      <li>Commitment to complete the course</li>
                    </ul>

                    {course.provides_certificate && (
                      <>
                        <h3>Certification</h3>
                        <p>
                          Upon successful completion of all modules and achieving a minimum score of{' '}
                          {course.passing_score}%, you will receive a certificate of completion.
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="curriculum" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                    <CardDescription>
                      Complete all modules to finish the course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] pr-4">
                      <div className="space-y-4">
                        {course.modules.map((module, index) => (
                          <div
                            key={module.id}
                            className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                              course.is_enrolled
                                ? 'hover:bg-gray-50 dark:hover:bg-gray-900'
                                : 'opacity-75'
                            }`}
                            onClick={() => {
                              if (course.is_enrolled) {
                                navigate(`/courses/${courseId}/module/${module.id}`);
                              }
                            }}
                          >
                            <div className="flex-shrink-0">
                              {module.is_completed ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                              ) : (
                                <Circle className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium flex items-center gap-2">
                                    Module {index + 1}: {module.title}
                                    {getModuleIcon(module.content_type)}
                                  </h4>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {module.duration} minutes • {module.content_type}
                                  </p>
                                </div>
                                {module.quiz_id && (
                                  <Badge variant="secondary">Quiz</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">{Math.ceil(course.estimated_duration / 60)} hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Modules</span>
                  <span className="font-medium">{course.modules_count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Level</span>
                  <Badge variant="secondary">{course.difficulty_level}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Audience</span>
                  <span className="font-medium capitalize">{course.audience_type}</span>
                </div>
                {course.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="font-medium">{course.category}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Certificate</span>
                  <span className="font-medium">
                    {course.provides_certificate ? 'Yes' : 'No'}
                  </span>
                </div>
                {course.provides_certificate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Passing Score</span>
                    <span className="font-medium">{course.passing_score}%</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {format(new Date(course.created_at), 'MMM yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {course.tags && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.split(',').map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}