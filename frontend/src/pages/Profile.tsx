import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  MapPin,
  Building,
  Calendar,
  Edit2,
  Save,
  X,
  Upload,
  Award,
  Briefcase,
  Heart,
} from 'lucide-react';
import { SkillsManager } from '@/components/SkillsManager';

export function Profile() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);

  if (!user) {
    return null;
  }

  const getInitials = () => {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U';
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to update user profile
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      setIsEditing(false);
      refreshUser();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profile_picture} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">
                    {user.first_name} {user.last_name}
                  </h1>
                  {user.is_verified && (
                    <Badge variant="default" className="bg-green-600">
                      Verified
                    </Badge>
                  )}
                  <Badge variant="secondary" className="capitalize">
                    {user.user_type}
                  </Badge>
                </div>
                <p className="text-muted-foreground">@{user.username}</p>
              </div>

              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="first_name"
                        value={editedUser?.first_name}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser!, first_name: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm mt-1">{user.first_name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="last_name"
                        value={editedUser?.last_name}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser!, last_name: e.target.value })
                        }
                      />
                    ) : (
                      <p className="text-sm mt-1">{user.last_name}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">
                    <Mail className="inline mr-2 h-4 w-4" />
                    Email
                  </Label>
                  <p className="text-sm mt-1">{user.email}</p>
                </div>

                <div>
                  <Label htmlFor="zip_code">
                    <MapPin className="inline mr-2 h-4 w-4" />
                    Zip Code
                  </Label>
                  {isEditing ? (
                    <Input
                      id="zip_code"
                      value={editedUser?.zip_code || ''}
                      onChange={(e) =>
                        setEditedUser({ ...editedUser!, zip_code: e.target.value })
                      }
                      placeholder="Enter your zip code"
                    />
                  ) : (
                    <p className="text-sm mt-1">{user.zip_code || 'Not set'}</p>
                  )}
                </div>

                {user.user_type === 'host' && user.organization_id && (
                  <div>
                    <Label>
                      <Building className="inline mr-2 h-4 w-4" />
                      Organization
                    </Label>
                    <p className="text-sm mt-1">Organization ID: {user.organization_id}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bio/About */}
            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
                <CardDescription>
                  Tell us about yourself and your interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    placeholder="Write a brief bio..."
                    rows={4}
                    className="w-full"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No bio added yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Skills (for volunteers) */}
            {user.user_type === 'volunteer' && <SkillsManager />}
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your recent volunteer activities and contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-100 p-2">
                      <Heart className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Applied to Beach Cleanup</p>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-green-100 p-2">
                      <Award className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Completed Food Bank Volunteer Training</p>
                      <p className="text-sm text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-purple-100 p-2">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Joined Community Garden Project</p>
                      <p className="text-sm text-muted-foreground">2 weeks ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Hours Volunteered</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Projects Completed</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">Skills Developed</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Username</Label>
                  <p className="text-sm mt-1">@{user.username}</p>
                </div>
                <div>
                  <Label>Account Type</Label>
                  <p className="text-sm mt-1 capitalize">{user.user_type}</p>
                </div>
                <div>
                  <Label>Member Since</Label>
                  <p className="text-sm mt-1">
                    <Calendar className="inline mr-2 h-4 w-4" />
                    January 2025
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Manage Email Preferences
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}