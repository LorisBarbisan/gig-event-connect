import { useAuth } from "@/hooks/useAuth";
import { useTabNotifications } from "@/hooks/useTabNotifications";

/**
 * Component that manages browser tab notifications for the entire application.
 * This component runs globally and updates the document title with unread notification counts.
 * It automatically detects new applications, messages, and other notifications for all user types.
 */
export function TabNotificationManager() {
  const { user, loading } = useAuth();

  // Use the tab notifications hook with the current user's ID
  const { unreadCount, hasNotifications } = useTabNotifications({
    userId: user?.id,
    enabled: !!user?.id && !loading, // Only enable when user is logged in AND auth loading is complete
  });

  // This component doesn't render anything - it just manages the browser tab title
  return null;
}
