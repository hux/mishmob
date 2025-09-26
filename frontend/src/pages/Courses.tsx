import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { lmsApi, CourseListItem } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GraduationCap,
  Clock,
  Users,
  Search,
  Filter,
  BookOpen,
  Award,
  BarChart,
  CheckCircle,
} from 'lucide-react';

export function Courses() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses', searchQuery, audienceFilter, difficultyFilter, categoryFilter],
    queryFn: () => lmsApi.getCourses({
      search: searchQuery || undefined,
      audience_type: audienceFilter || undefined,
      difficulty: difficultyFilter || undefined,
      category: categoryFilter || undefined,
    }),
  });

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAudienceIcon = (type: string) => {
    switch (type) {
      case 'volunteer':
        return <Users className="h-4 w-4" />;
      case 'host':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const CourseCard = ({ course }: { course: CourseListItem }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full" onClick={() => navigate(`/courses/${course.id}`)}>
      {course.thumbnail_url && (
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="object-cover w-full h-full"
          />
          {course.is_enrolled && course.progress_percentage !== undefined && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
              <Progress value={course.progress_percentage} className="h-2" />
              <p className="text-xs text-white mt-1">{course.progress_percentage}% Complete</p>
            </div>
          )}
        </div>
      )}
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <Badge className={getDifficultyColor(course.difficulty_level)}>
            {course.difficulty_level}
          </Badge>
          <div className="flex items-center gap-1 text-muted-foreground">
            {getAudienceIcon(course.audience_type)}
            <span className="text-xs capitalize">{course.audience_type}</span>
          </div>
        </div>
        <CardTitle className="line-clamp-2">{course.title}</CardTitle>
        <CardDescription className="line-clamp-3">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{Math.ceil(course.estimated_duration / 60)}h</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.modules_count} modules</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{course.enrolled_count}</span>
          </div>
        </div>
        
        {course.is_enrolled ? (
          <Button className="w-full" variant={course.progress_percentage === 100 ? "secondary" : "default"}>
            {course.progress_percentage === 100 ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Completed
              </>
            ) : (
              'Continue Learning'
            )}
          </Button>
        ) : (
          <Button className="w-full">
            Enroll Now
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Learning Center</h1>
        <p className="text-xl text-muted-foreground">
          Develop your skills and prepare for meaningful volunteer opportunities
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{courses?.length || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enrolled</p>
                <p className="text-2xl font-bold">
                  {courses?.filter(c => c.is_enrolled).length || 0}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">
                  {courses?.filter(c => c.progress_percentage === 100).length || 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">
                  {courses?.filter(c => c.is_enrolled && c.progress_percentage !== 100).length || 0}
                </p>
              </div>
              <BarChart className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Audiences" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Audiences</SelectItem>
                <SelectItem value="volunteer">For Volunteers</SelectItem>
                <SelectItem value="host">For Hosts</SelectItem>
                <SelectItem value="both">For Everyone</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-video" />
              <CardHeader>
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new courses.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}