import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Rating {
  id: number;
  job_application_id: number;
  recruiter_id: number;
  freelancer_id: number;
  rating: number;
  created_at: string;
  updated_at: string;
  recruiter: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
  };
  job_title?: string;
}

export interface AverageRating {
  average: number;
  count: number;
}

export function useFreelancerRatings(freelancerId: number) {
  return useQuery({
    queryKey: ['/api/ratings/freelancer', freelancerId],
    queryFn: async (): Promise<Rating[]> => {
      const response = await apiRequest(`/api/ratings/freelancer/${freelancerId}`);
      return response;
    },
    enabled: !!freelancerId,
  });
}

export function useFreelancerAverageRating(freelancerId: number) {
  return useQuery({
    queryKey: ['/api/ratings/freelancer', freelancerId, 'average'],
    queryFn: async (): Promise<AverageRating> => {
      const response = await apiRequest(`/api/ratings/freelancer/${freelancerId}/average`);
      return response;
    },
    enabled: !!freelancerId,
  });
}