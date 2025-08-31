import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';

interface UseTabNotificationsProps {
  userId: number | null | undefined;
  enabled?: boolean;
}

export function useTabNotifications({ userId, enabled = true }: UseTabNotificationsProps) {
  const originalTitleRef = useRef<string>('EventLink');
  
  // Fetch unread count using the same query as NotificationSystem
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['/api/notifications/unread-count', userId],
    queryFn: async () => {
      if (!userId) return 0;
      const response = await fetch(`/api/notifications/unread-count?userId=${userId}`);
      if (!response.ok) return 0;
      const data = await response.json();
      return data.count;
    },
    refetchInterval: 5000, // Check every 5 seconds for tab notifications
    enabled: enabled && !!userId,
  });

  // Update document title when unread count changes
  useEffect(() => {
    if (!enabled || !userId) return;
    
    // Store the original title on first load
    if (originalTitleRef.current === 'EventLink' && document.title && document.title !== 'EventLink') {
      originalTitleRef.current = document.title;
    }
    
    // Update title based on unread count
    if (unreadCount > 0) {
      document.title = `(${unreadCount > 99 ? '99+' : unreadCount}) ${originalTitleRef.current}`;
    } else {
      document.title = originalTitleRef.current;
    }
    
    // Cleanup: restore original title when component unmounts
    return () => {
      document.title = originalTitleRef.current;
    };
  }, [unreadCount, enabled, userId]);

  // Optional: Add favicon notification badge (browser permitting)
  useEffect(() => {
    if (!enabled || !userId) return;
    
    // Try to find existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    if (unreadCount > 0 && existingFavicon) {
      // Add a simple red dot or indicator to favicon if possible
      // Note: This is limited by browser support and would require canvas manipulation
      // For now, we'll focus on the title notification which is universal
    }
  }, [unreadCount, enabled, userId]);

  return {
    unreadCount,
    hasNotifications: unreadCount > 0,
  };
}