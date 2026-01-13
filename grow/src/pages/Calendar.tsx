import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CreateAppointmentDialog } from "@/components/CreateAppointmentDialog";

export default function Calendar() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, contacts(first_name, last_name, email)")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
      no_show: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[status] || "bg-muted";
  };

  if (loading) {
    return <div className="p-8">Loading calendar...</div>;
  }

  const upcomingAppointments = appointments.filter(
    (apt) => new Date(apt.start_time) >= new Date() && apt.status === "scheduled"
  );
  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.start_time) < new Date() || apt.status !== "scheduled"
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Calendar</h1>
          <p className="text-muted-foreground">Schedule and manage appointments</p>
        </div>
        <CreateAppointmentDialog onAppointmentCreated={fetchAppointments} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Upcoming Appointments ({upcomingAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <Card key={apt.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{apt.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {apt.contacts?.first_name} {apt.contacts?.last_name}
                      </p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(apt.status)}>
                      {apt.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(new Date(apt.start_time), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(apt.start_time), "h:mm a")} -{" "}
                        {format(new Date(apt.end_time), "h:mm a")}
                      </span>
                    </div>
                  </div>
                  {apt.location && (
                    <p className="text-sm text-muted-foreground">📍 {apt.location}</p>
                  )}
                  {apt.description && (
                    <p className="text-sm text-muted-foreground">{apt.description}</p>
                  )}
                </div>
              </Card>
            ))}
            {upcomingAppointments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No upcoming appointments
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Past Appointments ({pastAppointments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pastAppointments.slice(0, 10).map((apt) => (
              <Card key={apt.id} className="p-4 opacity-60">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{apt.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {apt.contacts?.first_name} {apt.contacts?.last_name}
                      </p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(apt.status)}>
                      {apt.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(new Date(apt.start_time), "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(apt.start_time), "h:mm a")}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {pastAppointments.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No past appointments
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
