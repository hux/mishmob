import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building,
  Globe,
  MapPin,
  Phone,
  Mail,
  Users,
  Edit2,
  Save,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Shield,
  CreditCard,
  Settings,
  UserPlus,
  Trash2,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  added_date: string;
}

export function Organization() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock data - replace with API calls
  const [orgData, setOrgData] = useState({
    name: 'Green Earth Foundation',
    type: 'Environmental',
    website: 'https://greenearth.org',
    description: 'Dedicated to environmental conservation and community education.',
    phone: '(555) 123-4567',
    email: 'contact@greenearth.org',
    address_line1: '456 Eco Way',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94105',
    tax_id: '12-3456789',
    is_verified: true,
    logo_url: '',
  });

  const [teamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Jane Smith',
      email: 'jane@greenearth.org',
      role: 'Admin',
      added_date: '2025-01-01',
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@greenearth.org',
      role: 'Coordinator',
      added_date: '2025-01-10',
    },
  ]);

  const handleSave = async () => {
    try {
      // TODO: Implement API call
      toast({
        title: 'Organization updated',
        description: 'Your organization information has been saved.',
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update organization. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (user?.user_type !== 'host') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This page is only accessible to organization administrators.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization profile and team members
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="team">Team Members</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Organization Info */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Organization Information</CardTitle>
                    <CardDescription>
                      Your public organization profile
                    </CardDescription>
                  </div>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline">
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline">
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Organization Name</Label>
                    {isEditing ? (
                      <Input
                        id="name"
                        value={orgData.name}
                        onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm mt-1">{orgData.name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    {isEditing ? (
                      <Input
                        id="type"
                        value={orgData.type}
                        onChange={(e) => setOrgData({ ...orgData, type: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm mt-1">{orgData.type}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">
                    <Globe className="inline mr-2 h-4 w-4" />
                    Website
                  </Label>
                  {isEditing ? (
                    <Input
                      id="website"
                      type="url"
                      value={orgData.website}
                      onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm mt-1">
                      <a href={orgData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {orgData.website}
                      </a>
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={orgData.description}
                      onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm mt-1">{orgData.description}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">
                      <Phone className="inline mr-2 h-4 w-4" />
                      Phone
                    </Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        type="tel"
                        value={orgData.phone}
                        onChange={(e) => setOrgData({ ...orgData, phone: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm mt-1">{orgData.phone}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">
                      <Mail className="inline mr-2 h-4 w-4" />
                      Contact Email
                    </Label>
                    {isEditing ? (
                      <Input
                        id="email"
                        type="email"
                        value={orgData.email}
                        onChange={(e) => setOrgData({ ...orgData, email: e.target.value })}
                      />
                    ) : (
                      <p className="text-sm mt-1">{orgData.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>
                    <MapPin className="inline mr-2 h-4 w-4" />
                    Address
                  </Label>
                  {isEditing ? (
                    <div className="space-y-2 mt-2">
                      <Input
                        placeholder="Street Address"
                        value={orgData.address_line1}
                        onChange={(e) => setOrgData({ ...orgData, address_line1: e.target.value })}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <Input
                          placeholder="City"
                          value={orgData.city}
                          onChange={(e) => setOrgData({ ...orgData, city: e.target.value })}
                        />
                        <Input
                          placeholder="State"
                          value={orgData.state}
                          onChange={(e) => setOrgData({ ...orgData, state: e.target.value })}
                        />
                        <Input
                          placeholder="ZIP"
                          value={orgData.zip_code}
                          onChange={(e) => setOrgData({ ...orgData, zip_code: e.target.value })}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm mt-1">
                      {orgData.address_line1}<br />
                      {orgData.city}, {orgData.state} {orgData.zip_code}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Organization Logo</Label>
                  <div className="mt-2">
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      Manage who can create and manage opportunities
                    </CardDescription>
                  </div>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Added {new Date(member.added_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{member.role}</Badge>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verification Status</CardTitle>
                <CardDescription>
                  Verified organizations get additional benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                {orgData.is_verified ? (
                  <Alert className="mb-6">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      Your organization is verified
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your organization is not yet verified
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div>
                    <Label>Tax ID Number (EIN)</Label>
                    <p className="text-sm mt-1">{orgData.tax_id}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Required Documents</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        501(c)(3) Determination Letter
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Board of Directors List
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Annual Report
                      </li>
                    </ul>
                  </div>

                  {!orgData.is_verified && (
                    <Button className="w-full">
                      <Shield className="mr-2 h-4 w-4" />
                      Complete Verification
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benefits of Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Verified badge on all opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Higher visibility in search results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Access to advanced features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Priority support</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>
                  Manage your subscription and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-6 border rounded-lg mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Free Plan</h3>
                      <p className="text-muted-foreground">Perfect for small organizations</p>
                    </div>
                    <Badge variant="secondary">Current Plan</Badge>
                  </div>
                  <ul className="space-y-2 text-sm mb-6">
                    <li>✓ Up to 5 active opportunities</li>
                    <li>✓ Basic volunteer matching</li>
                    <li>✓ Email notifications</li>
                    <li>✓ Standard support</li>
                  </ul>
                  <Button variant="outline" className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Payment Method</h3>
                  <p className="text-sm text-muted-foreground">
                    No payment method on file
                  </p>
                  <Button variant="outline" className="mt-3">
                    Add Payment Method
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Email me when volunteers apply</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="text-sm">Weekly summary of applications</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">SMS notifications for urgent updates</span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive">
                  Delete Organization
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}