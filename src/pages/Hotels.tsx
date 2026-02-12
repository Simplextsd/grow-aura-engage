import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*, contacts(first_name, last_name)")
        .order("due_date", { ascending: true });

      if (error) throw error;
      setTasks(data || []);
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

  const toggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "completed" ? "pending" : "completed";
      const { error } = await supabase
        .from("tasks")
        .update({
          status: newStatus,
          completed_at: newStatus === "completed" ? new Date().toISOString() : null
        })
        .eq("id", taskId);

      if (error) throw error;
      fetchTasks();
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors: any = {
      high: "bg-red-500/10 text-red-500 border-red-500/20",
      medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      low: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    };
    return colors[priority] || "bg-muted";
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      in_progress: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      cancelled: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[status] || "bg-muted";
  };

  if (loading) {
    return <div className="p-8">Loading tasks...</div>;
  }

  const pendingTasks = tasks.filter((t) => t.status !== "completed");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Hotels</h1>
          <p className="text-muted-foreground">Manage your hotel bookings, guest stays, and special requirements</p>
        </div>
        <CreateTaskDialog onTaskCreated={fetchTasks} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Pending Tasks ({pendingTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingTasks.map((task) => (
              <Card key={task.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={false}
                    onCheckedChange={() => toggleTask(task.id, task.status)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium">{task.title}</div>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {task.due_date && (
                        <span>Due: {format(new Date(task.due_date), "MMM dd, yyyy")}</span>
                      )}
                      {task.contacts && (
                        <span>
                          {task.contacts.first_name} {task.contacts.last_name}
                        </span>
                      )}
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            {pendingTasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No pending tasks. Great job!
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Completed Tasks ({completedTasks.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedTasks.map((task) => (
              <Card key={task.id} className="p-4 opacity-60">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => toggleTask(task.id, task.status)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium line-through">{task.title}</div>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.completed_at && (
                      <p className="text-xs text-muted-foreground">
                        Completed: {format(new Date(task.completed_at), "MMM dd, yyyy")}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            {completedTasks.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No completed tasks yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
