import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRequireAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  Calendar, 
  Users, 
  BarChart3, 
  Plus,
  ChevronRight,
  Eye,
  UserCheck,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { opportunitiesApi } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export function HostDashboard() {
  const { user } = useAuth();
  const { isLoading } = useRequireAuth();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loadingOps, setLoadingOps] = useState(true);

  useEffect(() => {
    // Fetch host's opportunities
    const fetchOpportunities = async () => {
      try {
        const response = await opportunitiesApi.list({ page_size: 10 });
        // Filter for current host's opportunities (this should be done server-side in a real app)
        setOpportunities(response.results);
      } catch (error) {
        toast({
          title: "Failed to load opportunities",
          description: "Could not fetch your opportunities",
          variant: "destructive",
        });
      } finally {
        setLoadingOps(false);
      }
    };

    fetchOpportunities();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Organization Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your volunteer opportunities and track impact
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loadingOps ? '...' : opportunities.filter(o => o.status === 'open').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently accepting volunteers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Across all opportunities
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hours Contributed</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Total volunteer hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organization Rating</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Not yet rated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Opportunity</CardTitle>
              <CardDescription>
                Post a new volunteer opportunity for your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Building className="h-4 w-4 mr-2" />
                  Quick and easy setup
                </div>
                <Button asChild className="w-full">
                  <Link to="/opportunities/create">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Opportunity
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization Profile</CardTitle>
              <CardDescription>
                Keep your organization information up to date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <UserCheck className="h-4 w-4 mr-2" />
                  {user?.is_verified ? 'Verified Organization' : 'Pending Verification'}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/organization">
                    Update Profile
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>Your Opportunities</CardTitle>
            <CardDescription>
              Manage and track your volunteer opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOps ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : opportunities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No opportunities created yet
                </p>
                <Button asChild>
                  <Link to="/opportunities/create">Create Your First Opportunity</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {opportunities.slice(0, 5).map((opportunity) => (
                  <div key={opportunity.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{opportunity.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {opportunity.spots_available} spots
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-3 w-3 mr-1" />
                          {opportunity.view_count || 0} views
                        </span>
                        <Badge variant={
                          opportunity.status === 'open' ? 'default' : 
                          opportunity.status === 'draft' ? 'secondary' : 
                          'outline'
                        }>
                          {opportunity.status}
                        </Badge>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/opportunities/${opportunity.id}`}>
                        Manage
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                ))}
                
                {opportunities.length > 5 && (
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/my-opportunities">View All Opportunities</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}