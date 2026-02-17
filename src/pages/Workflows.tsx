import { useState, useEffect } from "react";
// Supabase ko disable kar diya kyunke error wahi se aa raha hai
// import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CreateWorkflowDialog } from "@/components/CreateWorkflowDialog";

export default function Workflows() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      // ✅ Supabase ki jagah aapka MySQL Backend call hoga
      const response = await fetch("http://localhost:5000/api/workflows", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) throw new Error("MySQL Database connection failed");

      const data = await response.json();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (error: any) {
      // ⚠️ Error console mein dikhayega par UI crash nahi hogi
      console.error("Workflow Fetch Error:", error.message);
      setWorkflows([]); 
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (workflowId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active";
      
      // ✅ MySQL Update Call
      const response = await fetch(`http://localhost:5000/api/workflows/${workflowId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error("Update failed");

      fetchWorkflows();
      toast({
        title: "Success",
        description: `Workflow ${newStatus === "active" ? "activated" : "paused"}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      active: "bg-green-500/10 text-green-500 border-green-500/20",
      paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      draft: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[status] || "bg-muted";
  };

  if (loading) {
    return <div className="p-8">Loading workflows from database...</div>;
  }

  const activeWorkflows = workflows.filter((w) => w.status === "active");
  const inactiveWorkflows = workflows.filter((w) => w.status !== "active");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Workflows</h1>
          <p className="text-muted-foreground">Automate your marketing and sales processes</p>
        </div>
        <CreateWorkflowDialog onWorkflowCreated={fetchWorkflows} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-500" />
              Active Workflows ({activeWorkflows.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeWorkflows.map((workflow) => (
              <Card key={workflow.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{workflow.name}</h3>
                      {workflow.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {workflow.description}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={workflow.status === "active"}
                      onCheckedChange={() => toggleWorkflow(workflow.id, workflow.status)}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Trigger: <span className="text-foreground">{workflow.trigger_type}</span>
                    </span>
                  </div>
                </div>
              </Card>
            ))}
            {activeWorkflows.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No active workflows found in database.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-yellow-500" />
              Inactive Workflows ({inactiveWorkflows.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inactiveWorkflows.map((workflow) => (
              <Card key={workflow.id} className="p-4 opacity-60">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{workflow.name}</h3>
                      {workflow.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {workflow.description}
                        </p>
                      )}
                    </div>
                    <Switch
                      checked={workflow.status === "active"}
                      onCheckedChange={() => toggleWorkflow(workflow.id, workflow.status)}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline" className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Trigger: <span className="text-foreground">{workflow.trigger_type}</span>
                    </span>
                  </div>
                </div>
              </Card>
            ))}
            {inactiveWorkflows.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No inactive workflows.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}