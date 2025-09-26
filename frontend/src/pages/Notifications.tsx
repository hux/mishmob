import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bell,
  BellOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Mail,
  MessageSquare,
  Settings,
  Trash2,
  Check,
  X,
  Heart,
  Users,
  Briefcase,
  Star,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock notifications data
const mockNotifications = {
  unread: [
    {
      id: '1',
      type: 'application_accepted',
      title: 'Application Accepted!',
      message: 'Your application for "Beach Cleanup Initiative" has been accepted.',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      actionUrl: '/applications',
      read: false,
    },
    {
      id: '2',
      type: 'new_opportunity',
      title: 'New Opportunity Match',
      message: 'A new opportunity matching your skills in "Education" is available.',
      icon: Heart,
      iconColor: 'text-blue-600',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      actionUrl: '/opportunities',
      read: false,
    },
    {
      id: '3',
      type: 'reminder',
      title: 'Volunteer Shift Tomorrow',
      message: 'Don\'t forget about your volunteer shift at Community Garden tomorrow at 9 AM.',
      icon: Calendar,
      iconColor: 'text-orange-600',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      actionUrl: '/dashboard',
      read: false,
    },
  ],
  read: [
    {
      id: '4',
      type: 'message',
      title: 'New Message from Green Earth Foundation',
      message: 'Thank you for your interest in volunteering with us...',
      icon: MessageSquare,
      iconColor: 'text-purple-600',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      actionUrl: '/messages',
      read: true,
    },
    {
      id: '5',
      type: 'application_rejected',
      title: 'Application Update',
      message: 'Unfortunately, the position for "Tech Mentor" has been filled.',
      icon: XCircle,
      iconColor: 'text-red-600',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      actionUrl: '/applications',
      read: true,
    },
    {
      id: '6',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: 'You\'ve completed 10 volunteer hours. Keep up the great work!',
      icon: Star,
      iconColor: 'text-yellow-600',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      actionUrl: '/profile',
      read: true,
    },
  ],
};

const notificationSettings = {
  email: {
    application_updates: true,
    new_opportunities: true,
    messages: true,
    reminders: true,
    newsletter: false,
  },
  push: {
    application_updates: true,
    new_opportunities: false,
    messages: true,
    reminders: true,
  },
  sms: {
    reminders: true,
    urgent_updates: true,
  },
};

export function Notifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [settings, setSettings] = useState(notificationSettings);
  const [activeTab, setActiveTab] = useState('all');

  const allNotifications = [...notifications.unread, ...notifications.read];
  const unreadCount = notifications.unread.length;

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (notificationId: string) => {
    const notification = notifications.unread.find(n => n.id === notificationId);
    if (notification) {
      setNotifications({
        unread: notifications.unread.filter(n => n.id !== notificationId),
        read: [{ ...notification, read: true }, ...notifications.read],
      });
    }
  };

  const markAllAsRead = () => {
    setNotifications({
      unread: [],
      read: [
        ...notifications.unread.map(n => ({ ...n, read: true })),
        ...notifications.read,
      ],
    });
    toast({
      title: 'All notifications marked as read',
    });
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications({
      unread: notifications.unread.filter(n => n.id !== notificationId),
      read: notifications.read.filter(n => n.id !== notificationId),
    });
    toast({
      title: 'Notification deleted',
    });
  };

  const clearAll = () => {
    setNotifications({ unread: [], read: [] });
    toast({
      title: 'All notifications cleared',
    });
  };

  const updateSettings = (category: string, setting: string, value: boolean) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category as keyof typeof settings],
        [setting]: value,
      },
    });
  };

  const renderNotification = (notification: any) => {
    const Icon = notification.icon;

    return (
      <div
        key={notification.id}
        className={`flex gap-4 p-4 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
          !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
        }`}
      >
        <div className={`mt-1 ${notification.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-medium">{notification.title}</p>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatTimestamp(notification.timestamp)}</span>
            {notification.actionUrl && (
              <a
                href={notification.actionUrl}
                className="text-primary hover:underline"
              >
                View Details
              </a>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2">
          {!notification.read && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => markAsRead(notification.id)}
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => deleteNotification(notification.id)}
            title="Delete"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your volunteer activities
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {unreadCount} unread
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All
              {allNotifications.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {allNotifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="default" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>All Notifications</CardTitle>
                  <div className="flex gap-2">
                    {unreadCount > 0 && (
                      <Button variant="outline" size="sm" onClick={markAllAsRead}>
                        Mark all as read
                      </Button>
                    )}
                    {allNotifications.length > 0 && (
                      <Button variant="outline" size="sm" onClick={clearAll}>
                        Clear all
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {allNotifications.length > 0 ? (
                  <div>
                    {allNotifications.map(renderNotification)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No notifications yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      We'll notify you when something important happens
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="unread" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Unread Notifications</CardTitle>
                  {unreadCount > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {notifications.unread.length > 0 ? (
                  <div>
                    {notifications.unread.map(renderNotification)}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">All caught up!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      You've read all your notifications
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* Email Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email Notifications
                </CardTitle>
                <CardDescription>
                  Choose what updates you want to receive via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.email).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label
                      htmlFor={`email-${key}`}
                      className="flex flex-col cursor-pointer"
                    >
                      <span className="text-sm font-medium">
                        {key.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {key === 'application_updates' && 'Get notified about your volunteer applications'}
                        {key === 'new_opportunities' && 'Receive alerts for opportunities matching your interests'}
                        {key === 'messages' && 'Email notifications for new messages'}
                        {key === 'reminders' && 'Reminder emails for upcoming volunteer shifts'}
                        {key === 'newsletter' && 'Weekly newsletter with impact stories'}
                      </span>
                    </Label>
                    <Switch
                      id={`email-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => updateSettings('email', key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Push Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Push Notifications
                </CardTitle>
                <CardDescription>
                  Real-time notifications in your browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.push).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label
                      htmlFor={`push-${key}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Label>
                    <Switch
                      id={`push-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => updateSettings('push', key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* SMS Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  SMS Notifications
                </CardTitle>
                <CardDescription>
                  Important updates sent to your phone
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings.sms).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label
                      htmlFor={`sms-${key}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Label>
                    <Switch
                      id={`sms-${key}`}
                      checked={value}
                      onCheckedChange={(checked) => updateSettings('sms', key, checked)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={() => {
                toast({
                  title: 'Settings saved',
                  description: 'Your notification preferences have been updated.',
                });
              }}>
                Save Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}