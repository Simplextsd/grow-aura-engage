import { useState, useEffect } from "react";
// Supabase ko disable rakha hai taake table error na aaye
// import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Calls() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      setLoading(true);
      // ✅ Supabase ki jagah aapka local MySQL backend call
      const response = await fetch("http://localhost:5000/api/calls", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch calls from MySQL");

      const data = await response.json();
      setCalls(Array.isArray(data) ? data : []);
    } catch (error: any) {
      // Console mein error dikhayega par UI par bara red box nahi aayega
      console.error("Call Log Error:", error.message);
      setCalls([]); 
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalCalls = calls.length;
  const inboundCalls = calls.filter((c) => c.direction === "inbound").length;
  const outboundCalls = calls.filter((c) => c.direction === "outbound").length;
  const totalDuration = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);

  if (loading) {
    return <div className="p-8">Loading call logs from database...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Call Tracking</h1>
          <p className="text-muted-foreground">Monitor and manage phone communications</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span className="text-sm">Total Calls</span>
              </div>
              <div className="text-3xl font-bold">{totalCalls}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <PhoneIncoming className="h-4 w-4" />
                <span className="text-sm">Inbound</span>
              </div>
              <div className="text-3xl font-bold">{inboundCalls}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <PhoneOutgoing className="h-4 w-4" />
                <span className="text-sm">Outbound</span>
              </div>
              <div className="text-3xl font-bold">{outboundCalls}</div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Duration</p>
              <div className="text-3xl font-bold">{formatDuration(totalDuration)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Recent Calls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calls.map((call) => (
              <Card key={call.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {call.direction === "inbound" ? (
                      <PhoneIncoming className="h-5 w-5 text-blue-500" />
                    ) : (
                      <PhoneOutgoing className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold">
                          {call.first_name 
                            ? `${call.first_name} ${call.last_name}`
                            : call.phone_number}
                        </div>
                        <div className="text-sm text-muted-foreground">{call.phone_number}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={call.direction === "inbound" ? "bg-blue-500/10 text-blue-500" : "bg-green-500/10 text-green-500"}>
                          {call.direction}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{call.started_at ? format(new Date(call.started_at), "MMM dd, yyyy h:mm a") : "N/A"}</span>
                      {call.duration_seconds > 0 && (
                        <span>Duration: {formatDuration(call.duration_seconds)}</span>
                      )}
                    </div>
                    {call.notes && (
                      <p className="text-sm text-muted-foreground">{call.notes}</p>
                    )}
                    {call.recording_url && (
                      <Button variant="outline" size="sm">
                        Play Recording
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {calls.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No call history found in database</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}