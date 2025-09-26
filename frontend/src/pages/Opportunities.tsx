import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { MapPin, Clock, Users, Star, Search, Filter, Calendar, Building, Globe, CheckCircle2, AlertCircle, Loader2, SlidersHorizontal, X } from 'lucide-react';
import { opportunitiesApi } from '@/services/api';
import type { Opportunity, OpportunityDetail, Role } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SkillMatchBreakdown } from '@/components/SkillMatchBreakdown';
import { OpportunityCard } from '@/components/OpportunityCard';

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
  const [showFilters, setShowFilters] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    zip_code: searchParams.get('zip') || '',
    cause_area: searchParams.get('cause') || '',
    skills: searchParams.get('skills') || '',
    remote_only: searchParams.get('remote') === 'true',
    status: searchParams.get('status') || 'open',
  });

  // Update filters when URL params change
  useEffect(() => {
    setFilters({
      zip_code: searchParams.get('zip') || '',
      cause_area: searchParams.get('cause') || '',
      skills: searchParams.get('skills') || '',
      remote_only: searchParams.get('remote') === 'true',
      status: searchParams.get('status') || 'open',
    });
  }, [searchParams]);

  useEffect(() => {
    // Reset to page 1 when search params change (but not when page changes)
    const pageParam = searchParams.get('page');
    if (!pageParam && currentPage !== 1) {
      setCurrentPage(1);
    }
    fetchOpportunities();
  }, [currentPage, searchParams]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get filter values from URL params instead of filters state
      const response = await opportunitiesApi.list({
        zip_code: searchParams.get('zip') || undefined,
        cause_area: searchParams.get('cause') || undefined,
        skills: searchParams.get('skills') || undefined,
        remote_only: searchParams.get('remote') === 'true' || undefined,
        status: searchParams.get('status') || 'open',
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
    if (filters.remote_only) params.set('remote', 'true');
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    setSearchParams(params);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ zip_code: '', cause_area: '', skills: '', remote_only: false, status: 'open' });
    setSearchParams(new URLSearchParams());
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (filters.zip_code) count++;
    if (filters.cause_area) count++;
    if (filters.skills) count++;
    if (filters.remote_only) count++;
    if (filters.status && filters.status !== 'open') count++;
    return count;
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
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, organization, skills, or keywords..."
                value={filters.skills}
                onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleSearch} 
                className="whitespace-nowrap"
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="whitespace-nowrap"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount()}
                  </Badge>
                )}
              </Button>
              {activeFiltersCount() > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilters}
                  title="Clear all filters"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="zip">Location (ZIP Code)</Label>
                    <Input
                      id="zip"
                      placeholder="e.g., 94105"
                      value={filters.zip_code}
                      onChange={(e) => setFilters({ ...filters, zip_code: e.target.value })}
                      className="mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cause">Cause Area</Label>
                    <Select
                      value={filters.cause_area || "all"}
                      onValueChange={(value) => setFilters({ ...filters, cause_area: value === "all" ? "" : value })}
                    >
                      <SelectTrigger id="cause" className="mt-2">
                        <SelectValue placeholder="All Causes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Causes</SelectItem>
                        {causeAreas.map((area) => (
                          <SelectItem key={area} value={area}>{area}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => setFilters({ ...filters, status: value })}
                    >
                      <SelectTrigger id="status" className="mt-2">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.remote_only}
                        onChange={(e) => setFilters({ ...filters, remote_only: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Remote Only</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end mt-4 gap-2">
                  <Button variant="outline" onClick={() => setShowFilters(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => { handleSearch(); setShowFilters(false); }}>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-16 bg-gray-200 rounded animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                      <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Opportunities Grid */}
        {!loading && !error && opportunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {opportunities.map((opportunity) => (
              <OpportunityCard 
                key={opportunity.id}
                opportunity={opportunity}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && opportunities.length === 0 && (
          <Card className="text-center py-16">
            <CardContent className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold">No opportunities found</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {activeFiltersCount() > 0 
                  ? "Try adjusting your filters or search terms to find more opportunities."
                  : "Check back soon for new volunteer opportunities in your area."}
              </p>
              {activeFiltersCount() > 0 && (
                <Button onClick={clearFilters} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
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
                  {selectedOpportunity.host_info && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-yellow-500" />
                      {selectedOpportunity.host_info.rating_average.toFixed(1)}
                    </span>
                  )}
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">About this Opportunity</h3>
                  <p className="text-muted-foreground">{selectedOpportunity.description}</p>
                </div>

                {/* Impact Statement */}
                {selectedOpportunity.impact_statement && (
                  <div>
                    <h3 className="font-semibold mb-2">Your Impact</h3>
                    <p className="text-muted-foreground">{selectedOpportunity.impact_statement}</p>
                  </div>
                )}

                {/* Requirements */}
                {selectedOpportunity.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2">Requirements</h3>
                    <p className="text-muted-foreground">{selectedOpportunity.requirements}</p>
                  </div>
                )}

                {/* Key Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOpportunity.is_remote ? 'Remote' : selectedOpportunity.location_name}
                          {!selectedOpportunity.is_remote && ` (${selectedOpportunity.location_zip})`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Time Commitment</p>
                        <p className="text-sm text-muted-foreground">{selectedOpportunity.time_commitment}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Available Spots</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedOpportunity.roles?.reduce((total, role) => total + (role.slots_available - role.slots_filled), 0) || 0} positions available
                        </p>
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

                    {selectedOpportunity.cause_area && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Cause Area</p>
                          <p className="text-sm text-muted-foreground">{selectedOpportunity.cause_area}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Skill Match Breakdown */}
                {isAuthenticated && user?.user_type === 'volunteer' && (
                  <SkillMatchBreakdown 
                    opportunityId={selectedOpportunity.id}
                    requiredSkills={selectedOpportunity.roles?.flatMap(role => 
                      role.required_skills.map(skill => ({ name: skill.name }))
                    ).filter((skill, index, self) => 
                      self.findIndex(s => s.name === skill.name) === index
                    ) || []}
                    matchScore={selectedOpportunity.match_score}
                  />
                )}

                {/* Skills Required */}
                <div>
                  <h3 className="font-semibold mb-3">Skills Required</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOpportunity.roles?.flatMap(role => 
                      role.required_skills.map(skill => skill.name)
                    ).filter((skill, index, self) => self.indexOf(skill) === index)
                    .map((skill) => (
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