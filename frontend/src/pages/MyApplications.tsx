import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  BuildingIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  FileTextIcon,
  ChevronRightIcon,
} from 'lucide-react';

// Mock data - replace with actual API call
const mockApplications = {
  pending: [
    {
      id: '1',
      opportunity_id: '1',
      opportunity_title: 'Beach Cleanup Initiative',
      organization: 'Green Earth Foundation',
      role_title: 'Cleanup Volunteer',
      applied_date: '2025-01-20',
      status: 'pending',
      location: 'Santa Monica Beach',
      time_commitment: '4 hours/week',
      start_date: '2025-02-01',
    },
    {
      id: '2',
      opportunity_id: '2',
      opportunity_title: 'Food Bank Assistant',
      organization: 'Community Food Network',
      role_title: 'Distribution Helper',
      applied_date: '2025-01-18',
      status: 'pending',
      location: 'Downtown Food Bank',
      time_commitment: '3 hours/week',
      start_date: '2025-02-15',
    },
  ],
  accepted: [
    {
      id: '3',
      opportunity_id: '3',
      opportunity_title: 'Youth Mentorship Program',
      organization: 'Future Leaders Initiative',
      role_title: 'Mentor',
      applied_date: '2025-01-10',
      accepted_date: '2025-01-15',
      status: 'accepted',
      location: 'Community Center',
      time_commitment: '2 hours/week',
      start_date: '2025-01-25',
    },
  ],
  rejected: [
    {
      id: '4',
      opportunity_id: '4',
      opportunity_title: 'Animal Shelter Helper',
      organization: 'City Animal Shelter',
      role_title: 'Dog Walker',
      applied_date: '2025-01-05',
      rejected_date: '2025-01-08',
      status: 'rejected',
      location: 'City Animal Shelter',
      time_commitment: '5 hours/week',
      rejection_reason: 'Position filled',
    },
  ],
};

export function MyApplications() {
  const [activeTab, setActiveTab] = useState('pending');

  // TODO: Replace with actual API call
  const { data: applications, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockApplications;
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircleIcon className="h-5 w-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      accepted: 'default',
      rejected: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const renderApplicationCard = (application: any) => (
    <Card key={application.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              <Link
                to={`/opportunities/${application.opportunity_id}`}
                className="hover:text-primary"
              >
                {application.opportunity_title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1">
              <BuildingIcon className="inline h-4 w-4 mr-1" />
              {application.organization}
            </CardDescription>
          </div>
          {getStatusBadge(application.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Applied for: {application.role_title}</p>
          <div className="space-y-1">
            <p className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              Applied on {new Date(application.applied_date).toLocaleDateString()}
            </p>
            {application.status === 'accepted' && application.start_date && (
              <p className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Starts {new Date(application.start_date).toLocaleDateString()}
              </p>
            )}
            <p className="flex items-center gap-2">
              <MapPinIcon className="h-4 w-4" />
              {application.location}
            </p>
            <p className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4" />
              {application.time_commitment}
            </p>
          </div>
        </div>

        {application.status === 'rejected' && application.rejection_reason && (
          <div className="bg-red-50 dark:bg-red-950 p-3 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              <strong>Reason:</strong> {application.rejection_reason}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/opportunities/${application.opportunity_id}`}>
              View Opportunity
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          {application.status === 'accepted' && (
            <Button size="sm">
              View Details
              <FileTextIcon className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track the status of your volunteer applications
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <AlertCircleIcon className="h-4 w-4" />
              Pending ({applications?.pending.length || 0})
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <CheckCircleIcon className="h-4 w-4" />
              Accepted ({applications?.accepted.length || 0})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircleIcon className="h-4 w-4" />
              Rejected ({applications?.rejected.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
            ) : applications?.pending.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No pending applications</p>
                  <p className="text-muted-foreground mb-4">
                    You don't have any applications waiting for review
                  </p>
                  <Button asChild>
                    <Link to="/opportunities">Browse Opportunities</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              applications?.pending.map(renderApplicationCard)
            )}
          </TabsContent>

          <TabsContent value="accepted">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48" />
              </div>
            ) : applications?.accepted.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <CheckCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No accepted applications yet</p>
                  <p className="text-muted-foreground">
                    Your accepted applications will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              applications?.accepted.map(renderApplicationCard)
            )}
          </TabsContent>

          <TabsContent value="rejected">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48" />
              </div>
            ) : applications?.rejected.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <XCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">No rejected applications</p>
                  <p className="text-muted-foreground">
                    Don't give up! Keep applying to opportunities that match your skills
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {applications?.rejected.map(renderApplicationCard)}
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                  <CardContent className="pt-6">
                    <p className="text-sm">
                      <strong>Tip:</strong> Don't be discouraged by rejections. Organizations often receive many applications. 
                      Keep applying to opportunities that match your skills and interests!
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}