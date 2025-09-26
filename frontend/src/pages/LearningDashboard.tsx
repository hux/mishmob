import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { lmsApi, Enrollment } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap,
  Clock,
  BookOpen,
  CheckCircle,
  Award,
  BarChart,
  TrendingUp,
  Calendar,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

export function LearningDashboard() {
  const navigate = useNavigate();

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: () => lmsApi.getMyEnrollments(),
  });

  const activeEnrollments = enrollments?.filter(e => e.completion_status === 'in_progress') || [];
  const completedEnrollments = enrollments?.filter(e => e.completion_status === 'completed') || [];
  const notStartedEnrollments = enrollments?.filter(e => e.completion_status === 'not_started') || [];

  const totalHoursCompleted = enrollments?.reduce((acc, enrollment) => {
    if (enrollment.completion_status === 'completed') {
      // This is a placeholder - in a real app, you'd track actual time spent
      return acc + 2;
    }
    return acc;
  }, 0) || 0;

  const averageProgress = enrollments?.length
    ? Math.round(enrollments.reduce((acc, e) => acc + e.progress_percentage, 0) / enrollments.length)
    : 0;

  const renderEnrollmentCard = (enrollment: Enrollment) => (
    <Card
      key={enrollment.course_id}
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/courses/${enrollment.course_id}`)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="line-clamp-2">{enrollment.course_title}</CardTitle>
            <CardDescription>
              Enrolled {formatDistanceToNow(new Date(enrollment.enrolled_at), { addSuffix: true })}
            </CardDescription>
          </div>
          {enrollment.certificate_issued && (
            <Badge className="bg-green-100 text-green-800">
              <Award className="mr-1 h-3 w-3" />
              Certified
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{enrollment.progress_percentage}%</span>
            </div>
            <Progress value={enrollment.progress_percentage} />
          </div>
          
          {enrollment.last_accessed && (
            <p className="text-sm text-muted-foreground">
              Last accessed {formatDistanceToNow(new Date(enrollment.last_accessed), { addSuffix: true })}
            </p>
          )}
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              {enrollment.completion_status === 'completed' ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Completed</span>
                </>
              ) : enrollment.completion_status === 'in_progress' ? (
                <>
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600">In Progress</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Not Started</span>
                </>
              )}
            </div>
            
            {enrollment.certificate_issued && enrollment.certificate_id ? (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/certificates/${enrollment.certificate_id}`);
                }}
              >
                <FileText className="mr-1 h-3 w-3" />
                Certificate
              </Button>
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-2 w-full mb-4" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">My Learning</h1>
        <p className="text-xl text-muted-foreground">
          Track your progress and continue your learning journey
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{enrollments?.length || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedEnrollments.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hours Learned</p>
                <p className="text-2xl font-bold">{totalHoursCompleted}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{averageProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="not-started">
            Not Started ({notStartedEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedEnrollments.length})
          </TabsTrigger>
          <TabsTrigger value="certificates">
            Certificates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {activeEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEnrollments.map(renderEnrollmentCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No active courses</h3>
                <p className="text-muted-foreground mb-4">
                  Start learning by enrolling in a course
                </p>
                <Button onClick={() => navigate('/courses')}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="not-started">
          {notStartedEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notStartedEnrollments.map(renderEnrollmentCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">All courses started</h3>
                <p className="text-muted-foreground">
                  Great job! You've started all your enrolled courses.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEnrollments.map(renderEnrollmentCard)}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No completed courses yet</h3>
                <p className="text-muted-foreground">
                  Keep learning! Your completed courses will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="certificates">
          {completedEnrollments.filter(e => e.certificate_issued).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEnrollments
                .filter(e => e.certificate_issued)
                .map(enrollment => (
                  <Card
                    key={enrollment.course_id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/certificates/${enrollment.certificate_id}`)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <Award className="h-8 w-8 text-yellow-600" />
                        <Badge className="bg-yellow-100 text-yellow-800">Certificate</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold mb-2">{enrollment.course_title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Completed on {format(new Date(enrollment.enrolled_at), 'MMM d, yyyy')}
                      </p>
                      <Button className="w-full" variant="outline">
                        <FileText className="mr-2 h-4 w-4" />
                        View Certificate
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No certificates yet</h3>
                <p className="text-muted-foreground">
                  Complete courses to earn certificates.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}