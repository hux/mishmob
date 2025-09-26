import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2 } from 'lucide-react';
import { opportunitiesApi, CreateOpportunityData, CreateRoleData } from '@/services/api';

const CAUSE_AREAS = [
  { value: 'education', label: 'Education' },
  { value: 'environment', label: 'Environment' },
  { value: 'health', label: 'Health' },
  { value: 'housing', label: 'Housing' },
  { value: 'hunger', label: 'Hunger' },
  { value: 'seniors', label: 'Seniors' },
  { value: 'youth', label: 'Youth' },
  { value: 'animals', label: 'Animals' },
  { value: 'arts', label: 'Arts & Culture' },
  { value: 'community', label: 'Community' },
  { value: 'emergency', label: 'Emergency Response' },
  { value: 'other', label: 'Other' },
];

export default function CreateOpportunity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateOpportunityData>({
    title: '',
    description: '',
    cause_area: '',
    start_date: '',
    end_date: '',
    location_name: '',
    location_address: '',
    location_zip: '',
    is_remote: false,
    impact_statement: '',
    requirements: '',
    time_commitment: '',
    roles: [{
      title: '',
      description: '',
      responsibilities: '',
      slots_available: 1,
      time_commitment: '',
      required_skills: [],
      developed_skills: [],
    }],
  });

  const [skillInput, setSkillInput] = useState<{ [key: number]: { required: string; developed: string } }>({
    0: { required: '', developed: '' }
  });

  // Handle form field changes
  const handleChange = (field: keyof CreateOpportunityData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle role field changes
  const handleRoleChange = (index: number, field: keyof CreateRoleData, value: any) => {
    const newRoles = [...formData.roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setFormData(prev => ({ ...prev, roles: newRoles }));
  };

  // Add skill to role
  const addSkill = (roleIndex: number, type: 'required' | 'developed') => {
    const skill = skillInput[roleIndex]?.[type]?.trim();
    if (!skill) return;

    const newRoles = [...formData.roles];
    const skillsField = type === 'required' ? 'required_skills' : 'developed_skills';
    
    if (!newRoles[roleIndex][skillsField].includes(skill)) {
      newRoles[roleIndex][skillsField] = [...newRoles[roleIndex][skillsField], skill];
      setFormData(prev => ({ ...prev, roles: newRoles }));
      
      // Clear input
      setSkillInput(prev => ({
        ...prev,
        [roleIndex]: { ...prev[roleIndex], [type]: '' }
      }));
    }
  };

  // Remove skill from role
  const removeSkill = (roleIndex: number, type: 'required' | 'developed', skill: string) => {
    const newRoles = [...formData.roles];
    const skillsField = type === 'required' ? 'required_skills' : 'developed_skills';
    newRoles[roleIndex][skillsField] = newRoles[roleIndex][skillsField].filter(s => s !== skill);
    setFormData(prev => ({ ...prev, roles: newRoles }));
  };

  // Add new role
  const addRole = () => {
    const newIndex = formData.roles.length;
    setFormData(prev => ({
      ...prev,
      roles: [...prev.roles, {
        title: '',
        description: '',
        responsibilities: '',
        slots_available: 1,
        time_commitment: '',
        required_skills: [],
        developed_skills: [],
      }]
    }));
    setSkillInput(prev => ({ ...prev, [newIndex]: { required: '', developed: '' } }));
  };

  // Remove role
  const removeRole = (index: number) => {
    if (formData.roles.length === 1) {
      toast({
        title: "Cannot remove role",
        description: "At least one role is required",
        variant: "destructive",
      });
      return;
    }
    
    const newRoles = formData.roles.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, roles: newRoles }));
    
    // Update skill inputs
    const newSkillInputs: any = {};
    Object.keys(skillInput).forEach((key) => {
      const keyIndex = parseInt(key);
      if (keyIndex < index) {
        newSkillInputs[keyIndex] = skillInput[keyIndex];
      } else if (keyIndex > index) {
        newSkillInputs[keyIndex - 1] = skillInput[keyIndex];
      }
    });
    setSkillInput(newSkillInputs);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || !formData.cause_area || 
        !formData.start_date || !formData.end_date || !formData.location_name || 
        !formData.location_address || !formData.location_zip || !formData.impact_statement || 
        !formData.time_commitment) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate roles
    const invalidRoles = formData.roles.some(role => !role.title || !role.description);
    if (invalidRoles) {
      toast({
        title: "Invalid roles",
        description: "Each role must have a title and description",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await opportunitiesApi.create(formData);
      
      toast({
        title: "Opportunity created!",
        description: "Your opportunity has been created as a draft. You can publish it when ready.",
      });
      
      // Navigate to opportunity detail page
      navigate(`/opportunities/${response.opportunity_id}`);
    } catch (error: any) {
      toast({
        title: "Failed to create opportunity",
        description: error.message || "An error occurred while creating the opportunity",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authorized
  if (!user || user.user_type !== 'host') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Not Authorized</CardTitle>
            <CardDescription>
              Only registered organizations can create opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              To create opportunities, you need to register as a host organization.
            </p>
            <Button onClick={() => navigate('/register?type=host')}>
              Register as Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Opportunity</CardTitle>
            <CardDescription>
              Create a volunteer opportunity for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                
                <div>
                  <Label htmlFor="title">Opportunity Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g., Website Development for Local Nonprofit"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Provide a detailed description of the opportunity..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cause_area">Cause Area *</Label>
                  <Select value={formData.cause_area} onValueChange={(value) => handleChange('cause_area', value)}>
                    <SelectTrigger id="cause_area">
                      <SelectValue placeholder="Select a cause area" />
                    </SelectTrigger>
                    <SelectContent>
                      {CAUSE_AREAS.map(area => (
                        <SelectItem key={area.value} value={area.value}>
                          {area.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="impact_statement">Impact Statement *</Label>
                  <Textarea
                    id="impact_statement"
                    value={formData.impact_statement}
                    onChange={(e) => handleChange('impact_statement', e.target.value)}
                    placeholder="Describe the impact this opportunity will have..."
                    rows={3}
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Schedule</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date *</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleChange('start_date', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="end_date">End Date *</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleChange('end_date', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="time_commitment">Time Commitment *</Label>
                  <Input
                    id="time_commitment"
                    value={formData.time_commitment}
                    onChange={(e) => handleChange('time_commitment', e.target.value)}
                    placeholder="e.g., 2-4 hours per week"
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Switch
                    id="is_remote"
                    checked={formData.is_remote}
                    onCheckedChange={(checked) => handleChange('is_remote', checked)}
                  />
                  <Label htmlFor="is_remote">This is a remote opportunity</Label>
                </div>

                <div>
                  <Label htmlFor="location_name">Location Name *</Label>
                  <Input
                    id="location_name"
                    value={formData.location_name}
                    onChange={(e) => handleChange('location_name', e.target.value)}
                    placeholder="e.g., Community Center"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location_address">Address *</Label>
                  <Input
                    id="location_address"
                    value={formData.location_address}
                    onChange={(e) => handleChange('location_address', e.target.value)}
                    placeholder="123 Main St, City, State"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location_zip">ZIP Code *</Label>
                  <Input
                    id="location_zip"
                    value={formData.location_zip}
                    onChange={(e) => handleChange('location_zip', e.target.value)}
                    placeholder="12345"
                    pattern="[0-9]{5}"
                    required
                  />
                </div>
              </div>

              <Separator />

              {/* Requirements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Requirements</h3>
                
                <div>
                  <Label htmlFor="requirements">General Requirements (optional)</Label>
                  <Textarea
                    id="requirements"
                    value={formData.requirements}
                    onChange={(e) => handleChange('requirements', e.target.value)}
                    placeholder="Any general requirements for volunteers..."
                    rows={3}
                  />
                </div>
              </div>

              <Separator />

              {/* Roles */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Volunteer Roles</h3>
                  <Button type="button" variant="outline" size="sm" onClick={addRole}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Role
                  </Button>
                </div>

                {formData.roles.map((role, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">Role {index + 1}</CardTitle>
                        {formData.roles.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRole(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor={`role-title-${index}`}>Role Title *</Label>
                        <Input
                          id={`role-title-${index}`}
                          value={role.title}
                          onChange={(e) => handleRoleChange(index, 'title', e.target.value)}
                          placeholder="e.g., Frontend Developer"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`role-description-${index}`}>Role Description *</Label>
                        <Textarea
                          id={`role-description-${index}`}
                          value={role.description}
                          onChange={(e) => handleRoleChange(index, 'description', e.target.value)}
                          placeholder="Describe this role..."
                          rows={2}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor={`role-responsibilities-${index}`}>Responsibilities</Label>
                        <Textarea
                          id={`role-responsibilities-${index}`}
                          value={role.responsibilities}
                          onChange={(e) => handleRoleChange(index, 'responsibilities', e.target.value)}
                          placeholder="List key responsibilities..."
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`role-slots-${index}`}>Available Spots *</Label>
                          <Input
                            id={`role-slots-${index}`}
                            type="number"
                            min="1"
                            value={role.slots_available}
                            onChange={(e) => handleRoleChange(index, 'slots_available', parseInt(e.target.value) || 1)}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor={`role-time-${index}`}>Time Commitment</Label>
                          <Input
                            id={`role-time-${index}`}
                            value={role.time_commitment}
                            onChange={(e) => handleRoleChange(index, 'time_commitment', e.target.value)}
                            placeholder="e.g., 2 hours/week"
                          />
                        </div>
                      </div>

                      {/* Required Skills */}
                      <div>
                        <Label>Required Skills</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Add a required skill..."
                            value={skillInput[index]?.required || ''}
                            onChange={(e) => setSkillInput(prev => ({
                              ...prev,
                              [index]: { ...prev[index], required: e.target.value }
                            }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill(index, 'required');
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => addSkill(index, 'required')}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {role.required_skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-primary/10 text-primary rounded-md"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(index, 'required', skill)}
                                className="hover:text-primary/70"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Skills to Develop */}
                      <div>
                        <Label>Skills to Develop</Label>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Add a skill to develop..."
                            value={skillInput[index]?.developed || ''}
                            onChange={(e) => setSkillInput(prev => ({
                              ...prev,
                              [index]: { ...prev[index], developed: e.target.value }
                            }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addSkill(index, 'developed');
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => addSkill(index, 'developed')}
                          >
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {role.developed_skills?.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-md"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => removeSkill(index, 'developed', skill)}
                                className="hover:text-green-600"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Opportunity'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}