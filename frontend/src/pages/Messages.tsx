import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi, Conversation, Message as MessageType } from '@/services/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  MessageSquare,
  Send,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Archive,
  Star,
  Check,
  CheckCheck,
  Plus,
  Loader2,
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Fetch conversations
  const { data: conversationsData, isLoading: isLoadingConversations } = useQuery({
    queryKey: ['conversations', searchQuery],
    queryFn: () => messagesApi.getConversations(1, searchQuery),
  });

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['messages', selectedConversationId],
    queryFn: () => selectedConversationId ? messagesApi.getMessages(selectedConversationId) : null,
    enabled: !!selectedConversationId,
  });

  // Mark conversation as read
  const markReadMutation = useMutation({
    mutationFn: (conversationId: number) => messagesApi.markConversationRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: number; content: string }) =>
      messagesApi.sendMessage(conversationId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setMessageInput('');
      scrollToBottom();
    },
    onError: () => {
      toast({
        title: 'Failed to send message',
        description: 'Please try again',
        variant: 'destructive',
      });
    },
  });

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId && conversationsData?.conversations) {
      const conversation = conversationsData.conversations.find(c => c.id === selectedConversationId);
      if (conversation && conversation.unread_count > 0) {
        markReadMutation.mutate(selectedConversationId);
      }
    }
  }, [selectedConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messagesData]);

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversationId,
      content: messageInput,
    });
  };

  const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.subject) return conversation.subject;
    
    const otherParticipants = conversation.participants.filter(p => p.id !== user?.id);
    if (otherParticipants.length === 1) {
      const other = otherParticipants[0];
      return `${other.first_name} ${other.last_name}`.trim() || other.username;
    }
    
    return otherParticipants.map(p => p.first_name).join(', ');
  };

  const getConversationAvatar = (conversation: Conversation) => {
    const otherParticipants = conversation.participants.filter(p => p.id !== user?.id);
    if (otherParticipants.length > 0) {
      return otherParticipants[0].profile_picture;
    }
    return null;
  };

  const getConversationInitials = (conversation: Conversation) => {
    const title = getConversationTitle(conversation);
    return title.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const openConversationDetails = () => {
    const conversation = conversationsData?.conversations.find(c => c.id === selectedConversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      setIsDetailsOpen(true);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Messages</h1>
            <p className="text-muted-foreground">
              Communicate with organizations and coordinators
            </p>
          </div>
          
          <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start a New Conversation</DialogTitle>
                <DialogDescription>
                  Search for users to start a conversation
                </DialogDescription>
              </DialogHeader>
              <NewConversationDialog onClose={() => setIsNewConversationOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card className="h-[calc(100vh-200px)] overflow-hidden">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-full md:w-1/3 border-r">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100%-73px)]">
                {isLoadingConversations ? (
                  <div className="p-4 space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y">
                    {conversationsData?.conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                          selectedConversationId === conversation.id ? 'bg-gray-50 dark:bg-gray-900' : ''
                        }`}
                        onClick={() => setSelectedConversationId(conversation.id)}
                      >
                        <div className="flex gap-3">
                          <Avatar>
                            <AvatarImage src={getConversationAvatar(conversation) || undefined} />
                            <AvatarFallback>
                              {getConversationInitials(conversation)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex-1 overflow-hidden">
                                <p className="font-medium truncate">
                                  {getConversationTitle(conversation)}
                                </p>
                                {conversation.is_group && (
                                  <p className="text-xs text-muted-foreground">
                                    {conversation.participants.length} participants
                                  </p>
                                )}
                              </div>
                              <div className="text-right ml-2">
                                {conversation.last_message && (
                                  <p className="text-xs text-muted-foreground">
                                    {formatMessageTime(conversation.last_message.created_at)}
                                  </p>
                                )}
                                {conversation.unread_count > 0 && (
                                  <Badge variant="default" className="mt-1">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {conversation.last_message && (
                              <p className={`text-sm truncate ${
                                conversation.unread_count > 0 ? 'font-medium' : 'text-muted-foreground'
                              }`}>
                                {conversation.last_message.sender.id === user?.id && (
                                  <span className="mr-1">
                                    {conversation.last_message.is_read ? (
                                      <CheckCheck className="inline h-3 w-3" />
                                    ) : (
                                      <Check className="inline h-3 w-3" />
                                    )}
                                  </span>
                                )}
                                {conversation.last_message.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Message Thread */}
            <div className="flex-1 flex flex-col">
              {selectedConversationId ? (
                <>
                  {/* Header */}
                  {conversationsData?.conversations && (
                    <div className="p-4 border-b flex items-center justify-between">
                      {(() => {
                        const conv = conversationsData.conversations.find(c => c.id === selectedConversationId);
                        if (!conv) return null;
                        
                        return (
                          <>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={getConversationAvatar(conv) || undefined} />
                                <AvatarFallback>
                                  {getConversationInitials(conv)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{getConversationTitle(conv)}</p>
                                {conv.is_group && (
                                  <p className="text-sm text-muted-foreground">
                                    {conv.participants.length} participants
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="icon" variant="ghost" onClick={openConversationDetails} title="View conversation details">
                                <AlertCircle className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost">
                                <Star className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost">
                                <Archive className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {isLoadingMessages ? (
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                            <Skeleton className="h-16 w-48 rounded-lg" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messagesData?.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.sender.id === user?.id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.sender.id === user?.id
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-gray-100 dark:bg-gray-800'
                              }`}
                            >
                              {message.sender.id !== user?.id && conversationsData?.conversations.find(c => c.id === selectedConversationId)?.is_group && (
                                <p className="text-xs font-medium mb-1">
                                  {`${message.sender.first_name} ${message.sender.last_name}`.trim() || message.sender.username}
                                </p>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.sender.id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                              }`}>
                                {format(new Date(message.created_at), 'HH:mm')}
                                {message.sender.id === user?.id && (
                                  <span className="ml-2">
                                    {message.is_read ? (
                                      <CheckCheck className="inline h-3 w-3" />
                                    ) : (
                                      <Check className="inline h-3 w-3" />
                                    )}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Textarea
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                        rows={1}
                      />
                      <Button size="icon" variant="ghost">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        onClick={sendMessage}
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      >
                        {sendMessageMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Conversation Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            {selectedConversation && (
              <>
                <DialogHeader>
                  <DialogTitle>Conversation Details</DialogTitle>
                  <DialogDescription>
                    Information about this conversation
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Conversation Title & Info */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={getConversationAvatar(selectedConversation) || undefined} />
                      <AvatarFallback>
                        {getConversationInitials(selectedConversation)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{getConversationTitle(selectedConversation)}</h3>
                      {selectedConversation.subject && (
                        <p className="text-muted-foreground">Subject: {selectedConversation.subject}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedConversation.is_group ? 'Group Conversation' : 'Direct Message'}
                      </p>
                    </div>
                  </div>

                  {/* Participants */}
                  <div>
                    <h4 className="font-semibold mb-3">Participants ({selectedConversation.participants.length})</h4>
                    <div className="space-y-2">
                      {selectedConversation.participants.map((participant) => (
                        <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={participant.profile_picture} />
                            <AvatarFallback>
                              {`${participant.first_name[0]}${participant.last_name[0]}`.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">
                              {`${participant.first_name} ${participant.last_name}`.trim() || participant.username}
                              {participant.id === user?.id && ' (You)'}
                            </p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {participant.user_type.replace('_', ' ')}
                            </p>
                          </div>
                          {participant.is_online && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" title="Online" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Related Opportunity (if applicable) */}
                  {selectedConversation.related_opportunity && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Related Opportunity</h4>
                      <p className="text-sm">{selectedConversation.related_opportunity.title}</p>
                      <a
                        href={`/opportunities/${selectedConversation.related_opportunity.id}`}
                        className="text-sm text-primary hover:underline mt-1 inline-block"
                      >
                        View opportunity →
                      </a>
                    </div>
                  )}

                  {/* Conversation Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium">
                        {format(new Date(selectedConversation.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Last Activity</p>
                      <p className="font-medium">
                        {selectedConversation.last_message 
                          ? formatMessageTime(selectedConversation.last_message.created_at)
                          : 'No messages yet'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                      Close
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        // Implement archive/leave conversation
                        toast({
                          title: 'Feature coming soon',
                          description: 'Archive functionality will be available soon.',
                        });
                      }}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive Conversation
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// New Conversation Dialog Component
function NewConversationDialog({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [initialMessage, setInitialMessage] = useState('');
  const [subject, setSubject] = useState('');
  
  // Search users
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['userSearch', searchQuery],
    queryFn: () => messagesApi.searchUsers(searchQuery),
    enabled: searchQuery.length >= 2,
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: messagesApi.createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: 'Conversation created',
        description: 'Your message has been sent',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Failed to create conversation',
        description: 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const handleCreateConversation = () => {
    if (selectedUsers.length === 0 || !initialMessage.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please select at least one user and write a message',
        variant: 'destructive',
      });
      return;
    }

    createConversationMutation.mutate({
      participant_ids: selectedUsers,
      subject: subject || undefined,
      initial_message: initialMessage,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="Search for users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {isLoading && (
          <div className="mt-2 text-sm text-muted-foreground">Searching...</div>
        )}
        {searchResults && searchResults.length > 0 && (
          <div className="mt-2 border rounded-md max-h-40 overflow-y-auto">
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  if (selectedUsers.includes(user.id)) {
                    setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                  } else {
                    setSelectedUsers([...selectedUsers, user.id]);
                  }
                }}
                className={`w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  selectedUsers.includes(user.id) ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_picture} />
                    <AvatarFallback>
                      {`${user.first_name[0]}${user.last_name[0]}`.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {`${user.first_name} ${user.last_name}`.trim() || user.username}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.user_type}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedUsers.length > 1 && (
        <div>
          <Input
            placeholder="Group subject (optional)"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      )}

      <div>
        <Textarea
          placeholder="Write your first message..."
          value={initialMessage}
          onChange={(e) => setInitialMessage(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleCreateConversation}
          disabled={selectedUsers.length === 0 || !initialMessage.trim() || createConversationMutation.isPending}
        >
          {createConversationMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Start Conversation'
          )}
        </Button>
      </div>
    </div>
  );
}