import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

// Mock notifications data
const mockNotifications = {
  unread: [
    {
      id: '1',
      type: 'application_accepted',
      title: 'Application Accepted!',
      message: 'Your application for "Beach Cleanup Initiative" has been accepted.',
      fullMessage: 'Congratulations! Your application for the Beach Cleanup Initiative has been accepted. You\'re scheduled to volunteer on Saturday, March 16th from 9:00 AM to 1:00 PM at Ocean Beach.',
      details: {
        'Opportunity': 'Beach Cleanup Initiative',
        'Organization': 'Clean Coast Coalition',
        'Date': 'Saturday, March 16th, 2024',
        'Time': '9:00 AM - 1:00 PM',
        'Location': 'Ocean Beach, Pier 39',
        'Coordinator': 'Sarah Johnson',
        'Contact': 'sarah.j@cleancoast.org',
      },
      nextSteps: [
        'Check your email for detailed instructions',
        'Complete the volunteer orientation module',
        'Join the WhatsApp group for event updates',
        'Bring gloves and water bottle on the day',
      ],
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
      fullMessage: 'We found a perfect volunteer opportunity that matches your teaching skills! The "After-School Tutoring Program" is looking for volunteers to help middle school students with math and science.',
      details: {
        'Opportunity': 'After-School Tutoring Program',
        'Organization': 'Youth Education Foundation',
        'Skills Matched': 'Teaching, Mathematics, Science',
        'Commitment': '2 hours/week for 3 months',
        'Location': 'Lincoln Middle School',
        'Students': '6-8 students per session',
      },
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
      fullMessage: 'This is a reminder about your upcoming volunteer shift at the Sunshine Community Garden. Please arrive 10 minutes early for check-in.',
      details: {
        'Event': 'Weekly Garden Maintenance',
        'Date': 'Tomorrow (Thursday, March 14th)',
        'Time': '9:00 AM - 12:00 PM',
        'Location': 'Sunshine Community Garden',
        'Address': '123 Green Street, Downtown',
        'Tasks': 'Planting, weeding, and watering',
        'Coordinator': 'Mike Chen',
      },
      additionalInfo: 'Weather forecast: Sunny, 72°F. Perfect gardening weather! Remember to bring sunscreen and gardening gloves.',
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
      fullMessage: 'Thank you for your interest in volunteering with Green Earth Foundation! We\'re excited to have passionate individuals like you join our mission to create a sustainable future.',
      details: {
        'From': 'Green Earth Foundation',
        'Sender': 'Emily Rodriguez, Volunteer Coordinator',
        'Subject': 'Welcome to Green Earth Foundation',
      },
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
      fullMessage: 'Thank you for applying to be a Tech Mentor with Code for Good. Unfortunately, all positions have been filled for this cohort. However, we were impressed with your application and encourage you to apply for our next cohort starting in April.',
      details: {
        'Position': 'Tech Mentor',
        'Organization': 'Code for Good',
        'Reason': 'All positions filled',
        'Next Opportunity': 'April 2024 Cohort',
      },
      additionalInfo: 'We\'ve added you to our waiting list and will notify you if a spot opens up.',
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
      fullMessage: 'Congratulations on reaching 10 volunteer hours! Your dedication to community service is making a real difference. You\'ve unlocked the "Rising Star" badge.',
      details: {
        'Total Hours': '10 hours',
        'Badge Earned': 'Rising Star ⭐',
        'Organizations Helped': '3',
        'Impact': '50+ people helped',
      },
      nextMilestone: 'Complete 25 hours to unlock the "Community Champion" badge!',
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
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

  const openNotificationDetails = (notification: any) => {
    setSelectedNotification(notification);
    setIsDetailsOpen(true);
    
    // Mark as read if it's unread
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };

  const renderNotification = (notification: any) => {
    const Icon = notification.icon;

    return (
      <div
        key={notification.id}
        className={`flex gap-4 p-4 border-b last:border-0 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer ${
          !notification.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
        }`}
        onClick={() => openNotificationDetails(notification)}
      >
        <div className={`mt-1 ${notification.iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <p className="font-medium">{notification.title}</p>
          <p className="text-sm text-muted-foreground">{notification.message}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatTimestamp(notification.timestamp)}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openNotificationDetails(notification);
              }}
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              View Details
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="flex items-start gap-2">
          {!notification.read && (
            <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                markAsRead(notification.id);
              }}
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              deleteNotification(notification.id);
            }}
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

        {/* Notification Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            {selectedNotification && (
              <>
                <DialogHeader>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 ${selectedNotification.iconColor}`}>
                      {React.createElement(selectedNotification.icon, { className: "h-6 w-6" })}
                    </div>
                    <div className="flex-1">
                      <DialogTitle className="text-xl mb-2">
                        {selectedNotification.title}
                      </DialogTitle>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {format(selectedNotification.timestamp, 'EEEE, MMMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                <div className="mt-6 space-y-6">
                  {/* Full Message */}
                  <div>
                    <p className="text-base leading-relaxed">
                      {selectedNotification.fullMessage}
                    </p>
                  </div>

                  {/* Details Section */}
                  {selectedNotification.details && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-sm uppercase text-gray-600 dark:text-gray-400">
                        Details
                      </h4>
                      {Object.entries(selectedNotification.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-start text-sm">
                          <span className="text-muted-foreground">{key}:</span>
                          <span className="font-medium text-right ml-4">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Next Steps */}
                  {selectedNotification.nextSteps && (
                    <div>
                      <h4 className="font-semibold mb-3">Next Steps</h4>
                      <ul className="space-y-2">
                        {selectedNotification.nextSteps.map((step: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Additional Info */}
                  {selectedNotification.additionalInfo && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
                      <p className="text-sm">
                        <AlertCircle className="h-4 w-4 text-blue-600 inline mr-2" />
                        {selectedNotification.additionalInfo}
                      </p>
                    </div>
                  )}

                  {/* Next Milestone */}
                  {selectedNotification.nextMilestone && (
                    <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4">
                      <p className="text-sm font-medium">
                        <Star className="h-4 w-4 text-yellow-600 inline mr-2" />
                        {selectedNotification.nextMilestone}
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter className="mt-6">
                  <div className="flex gap-2 w-full justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setIsDetailsOpen(false)}
                    >
                      Close
                    </Button>
                    {selectedNotification.actionUrl && (
                      <Button
                        onClick={() => {
                          window.location.href = selectedNotification.actionUrl;
                        }}
                      >
                        Go to {selectedNotification.type === 'application_accepted' ? 'Application' :
                               selectedNotification.type === 'new_opportunity' ? 'Opportunity' :
                               selectedNotification.type === 'reminder' ? 'Dashboard' :
                               selectedNotification.type === 'message' ? 'Messages' :
                               selectedNotification.type === 'achievement' ? 'Profile' : 'Page'}
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}