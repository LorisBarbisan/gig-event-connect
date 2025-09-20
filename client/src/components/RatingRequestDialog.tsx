import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Star, Send } from 'lucide-react';
import type { JobApplication } from '@shared/types';

interface RatingRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: JobApplication;
  currentUserId: number;
}

export function RatingRequestDialog({ 
  open, 
  onOpenChange, 
  application, 
  currentUserId 
}: RatingRequestDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const requestRatingMutation = useMutation({
    mutationFn: async () => {
      // First get the job details to find the recruiter ID
      const jobResponse = await apiRequest(`/api/jobs/${application.job_id}`);
      const recruiterId = jobResponse?.recruiter_id;
      
      if (!recruiterId) {
        throw new Error('Unable to find recruiter for this job');
      }

      return await apiRequest('/api/rating-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_application_id: application.id,
          freelancer_id: currentUserId,
          recruiter_id: recruiterId
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rating-requests', 'freelancer', currentUserId] });
      onOpenChange(false);
      toast({
        title: 'Rating request sent!',
        description: 'The recruiter has been notified of your rating request.',
      });
    },
    onError: (error: any) => {
      console.error('Rating request error:', error);
      toast({
        title: 'Error sending rating request',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    requestRatingMutation.mutate();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Request Rating
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Would you like to request a rating from the recruiter for your work on this project?
            </p>
          </div>

          <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
            <p><strong>Job:</strong> {application.job_title}</p>
            <p><strong>Company:</strong> {application.job_company || 'Not specified'}</p>
            <p><strong>Status:</strong> <span className="capitalize">{application.status}</span></p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm">
            <p className="text-blue-800">
              <strong>Note:</strong> Requesting a rating will send a notification to the recruiter. 
              They can choose to provide a rating or decline the request.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={requestRatingMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={requestRatingMutation.isPending}
            data-testid="button-request-rating"
            className="bg-gradient-primary hover:bg-primary-hover"
          >
            {requestRatingMutation.isPending ? (
              'Sending...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}