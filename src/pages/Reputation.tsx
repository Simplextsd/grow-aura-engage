import { useState, useEffect } from "react";
// Supabase ko comment rakha hai taake error trigger na ho
// import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Star, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Reputation() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // ✅ Supabase Promise.all ki jagah hum apne local backend ko call kar rahe hain
      const [reviewsRes, requestsRes] = await Promise.all([
        fetch("http://localhost:5000/api/reviews", {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch("http://localhost:5000/api/review-requests", {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (!reviewsRes.ok || !requestsRes.ok) throw new Error("Database fetch failed");

      const reviewsData = await reviewsRes.json();
      const requestsData = await requestsRes.json();

      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      setRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error: any) {
      // ⚠️ Error console mein rakha hai taake red box na aaye
      console.error("Reputation Error:", error.message);
      setReviews([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-400"}`}
        />
      ));
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  if (loading) {
    return <div className="p-8">Loading reputation management...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Reputation Management</h1>
          <p className="text-muted-foreground">Manage reviews and reputation requests</p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Request Review
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold">{avgRating}</div>
              <div className="flex items-center justify-center gap-1">
                {renderStars(Math.round(Number(avgRating)))}
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold">{reviews.length}</div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold">{requests.length}</div>
              <p className="text-sm text-muted-foreground">Requests Sent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Recent Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">
                        {review.reviewer_name ||
                          `${review.first_name || 'Guest'} ${review.last_name || ''}`}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(review.rating)}
                      </div>
                    </div>
                    <Badge variant="outline">{review.platform}</Badge>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {review.created_at ? format(new Date(review.created_at), "MMM dd, yyyy") : "Date N/A"}
                  </p>
                </div>
              </Card>
            ))}
            {reviews.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No reviews yet</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Review Requests ({requests.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">
                        {request.first_name} {request.last_name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {request.email}
                      </div>
                    </div>
                    <Badge variant="outline">{request.platform}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Sent: {request.sent_at ? format(new Date(request.sent_at), "MMM dd, yyyy") : "N/A"}</span>
                    {request.responded_at ? (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500">
                        ✓ Responded
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No review requests sent yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}