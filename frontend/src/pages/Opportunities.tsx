import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import Navigation from '@/components/ui/navigation';
import { MapPin, Clock, Users, Star, Search, Filter, Calendar, Building, Globe, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { opportunitiesApi } from '@/services/api';
import type { Opportunity, OpportunityDetail, Role } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function OpportunitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOpportunity, setSelectedOpportunity] = useState<OpportunityDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    zip_code: searchParams.get('zip') || '',
    cause_area: searchParams.get('cause') || '',
    skills: searchParams.get('skills') || '',
  });

  useEffect(() => {
    fetchOpportunities();
  }, [currentPage, searchParams]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await opportunitiesApi.list({
        zip_code: filters.zip_code || undefined,
        cause_area: filters.cause_area || undefined,
        skills: filters.skills || undefined,
        page: currentPage,
        page_size: 12,
      });
      setOpportunities(response.results);
      setTotalCount(response.total);
    } catch (err) {
      setError('Failed to load opportunities. Please try again.');
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.zip_code) params.set('zip', filters.zip_code);
    if (filters.cause_area) params.set('cause', filters.cause_area);
    if (filters.skills) params.set('skills', filters.skills);
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleViewDetails = async (opportunity: Opportunity) => {
    try {
      setLoadingDetails(true);
      const details = await opportunitiesApi.getById(opportunity.id);
      setSelectedOpportunity(details);
      setModalOpen(true);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load opportunity details. Please try again.',
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to apply for opportunities.',
      });
      navigate('/login');
      return;
    }

    if (user?.user_type !== 'volunteer') {
      toast({
        variant: 'destructive',
        title: 'Invalid account type',
        description: 'Only volunteer accounts can apply for opportunities.',
      });
      return;
    }

    // Close details modal and open apply modal
    setModalOpen(false);
    setApplyModalOpen(true);
    // Set first available role as default
    if (selectedOpportunity && selectedOpportunity.roles.length > 0) {
      const availableRole = selectedOpportunity.roles.find(r => r.slots_available > r.slots_filled);
      setSelectedRole(availableRole || null);
    }
  };

  const handleSubmitApplication = async () => {
    if (!selectedOpportunity || !selectedRole) return;

    setIsApplying(true);
    try {
      const response = await opportunitiesApi.apply(selectedOpportunity.id, selectedRole.id, {
        cover_letter: coverLetter,
        availability_notes: availabilityNotes,
      });

      toast({
        title: 'Application submitted!',
        description: response.message,
      });

      // Reset form and close modal
      setApplyModalOpen(false);
      setCoverLetter('');
      setAvailabilityNotes('');
      setSelectedRole(null);

      // Refresh opportunities to update available spots
      fetchOpportunities();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Application failed',
        description: error instanceof Error ? error.message : 'Failed to submit application. Please try again.',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const causeAreas = [
    'Education',
    'Environment',
    'Technology',
    'Youth',
    'Hunger',
    'Health',
    'Arts',
    'Animals',
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Find Your Mission</h1>
          <p className="text-xl text-muted-foreground">
            Discover volunteer opportunities that match your skills and interests
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by skills..."
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                className="pl-10"
              />
            </div>
            <Input
              placeholder="ZIP Code"
              value={filters.zip_code}
              onChange={(e) => setFilters({ ...filters, zip_code: e.target.value })}
              className="md:w-32"
            />
            <Select
              value={filters.cause_area || "all"}
              onValueChange={(value) => setFilters({ ...filters, cause_area: value === "all" ? "" : value })}
            >
              <SelectTrigger className="md:w-48">
                <SelectValue placeholder="Cause Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Causes</SelectItem>
                {causeAreas.map((area) => (
                  <SelectItem key={area} value={area}>{area}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${totalCount} opportunities found`}
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}

        {/* Opportunities Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                    {opportunity.featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                  </div>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="font-medium">{opportunity.organization}</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      {opportunity.rating.toFixed(1)}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {opportunity.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    {opportunity.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                    {opportunity.skills.length > 3 && (
                      <Badge variant="outline">+{opportunity.skills.length - 3}</Badge>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{opportunity.is_remote ? 'Remote' : opportunity.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{opportunity.commitment}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{opportunity.spots_available} spots available</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    variant={opportunity.spots_available > 0 ? "default" : "secondary"}
                    disabled={opportunity.spots_available === 0}
                    onClick={() => handleViewDetails(opportunity)}
                  >
                    {opportunity.spots_available > 0 ? 'View Details' : 'No Spots Available'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && opportunities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground mb-4">
              No opportunities found matching your criteria
            </p>
            <Button onClick={() => {
              setFilters({ zip_code: '', cause_area: '', skills: '' });
              setSearchParams(new URLSearchParams());
            }}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && opportunities.length > 0 && totalCount > 12 && (
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {currentPage} of {Math.ceil(totalCount / 12)}
            </span>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage * 12 >= totalCount}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Opportunity Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedOpportunity.title}</DialogTitle>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <span className="font-medium">{selectedOpportunity.organization}</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-yellow-500" />
                    {selectedOpportunity.rating.toFixed(1)}
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">About this Opportunity</h3>
                  <p className="text-muted-foreground">{selectedOpportunity.description}</p>
                </div>

                {/* Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOpportunity.is_remote ? 'Remote' : selectedOpportunity.location}
                          {!selectedOpportunity.is_remote && ` (${selectedOpportunity.location_zip})`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Time Commitment</p>
                        <p className="text-sm text-muted-foreground">{selectedOpportunity.commitment}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Available Spots</p>
                        <p className="text-sm text-muted-foreground">{selectedOpportunity.spots_available} positions available</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Duration</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedOpportunity.start_date).toLocaleDateString()} - {new Date(selectedOpportunity.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Organization</p>
                        <p className="text-sm text-muted-foreground">{selectedOpportunity.organization}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Status</p>
                        <p className="text-sm text-muted-foreground capitalize">{selectedOpportunity.status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Required */}
                <div>
                  <h3 className="font-semibold mb-3">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpportunity.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {/* Roles Available */}
                {selectedOpportunity.roles && selectedOpportunity.roles.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Available Positions</h3>
                    <div className="space-y-3">
                      {selectedOpportunity.roles.map((role) => {
                        const spotsLeft = role.slots_available - role.slots_filled;
                        return (
                          <div key={role.id} className="p-4 rounded-lg border bg-card">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{role.title}</h4>
                              {spotsLeft > 0 ? (
                                <Badge variant="secondary">{spotsLeft} spots left</Badge>
                              ) : (
                                <Badge variant="destructive">Full</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                            {role.required_skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {role.required_skills.map((skill) => (
                                  <Badge key={skill.name} variant="outline" className="text-xs">
                                    {skill.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Remote Work */}
                {selectedOpportunity.is_remote && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <p className="font-medium text-blue-900 dark:text-blue-100">Remote Opportunity</p>
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      This opportunity can be completed remotely from anywhere.
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={handleApplyClick}>
                  Apply Now
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Modal */}
      <Dialog open={applyModalOpen} onOpenChange={setApplyModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedOpportunity && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Apply for {selectedOpportunity.title}</DialogTitle>
                <div className="text-muted-foreground mt-2">
                  {selectedOpportunity.organization}
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Role Selection */}
                {selectedOpportunity.roles.length > 1 && (
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Select a Role</Label>
                    <RadioGroup 
                      value={selectedRole?.id.toString()} 
                      onValueChange={(value) => {
                        const role = selectedOpportunity.roles.find(r => r.id.toString() === value);
                        setSelectedRole(role || null);
                      }}
                    >
                      {selectedOpportunity.roles.map((role) => {
                        const isAvailable = role.slots_available > role.slots_filled;
                        return (
                          <div key={role.id} className={`flex items-start space-x-3 p-4 rounded-lg border ${isAvailable ? 'cursor-pointer hover:bg-muted/50' : 'opacity-50'}`}>
                            <RadioGroupItem 
                              value={role.id.toString()} 
                              id={`role-${role.id}`}
                              disabled={!isAvailable}
                            />
                            <label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                              <div className="font-medium">{role.title}</div>
                              <div className="text-sm text-muted-foreground mt-1">{role.description}</div>
                              <div className="flex items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  {role.slots_available - role.slots_filled} spots left
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {role.time_commitment}
                                </span>
                              </div>
                            </label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                )}

                {/* Cover Letter */}
                <div>
                  <Label htmlFor="cover-letter" className="text-base font-semibold mb-2 block">
                    Why are you interested in this opportunity? (Optional)
                  </Label>
                  <Textarea
                    id="cover-letter"
                    placeholder="Tell us about your interest and what you hope to contribute..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                {/* Availability Notes */}
                <div>
                  <Label htmlFor="availability" className="text-base font-semibold mb-2 block">
                    Availability & Notes (Optional)
                  </Label>
                  <Textarea
                    id="availability"
                    placeholder="Let us know your availability or any other information..."
                    value={availabilityNotes}
                    onChange={(e) => setAvailabilityNotes(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                {/* Required Skills Notice */}
                {selectedRole && selectedRole.required_skills.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Required Skills</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedRole.required_skills.map((skill) => (
                            <Badge key={skill.name} variant="secondary">{skill.name}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setApplyModalOpen(false)} disabled={isApplying}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitApplication} 
                  disabled={!selectedRole || isApplying}
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Loading overlay */}
      {loadingDetails && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}
    </div>
  );
}