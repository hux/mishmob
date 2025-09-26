import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  PlusIcon,
  EditIcon,
  EyeIcon,
  ArchiveIcon,
  SearchIcon,
  FilterIcon,
  ChartBarIcon,
  ClipboardListIcon,
} from 'lucide-react';

// Mock data - replace with actual API call
const mockOpportunities = {
  draft: [
    {
      id: '1',
      title: 'Park Restoration Project',
      description: 'Help restore and beautify our local community park',
      location: 'Central Park',
      status: 'draft',
      created_date: '2025-01-15',
      start_date: '2025-02-01',
      end_date: '2025-02-28',
      roles_count: 3,
      applications_count: 0,
      views_count: 0,
    },
  ],
  open: [
    {
      id: '2',
      title: 'After-School Tutoring Program',
      description: 'Support students with homework and learning activities',
      location: 'Lincoln Elementary School',
      status: 'open',
      created_date: '2025-01-10',
      start_date: '2025-02-01',
      end_date: '2025-05-31',
      roles_count: 5,
      applications_count: 12,
      views_count: 145,
      volunteers_count: 3,
    },
    {
      id: '3',
      title: 'Community Garden Initiative',
      description: 'Create and maintain a community vegetable garden',
      location: 'Downtown Community Center',
      status: 'open',
      created_date: '2025-01-08',
      start_date: '2025-01-20',
      end_date: '2025-06-30',
      roles_count: 4,
      applications_count: 8,
      views_count: 98,
      volunteers_count: 2,
    },
  ],
  closed: [
    {
      id: '4',
      title: 'Holiday Food Drive',
      description: 'Collect and distribute food for families in need',
      location: 'Multiple Locations',
      status: 'closed',
      created_date: '2024-11-15',
      start_date: '2024-12-01',
      end_date: '2024-12-25',
      roles_count: 6,
      applications_count: 45,
      views_count: 523,
      volunteers_count: 15,
      completion_status: 'completed',
    },
  ],
};

export function MyOpportunities() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Replace with actual API call
  const { data: opportunities, isLoading } = useQuery({
    queryKey: ['my-opportunities'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockOpportunities;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      draft: 'outline',
      open: 'default',
      closed: 'secondary',
    };
    return (
      <Badge variant={variants[status] || 'secondary'} className="capitalize">
        {status}
      </Badge>
    );
  };

  const renderOpportunityCard = (opportunity: any) => (
    <Card key={opportunity.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">{opportunity.title}</CardTitle>
            <CardDescription className="mt-1">{opportunity.description}</CardDescription>
          </div>
          {getStatusBadge(opportunity.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Applications</p>
            <p className="text-2xl font-semibold">{opportunity.applications_count}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Views</p>
            <p className="text-2xl font-semibold">{opportunity.views_count}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Volunteers</p>
            <p className="text-2xl font-semibold">{opportunity.volunteers_count || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Roles</p>
            <p className="text-2xl font-semibold">{opportunity.roles_count}</p>
          </div>
        </div>

        {/* Details */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            {opportunity.location}
          </p>
          <p className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {new Date(opportunity.start_date).toLocaleDateString()} - {new Date(opportunity.end_date).toLocaleDateString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button asChild size="sm" variant="outline">
            <Link to={`/opportunities/${opportunity.id}`}>
              <EyeIcon className="mr-2 h-4 w-4" />
              View
            </Link>
          </Button>
          {opportunity.status !== 'closed' && (
            <Button size="sm" variant="outline">
              <EditIcon className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {opportunity.status === 'open' && (
            <>
              <Button size="sm" variant="outline">
                <ClipboardListIcon className="mr-2 h-4 w-4" />
                Manage Applications
              </Button>
              <Button size="sm" variant="outline">
                <ChartBarIcon className="mr-2 h-4 w-4" />
                Analytics
              </Button>
            </>
          )}
          {opportunity.status === 'draft' && (
            <Button size="sm">
              Publish
            </Button>
          )}
          {opportunity.status === 'open' && (
            <Button size="sm" variant="destructive">
              <ArchiveIcon className="mr-2 h-4 w-4" />
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const getEmptyStateMessage = (status: string) => {
    switch (status) {
      case 'draft':
        return {
          title: 'No draft opportunities',
          description: 'Start creating an opportunity to see it here',
          action: 'Create Opportunity',
        };
      case 'open':
        return {
          title: 'No open opportunities',
          description: 'Your published opportunities will appear here',
          action: 'Create Opportunity',
        };
      case 'closed':
        return {
          title: 'No closed opportunities',
          description: 'Your completed or closed opportunities will appear here',
          action: 'View Open Opportunities',
        };
      default:
        return {
          title: 'No opportunities',
          description: 'Create your first opportunity to get started',
          action: 'Create Opportunity',
        };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manage Opportunities</h1>
              <p className="text-muted-foreground">
                Create and manage volunteer opportunities for your organization
              </p>
            </div>
            <Button onClick={() => navigate('/opportunities/create')}>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Opportunity
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <FilterIcon className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="draft">
              Draft ({opportunities?.draft.length || 0})
            </TabsTrigger>
            <TabsTrigger value="open">
              Open ({opportunities?.open.length || 0})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Closed ({opportunities?.closed.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draft">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
            ) : opportunities?.draft.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-lg font-medium mb-2">{getEmptyStateMessage('draft').title}</p>
                  <p className="text-muted-foreground mb-4">{getEmptyStateMessage('draft').description}</p>
                  <Button onClick={() => navigate('/opportunities/create')}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    {getEmptyStateMessage('draft').action}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              opportunities?.draft.map(renderOpportunityCard)
            )}
          </TabsContent>

          <TabsContent value="open">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
            ) : opportunities?.open.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-lg font-medium mb-2">{getEmptyStateMessage('open').title}</p>
                  <p className="text-muted-foreground mb-4">{getEmptyStateMessage('open').description}</p>
                  <Button onClick={() => navigate('/opportunities/create')}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    {getEmptyStateMessage('open').action}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              opportunities?.open.map(renderOpportunityCard)
            )}
          </TabsContent>

          <TabsContent value="closed">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48" />
              </div>
            ) : opportunities?.closed.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-lg font-medium mb-2">{getEmptyStateMessage('closed').title}</p>
                  <p className="text-muted-foreground mb-4">{getEmptyStateMessage('closed').description}</p>
                  <Button variant="outline" onClick={() => setActiveTab('open')}>
                    {getEmptyStateMessage('closed').action}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              opportunities?.closed.map(renderOpportunityCard)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}