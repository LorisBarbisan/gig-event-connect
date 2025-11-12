import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useToast } from "@/hooks/use-toast";
import { useOptimizedAuth } from "@/hooks/useOptimizedAuth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, MessageCircle, Send, Trash2, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface User {
  id: number;
  email: string;
  role: "freelancer" | "recruiter" | "admin";
  deleted_at?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number | null;
  content: string;
  is_read: boolean;
  is_system_message: boolean;
  created_at: string;
  sender: User;
}

interface Conversation {
  id: number;
  participant_one_id: number;
  participant_two_id: number;
  last_message_at: string;
  created_at: string;
  otherUser: User;
}

// Helper function to check if a user is deleted
const isUserDeleted = (user: User | undefined): boolean => {
  return user?.deleted_at !== null && user?.deleted_at !== undefined;
};

// Helper function to get display name for a user
const getDisplayName = (user: User): string => {
  if (isUserDeleted(user)) {
    return `[Deleted ${user.role === "freelancer" ? "Freelancer" : "Company"}]`;
  }

  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  if (user.company_name) {
    return user.company_name;
  }
  return user.email;
};

// Helper function to get avatar initials
const getAvatarInitials = (user: User): string => {
  if (isUserDeleted(user)) {
    return user.role === "freelancer" ? "DF" : "DC";
  }

  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  if (user.company_name) {
    return user.company_name.substring(0, 2).toUpperCase();
  }
  return user.email.substring(0, 2).toUpperCase();
};

// Helper function to format dates
const formatDate = (dateString: string | Date): string => {
  // Handle both string and Date object inputs
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;

  // Validate date
  if (isNaN(date.getTime())) {
    console.error("Invalid date:", dateString);
    return "Invalid date";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Handle future dates
  if (diffMs < 0) return "In the future";
  console.log("diffMs", diffMs);

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Relative time ranges
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  if (diffYears < 5) return `${diffYears}y ago`;

  // Fallback to full date for old timestamps
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function MessagingInterface() {
  const { user } = useOptimizedAuth();

  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { subscribe } = useWebSocket();

  // Fetch messages using React Query (enabled only when a conversation is selected)
  // NO CACHING - Always fetch fresh data from server
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    queryFn: async () => {
      const data = await apiRequest(`/api/conversations/${selectedConversation}/messages`);
      // Ensure all created_at timestamps are properly formatted ISO strings
      return data.map((msg: Message) => ({
        ...msg,
        created_at:
          typeof msg.created_at === "string"
            ? msg.created_at
            : new Date(msg.created_at).toISOString(),
      }));
    },
    enabled: selectedConversation !== null,
    refetchOnMount: "always",
    refetchOnWindowFocus: true, // Always refetch on focus
    staleTime: 0, // Always consider stale - no caching
    gcTime: 1000, // Keep in cache for 1 second (was 0, but 0 might cause issues)
    refetchOnReconnect: true,
  });

  // Fetch conversations (still using React Query)
  // NO CACHING - Always fetch fresh data from server
  const {
    data: conversations = [],
    isLoading: conversationsLoading,
    refetch: refetchConversations,
    error: conversationsError,
  } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    queryFn: async () => {
      console.log("🔄 Fetching conversations from API...");
      try {
        const data = await apiRequest("/api/conversations");
        console.log("✅ Conversations fetched successfully:", data?.length || 0, "conversations");
        return data;
      } catch (error) {
        console.error("❌ Error fetching conversations:", error);
        throw error;
      }
    },
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0, // Always consider data stale - no caching
    gcTime: 1000, // Keep in cache for 1 second (was 0, but 0 might cause issues)
    retry: 1, // Retry once on failure
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      return apiRequest(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
    },
    onSuccess: async (_, conversationId) => {
      // Clear the selected conversation first
      setSelectedConversation(null);

      // NO OPTIMISTIC UPDATES - Just refetch from server
      // Clear messages cache for the deleted conversation
      queryClient.removeQueries({
        queryKey: ["/api/conversations", conversationId, "messages"],
      });

      // Invalidate and refetch conversations to ensure backend state is reflected
      await queryClient.invalidateQueries({
        queryKey: ["/api/conversations"],
        refetchType: "all", // Refetch all queries, not just active ones
      });

      // Force a refetch to ensure we have the latest data
      await queryClient.refetchQueries({
        queryKey: ["/api/conversations"],
        type: "all",
      });

      toast({
        title: "Conversation deleted",
        description: "The conversation has been permanently removed",
      });
    },
    onError: _error => {
      toast({
        title: "Failed to delete conversation",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  // Send message mutation with optimistic updates for instant UI feedback
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: { conversation_id: number; content: string }) => {
      const result = await apiRequest("/api/messages", {
        method: "POST",
        body: JSON.stringify(messageData),
      });
      return result;
    },
    onMutate: async variables => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({
        queryKey: ["/api/conversations", variables.conversation_id, "messages"],
      });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<Message[]>([
        "/api/conversations",
        variables.conversation_id,
        "messages",
      ]);

      // Optimistically update the messages cache
      if (selectedConversation === variables.conversation_id && user) {
        const optimisticMessage: Message = {
          id: Date.now(), // Temporary ID (will be replaced by real ID from server)
          conversation_id: variables.conversation_id,
          sender_id: user.id,
          content: variables.content,
          is_read: false,
          is_system_message: false,
          created_at: new Date().toISOString(),
          sender: {
            id: user.id,
            email: user.email,
            role: user.role,
            deleted_at: null,
            first_name: (user as User).first_name || null,
            last_name: (user as User).last_name || null,
            company_name: (user as User).company_name || null,
          },
        };

        queryClient.setQueryData<Message[]>(
          ["/api/conversations", variables.conversation_id, "messages"],
          old => [...(old || []), optimisticMessage]
        );
      }

      // Return context with the previous value for rollback
      return { previousMessages };
    },
    onSuccess: () => {
      // Don't block - WebSocket will update the UI instantly
      // Just invalidate to trigger background refresh if needed
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations"],
      });
    },
    onError: (error: unknown, variables, context) => {
      console.error("❌ Message send failed:", error);

      // Rollback optimistic update
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["/api/conversations", variables.conversation_id, "messages"],
          context.previousMessages
        );
      }

      // Restore the message content
      setNewMessage(variables.content);

      const errorMessage =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      toast({
        title: "Failed to send message",
        description: errorMessage ?? "Please try again",
        variant: "destructive",
      });
    },
  });

  // Handle sending messages
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) {
      console.log("⚠️ Send blocked - missing message or conversation");
      return;
    }

    const messageData = {
      conversation_id: selectedConversation,
      content: newMessage.trim(),
    };

    // Clear inputs immediately BEFORE mutation to prevent race condition
    // if user switches conversations while mutation is in flight
    setNewMessage("");

    sendMessageMutation.mutate(messageData);
  };

  // Handle key press in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle conversation selection from URL parameters (from notifications)
  useEffect(() => {
    if (!conversations.length) return; // Wait until conversations are loaded

    const urlParams = new URLSearchParams(window.location.search);
    const conversationParam = urlParams.get("conversation");

    if (conversationParam) {
      const conversationId = parseInt(conversationParam);

      // Check if this conversation exists in the user's conversations
      const conversationExists = conversations.some(c => c.id === conversationId);

      if (conversationExists && conversationId !== selectedConversation) {
        console.log("📬 Auto-selecting conversation from notification:", conversationId);
        setSelectedConversation(conversationId);
      }

      // Clear the conversation parameter from URL after handling
      urlParams.delete("conversation");
      const newUrl = urlParams.toString()
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, [conversations, selectedConversation]); // Run when conversations or selectedConversation changes

  // Subscribe to WebSocket events for real-time message updates
  useEffect(() => {
    const unsubscribe = subscribe(data => {
      // Handle new message events
      if (data.type === "NEW_MESSAGE" || data.type === "new_message") {
        const conversationId = data.conversation_id;
        const messageData = data.message;
        const senderData = data.sender;

        console.log("📨 New message received via WebSocket:", {
          conversationId,
          selectedConversation,
          messageId: messageData?.id,
        });

        // Update cache DIRECTLY with WebSocket data for instant UI update
        // This is much faster than refetching from the server
        if (
          selectedConversation &&
          conversationId === selectedConversation &&
          messageData &&
          senderData
        ) {
          const currentMessages = queryClient.getQueryData<Message[]>([
            "/api/conversations",
            selectedConversation,
            "messages",
          ]);

          // Check if message already exists by ID
          const messageExists = currentMessages?.some(msg => msg.id === messageData.id);

          if (!messageExists) {
            console.log("✨ Updating cache directly with WebSocket message:", messageData.id);

            // Create the message object matching our Message interface
            const newMessage: Message = {
              id: messageData.id,
              conversation_id: conversationId,
              sender_id: messageData.sender_id,
              content: messageData.content,
              is_read: messageData.is_read || false,
              is_system_message: messageData.is_system_message || false,
              created_at:
                typeof messageData.created_at === "string"
                  ? messageData.created_at
                  : new Date(messageData.created_at).toISOString(),
              sender: {
                id: senderData.id,
                email: senderData.email,
                role: senderData.role,
                deleted_at: senderData.deleted_at || null,
                first_name: senderData.first_name || null,
                last_name: senderData.last_name || null,
                company_name: senderData.company_name || null,
              },
            };

            // Update cache directly - instant UI update!
            queryClient.setQueryData<Message[]>(
              ["/api/conversations", selectedConversation, "messages"],
              old => {
                if (!old) return [newMessage];

                // Remove optimistic message (temporary ID) if it matches this real message
                // Optimistic messages have temporary IDs (Date.now()), real ones have database IDs
                const filtered = old.filter(msg => {
                  // If this is an optimistic message (very large ID from Date.now())
                  // and the content matches, remove it
                  const isOptimistic = msg.id > 1000000000000; // Rough check for Date.now() ID
                  const contentMatches =
                    msg.content === newMessage.content && msg.sender_id === newMessage.sender_id;

                  // Keep the message unless it's an optimistic duplicate
                  return !(isOptimistic && contentMatches);
                });

                // Check if real message already exists
                const exists = filtered.some(msg => msg.id === newMessage.id);
                if (exists) return filtered;

                return [...filtered, newMessage];
              }
            );
          } else {
            console.log("⚠️ Message already in cache, skipping duplicate");
          }
        }

        // Invalidate conversations list to update timestamps (non-blocking)
        queryClient.invalidateQueries({
          queryKey: ["/api/conversations"],
          refetchType: "active",
        });
      }

      // Handle conversation deletion events
      if (data.type === "conversation_deleted") {
        const deletedConversationId = data.conversation_id;

        // If the deleted conversation is currently selected, clear selection
        if (selectedConversation === deletedConversationId) {
          setSelectedConversation(null);
        }

        // NO OPTIMISTIC UPDATES - Just refetch from server
        // Clear messages cache for the deleted conversation
        queryClient.removeQueries({
          queryKey: ["/api/conversations", deletedConversationId, "messages"],
        });

        // Invalidate and refetch conversations list to remove deleted conversation
        queryClient.invalidateQueries({
          queryKey: ["/api/conversations"],
          refetchType: "all", // Refetch all to prevent stale data
        });

        // Force refetch to ensure we have latest data
        queryClient.refetchQueries({
          queryKey: ["/api/conversations"],
          type: "all",
        });
      }

      // Handle conversation update events (e.g., restored after deletion)
      if (data.type === "conversation_updated") {
        const updatedConversationId = data.conversation_id;

        // Invalidate and refetch conversations list to show restored/updated conversation
        queryClient.invalidateQueries({
          queryKey: ["/api/conversations"],
          refetchType: "all", // Refetch all to ensure we see restored conversations
        });

        // Also invalidate messages for this conversation in case it was restored
        if (updatedConversationId) {
          queryClient.invalidateQueries({
            queryKey: ["/api/conversations", updatedConversationId, "messages"],
            refetchType: "active",
          });
        }

        // Force refetch to ensure we have latest data
        queryClient.refetchQueries({
          queryKey: ["/api/conversations"],
          type: "all",
        });
      }
    });

    return unsubscribe;
  }, [selectedConversation, subscribe, queryClient, refetchConversations]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {conversationsError ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <p className="text-destructive mb-2">Error loading conversations</p>
                  <Button onClick={() => refetchConversations()} variant="outline" size="sm">
                    Retry
                  </Button>
                </div>
              ) : conversationsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No conversations yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start messaging by visiting a profile
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {conversations.map((conversation: Conversation) => {
                    const isDeleted = isUserDeleted(conversation.otherUser);
                    return (
                      <div
                        key={conversation.id}
                        data-testid={`conversation-${conversation.id}`}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conversation.id
                            ? "bg-primary/10 border-primary"
                            : "hover:bg-muted"
                        } ${isDeleted ? "opacity-60" : ""}`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <Avatar className={isDeleted ? "opacity-50" : ""}>
                          <AvatarFallback className={isDeleted ? "bg-red-100 text-red-600" : ""}>
                            {getAvatarInitials(conversation.otherUser)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`font-medium truncate ${isDeleted ? "text-muted-foreground" : ""}`}
                            >
                              {getDisplayName(conversation.otherUser)}
                            </p>
                            {isDeleted && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              >
                                Deleted
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {formatDate(conversation.last_message_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedConversation ? (
                <>
                  <User className="h-5 w-5" />
                  <span>
                    {conversations.find((c: Conversation) => c.id === selectedConversation)
                      ?.otherUser.email || "Chat"}
                  </span>
                  {isUserDeleted(
                    conversations.find((c: Conversation) => c.id === selectedConversation)
                      ?.otherUser
                  ) && (
                    <Badge
                      variant="secondary"
                      className="ml-2 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    >
                      Account Deleted
                    </Badge>
                  )}
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" />
                  Select a conversation
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col h-[500px]">
            {selectedConversation ? (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 mb-4 pr-4">
                  <div className="space-y-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 text-center">
                        <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No messages yet</p>
                        <p className="text-sm text-muted-foreground">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map(message => {
                        const isMyMessage = message.sender_id === user?.id;
                        const isSystemMessage = message.sender_id === null;

                        return (
                          <div
                            key={message.id}
                            className={`flex ${
                              isSystemMessage
                                ? "justify-center"
                                : isMyMessage
                                  ? "justify-end" // MY messages on the RIGHT
                                  : "justify-start" // Received messages on the LEFT
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                isSystemMessage
                                  ? "bg-muted text-muted-foreground text-center text-sm"
                                  : isMyMessage
                                    ? "bg-blue-500 text-white rounded-br-none" // Sent messages: blue on the RIGHT
                                    : "bg-gray-200 dark:bg-gray-700 text-foreground rounded-bl-none" // Received messages: gray on the LEFT
                              }`}
                            >
                              <p className="break-words">{message.content}</p>

                              <p
                                className={`text-xs mt-1 ${
                                  isSystemMessage
                                    ? "text-muted-foreground"
                                    : isMyMessage
                                      ? "text-white/70" // White text on primary background
                                      : "text-muted-foreground" // Muted text on gray background
                                }`}
                              >
                                {formatDate(message.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={!selectedConversation}
                    data-testid="input-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || !selectedConversation}
                    data-testid="button-send-message"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>

                {/* Delete Conversation */}
                <div className="mt-4 pt-4 border-t">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        data-testid="button-delete-conversation"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete Conversation
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this conversation and all messages. This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-delete">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteConversationMutation.mutate(selectedConversation)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          data-testid="button-confirm-delete"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">Select a conversation</p>
                <p className="text-sm text-muted-foreground">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
