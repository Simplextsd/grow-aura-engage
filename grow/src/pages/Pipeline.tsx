import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { CreateDealDialog } from "@/components/CreateDealDialog";

const stages = ["lead", "qualified", "proposal", "negotiation", "won", "lost"];

export default function Pipeline() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const { data, error } = await supabase
        .from("deals")
        .select("*, contacts(first_name, last_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeals(data || []);
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

  const getDealsByStage = (stage: string) => {
    return deals.filter((deal) => deal.stage === stage);
  };

  const getStageTotal = (stage: string) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + Number(deal.value || 0), 0);
  };

  const getStageColor = (stage: string) => {
    const colors: any = {
      lead: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      qualified: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
      proposal: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      negotiation: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      won: "bg-green-500/10 text-green-500 border-green-500/20",
      lost: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[stage] || "bg-muted";
  };

  if (loading) {
    return <div className="p-8">Loading pipeline...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Sales Pipeline</h1>
          <p className="text-muted-foreground">Track and manage your deals</p>
        </div>
        <CreateDealDialog onDealCreated={fetchDeals} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stages.map((stage) => (
          <Card key={stage} className="shadow-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg capitalize">{stage}</CardTitle>
                <Badge variant="outline" className={getStageColor(stage)}>
                  {getDealsByStage(stage).length}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>${getStageTotal(stage).toLocaleString()}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {getDealsByStage(stage).map((deal) => (
                <Card key={deal.id} className="p-3 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="space-y-2">
                    <div className="font-medium">{deal.title}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {deal.contacts?.first_name} {deal.contacts?.last_name}
                      </span>
                      <span className="font-semibold text-primary">
                        ${Number(deal.value || 0).toLocaleString()}
                      </span>
                    </div>
                    {deal.probability && (
                      <div className="text-xs text-muted-foreground">
                        {deal.probability}% probability
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              {getDealsByStage(stage).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No deals in this stage
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
