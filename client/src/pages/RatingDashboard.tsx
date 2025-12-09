import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Layout } from '@/components/Layout';
import { useOptimizedAuth } from '@/hooks/useOptimizedAuth';
import { useFreelancerRatings, useFreelancerAverageRating } from '@/hooks/useRatings';
import { StarRating } from '@/components/StarRating';
import { Star, TrendingUp, Award, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const SAMPLE_RATINGS = [
  { id: 1, rating: 5, job_title: 'Test Event Technician', recruiter: { first_name: 'Admin', last_name: 'User' }, created_at: '2025-11-29T12:36:58Z' },
  { id: 2, rating: 4, job_title: 'ICT Technician', recruiter: { first_name: 'Admin', last_name: 'User' }, created_at: '2025-11-14T12:36:58Z' },
  { id: 3, rating: 5, job_title: '.NET Developer', recruiter: { first_name: 'Admin', last_name: 'User' }, created_at: '2025-10-30T12:36:58Z' },
  { id: 4, rating: 5, job_title: 'AV Technician', recruiter: { first_name: 'Test', last_name: 'Recruiter' }, created_at: '2025-10-20T12:39:09Z' },
  { id: 5, rating: 4, job_title: 'Stage Manager', recruiter: { first_name: 'Test', last_name: 'Recruiter' }, created_at: '2025-10-10T12:39:09Z' },
  { id: 6, rating: 5, job_title: 'Sound Engineer', recruiter: { first_name: 'Patrick', last_name: 'N.' }, created_at: '2025-09-30T12:39:09Z' },
  { id: 7, rating: 3, job_title: 'Lighting Tech', recruiter: { first_name: 'Patrick', last_name: 'N.' }, created_at: '2025-09-20T12:39:09Z' },
  { id: 8, rating: 5, job_title: 'Event Coordinator', recruiter: { first_name: 'Loris', last_name: 'B.' }, created_at: '2025-09-10T12:39:09Z' },
  { id: 9, rating: 4, job_title: 'Production Assistant', recruiter: { first_name: 'Loris', last_name: 'B.' }, created_at: '2025-08-31T12:39:09Z' },
];

const SAMPLE_AVERAGE = { average: 4.4, count: 9 };

export function RatingDashboard() {
  const { user } = useOptimizedAuth();
  const { data: apiRatings = [], isLoading: ratingsLoading } = useFreelancerRatings(user?.id || 0);
  const { data: apiAverageRating } = useFreelancerAverageRating(user?.id || 0);

  const isPreviewMode = !user || user.role !== 'freelancer';
  const ratings = isPreviewMode ? SAMPLE_RATINGS : apiRatings;
  const averageRating = isPreviewMode ? SAMPLE_AVERAGE : apiAverageRating;

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      {isPreviewMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-amber-800 text-sm font-medium">
            Preview Mode - Showing sample ratings data. Log in as a freelancer to see your actual ratings.
          </p>
        </div>
      )}
      <div className="flex items-center gap-3">
        <Award className="w-8 h-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold">My Ratings</h1>
          <p className="text-muted-foreground">Track your performance ratings from recruiters</p>
        </div>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {averageRating && averageRating.count > 0 ? (
                <>
                  <div className="text-2xl font-bold">{averageRating.average}</div>
                  <StarRating rating={Math.round(averageRating.average)} readonly size="sm" />
                </>
              ) : (
                <div className="text-2xl font-bold text-muted-foreground">-</div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {averageRating?.count || 0} total ratings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRating?.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              From completed projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Rating</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {ratings.length > 0 ? (
                <>
                  <div className="text-2xl font-bold">{ratings[0].rating}</div>
                  <StarRating rating={ratings[0].rating} readonly size="sm" />
                </>
              ) : (
                <div className="text-2xl font-bold text-muted-foreground">-</div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {ratings.length > 0 
                ? format(new Date(ratings[0].created_at), 'MMM dd, yyyy')
                : 'No ratings yet'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Individual Ratings */}
      <Card>
        <CardHeader>
          <CardTitle>Rating History</CardTitle>
          <p className="text-sm text-muted-foreground">
            All ratings received from recruiters
          </p>
        </CardHeader>
        <CardContent>
          {ratingsLoading ? (
            <div className="text-center py-8">
              <p>Loading ratings...</p>
            </div>
          ) : ratings.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No ratings yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete projects and get hired to receive ratings from recruiters.
              </p>
              <p className="text-sm text-muted-foreground">
                You can also request ratings from recruiters for completed work.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating, index) => (
                <div key={rating.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StarRating rating={rating.rating} readonly size="sm" />
                        <Badge variant="outline">{rating.rating}/5</Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="font-medium">{rating.job_title || 'Project'}</p>
                        <p className="text-sm text-muted-foreground">
                          Rated by {rating.recruiter.first_name && rating.recruiter.last_name 
                            ? `${rating.recruiter.first_name} ${rating.recruiter.last_name}`
                            : 'Recruiter'
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(rating.created_at), 'MMMM dd, yyyy • h:mm a')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-600">
                        {rating.rating}
                      </div>
                    </div>
                  </div>
                  
                  {index < ratings.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rating Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Improve Your Ratings</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ul className="space-y-2 text-sm">
            <li>• Communicate clearly and professionally with recruiters</li>
            <li>• Deliver work on time and meet project requirements</li>
            <li>• Be responsive to feedback and willing to make revisions</li>
            <li>• Maintain a positive attitude throughout the project</li>
            <li>• Request ratings from recruiters after successful project completion</li>
          </ul>
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
}