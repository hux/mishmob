import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  CalendarIcon,
  MapPinIcon,
  ClockIcon,
  UsersIcon,
  BuildingIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowLeftIcon,
  ShareIcon,
  HeartIcon,
  BriefcaseIcon,
  StarIcon,
  LinkIcon,
} from 'lucide-react';
import { opportunitiesApi, OpportunityDetail as OpportunityDetailType } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);

  const { data: opportunity, isLoading, error } = useQuery<OpportunityDetailType>({
    queryKey: ['opportunity', id],
    queryFn: () => opportunitiesApi.getById(id!),
    enabled: !!id,
  });

  const applyMutation = useMutation({
    mutationFn: ({ roleId }: { roleId: number }) =>
      opportunitiesApi.apply(id!, roleId, {
        cover_letter: coverLetter,
        availability_notes: availabilityNotes,
      }),
    onSuccess: () => {
      toast({
        title: 'Application submitted!',
        description: 'Your application has been sent to the organization.',
      });
      setApplyDialogOpen(false);
      setCoverLetter('');
      setAvailabilityNotes('');
      setSelectedRole(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Application failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => opportunitiesApi.publish(id!),
    onSuccess: () => {
      toast({
        title: 'Opportunity published!',
        description: 'Your opportunity is now visible to volunteers.',
      });
      // Refetch to update status
      window.location.reload();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to publish',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleApply = () => {
    if (!selectedRole) {
      toast({
        title: 'Please select a role',
        description: 'Choose which role you want to apply for.',
        variant: 'destructive',
      });
      return;
    }
    applyMutation.mutate({ roleId: selectedRole });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !opportunity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            {error ? 'Failed to load opportunity details.' : 'Opportunity not found.'}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/opportunities')} className="mt-4">
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Opportunities
        </Button>
      </div>
    );
  }

  const isOwner = user?.user_type === 'host' && user?.organization_id === opportunity.host_info.id;
  const canApply = user?.user_type === 'volunteer' && opportunity.status === 'open';
  const startDate = new Date(opportunity.start_date);
  const endDate = new Date(opportunity.end_date);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/opportunities')}
            className="mb-4"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Back to Opportunities
          </Button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{opportunity.title}</h1>
                <Badge
                  variant={opportunity.status === 'open' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {opportunity.status}
                </Badge>
                {opportunity.featured && (
                  <Badge variant="default" className="bg-yellow-500">
                    Featured
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <BuildingIcon className="h-4 w-4" />
                <Link
                  to={`/organizations/${opportunity.organization_id}`}
                  className="hover:underline"
                >
                  {opportunity.organization}
                </Link>
                {opportunity.host_info.is_verified && (
                  <CheckCircleIcon className="h-4 w-4 text-green-600" />
                )}
                <span className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  {opportunity.host_info.rating_average.toFixed(1)}
                  <span className="text-sm">({opportunity.host_info.rating_count})</span>
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <ShareIcon className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <HeartIcon className="h-4 w-4" />
              </Button>
              {isOwner && opportunity.status === 'draft' && (
                <Button onClick={() => publishMutation.mutate()}>
                  Publish Opportunity
                </Button>
              )}
              {canApply && (
                <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Apply Now</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Apply to {opportunity.title}</DialogTitle>
                      <DialogDescription>
                        Select a role and tell us why you're interested in this opportunity.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Select a role *</Label>
                        <RadioGroup
                          value={selectedRole?.toString() || ''}
                          onValueChange={(value) => setSelectedRole(parseInt(value))}
                        >
                          {opportunity.roles.map((role) => (
                            <div key={role.id} className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                              <RadioGroupItem value={role.id.toString()} />
                              <div className="space-y-1 leading-none">
                                <Label className="font-normal cursor-pointer">
                                  {role.title}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {role.description}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {role.slots_available - role.slots_filled} spots available
                                </p>
                              </div>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                      <div>
                        <Label htmlFor="cover-letter">Cover Letter (optional)</Label>
                        <Textarea
                          id="cover-letter"
                          placeholder="Tell us why you're interested in this opportunity..."
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label htmlFor="availability">Availability Notes (optional)</Label>
                        <Textarea
                          id="availability"
                          placeholder="Let us know your availability..."
                          value={availabilityNotes}
                          onChange={(e) => setAvailabilityNotes(e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleApply}
                        disabled={!selectedRole || applyMutation.isPending}
                      >
                        {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Key Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <CalendarIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duration</p>
                <p className="text-sm text-muted-foreground">
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <MapPinIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {opportunity.is_remote ? 'Remote' : opportunity.location_name}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <ClockIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time Commitment</p>
                <p className="text-sm text-muted-foreground">
                  {opportunity.time_commitment}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <UsersIcon className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Views</p>
                <p className="text-sm text-muted-foreground">
                  {opportunity.view_count} people viewed
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="roles">Roles & Skills</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About this Opportunity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{opportunity.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Impact Statement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{opportunity.impact_statement}</p>
              </CardContent>
            </Card>

            {opportunity.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{opportunity.requirements}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium">{opportunity.location_name}</p>
                  {!opportunity.is_remote && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {opportunity.location_address}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {opportunity.location_zip}
                      </p>
                    </>
                  )}
                  <Badge variant="secondary" className="mt-2">
                    {opportunity.cause_area}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            {opportunity.roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{role.title}</CardTitle>
                      <CardDescription>
                        {role.slots_available - role.slots_filled} of {role.slots_available} spots available
                      </CardDescription>
                    </div>
                    {role.is_leadership && (
                      <Badge variant="default">Leadership Role</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {role.description}
                    </p>
                  </div>

                  {role.responsibilities && (
                    <div>
                      <p className="font-medium mb-2">Responsibilities</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {role.responsibilities}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-medium mb-2">Time Commitment</p>
                    <p className="text-sm text-muted-foreground">{role.time_commitment}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {role.required_skills.length > 0 && (
                      <div>
                        <p className="font-medium mb-2 flex items-center gap-2">
                          <BriefcaseIcon className="h-4 w-4" />
                          Required Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {role.required_skills.map((skill) => (
                            <Badge key={skill.name} variant="outline">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {role.developed_skills.length > 0 && (
                      <div>
                        <p className="font-medium mb-2 flex items-center gap-2">
                          <CheckCircleIcon className="h-4 w-4" />
                          Skills You'll Develop
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {role.developed_skills.map((skill) => (
                            <Badge key={skill.name} variant="secondary">
                              {skill.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="organization" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{opportunity.host_info.name}</CardTitle>
                  {opportunity.host_info.is_verified && (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircleIcon className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{opportunity.host_info.description}</p>
                
                {opportunity.host_info.website && (
                  <div>
                    <a
                      href={opportunity.host_info.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <LinkIcon className="h-4 w-4" />
                      Visit Website
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">
                      {opportunity.host_info.rating_average.toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({opportunity.host_info.rating_count} reviews)
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}