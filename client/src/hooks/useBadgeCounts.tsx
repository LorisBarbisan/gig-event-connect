import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface BadgeCounts {
  messages: number;
  applications: number;
  jobs: number;
  ratings: number;
  feedback: number;
  contact_messages: number;
  total: number;
}

interface UseBadgeCountsProps {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useBadgeCounts({
  enabled = true,
  refetchInterval = 1500,
}: UseBadgeCountsProps = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch badge counts from API
  const {
    data: counts = {
      messages: 0,
      applications: 0,
      jobs: 0,
      ratings: 0,
      feedback: 0,
      contact_messages: 0,
      total: 0,
    },
    refetch,
  } = useQuery<BadgeCounts>({
    queryKey: ["/api/notifications/category-counts", user?.id],
    queryFn: async (): Promise<BadgeCounts> => {
      if (!user?.id)
        return {
          messages: 0,
          applications: 0,
          jobs: 0,
          ratings: 0,
          feedback: 0,
          contact_messages: 0,
          total: 0,
        };

      try {
        return await apiRequest("/api/notifications/category-counts");
      } catch (error) {
        console.error("Error fetching badge counts:", error);
        return {
          messages: 0,
          applications: 0,
          jobs: 0,
          ratings: 0,
          feedback: 0,
          contact_messages: 0,
          total: 0,
        };
      }
    },
    enabled: enabled && !!user?.id,
    staleTime: 0, // CRITICAL: Override default 5-minute staleTime to ensure instant updates
    refetchInterval: false, // Disable polling - rely entirely on WebSocket for real-time updates
    // Polling causes race conditions with WebSocket updates, leading to double counts
    refetchIntervalInBackground: false, // Stop polling when tab is inactive
    refetchOnMount: "always", // Always refetch when component mounts
  });

  // Note: Real-time badge count updates are now handled by the centralized WebSocketContext
  // which automatically updates badge counts when badge_counts_update events are received

  // Get role-specific counts
  const getRoleSpecificCounts = () => {
    if (!user) return {};

    if (user.role === "freelancer") {
      return {
        applications: counts.applications,
        messages: counts.messages,
        ratings: counts.ratings,
      };
    } else if (user.role === "recruiter") {
      return {
        jobs: counts.jobs,
        applications: counts.applications,
        messages: counts.messages,
        ratings: counts.ratings,
      };
    }

    return {};
  };

  // Function to mark category notifications as read
  const markCategoryAsRead = async (
    category: "messages" | "applications" | "jobs" | "ratings" | "feedback" | "contact_messages"
  ) => {
    if (!user?.id) return;

    try {
      await apiRequest(`/api/notifications/mark-category-read/${category}`, {
        method: "PATCH",
      });

      // Refetch to ensure we have the latest from server
      // The WebSocket will also broadcast the update, but this ensures consistency
      refetch();
    } catch (error) {
      console.error(`Error marking ${category} notifications as read:`, error);
    }
  };

  return {
    counts,
    roleSpecificCounts: getRoleSpecificCounts(),
    refetch,
    total: counts.total,
    markCategoryAsRead,
  };
}
