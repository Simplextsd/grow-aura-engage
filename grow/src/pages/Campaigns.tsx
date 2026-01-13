import { useState } from "react";
import { Send, Mail, MessageSquare, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateCampaignDialog } from "@/components/CreateCampaignDialog";

const campaigns = [
  { id: 1, name: "Summer Sale Blast", type: "whatsapp", status: "completed", sent: 5400, delivered: 5280, opened: 3960, clicked: 1584 },
  { id: 2, name: "Product Launch Email", type: "email", status: "active", sent: 8200, delivered: 8036, opened: 4820, clicked: 1928 },
  { id: 3, name: "Weekly Newsletter", type: "email", status: "scheduled", sent: 0, delivered: 0, opened: 0, clicked: 0 },
  { id: 4, name: "Flash Promo WhatsApp", type: "whatsapp", status: "completed", sent: 3200, delivered: 3136, opened: 2720, clicked: 1088 },
];

export default function Campaigns() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Campaigns</h1>
          <p className="text-muted-foreground">Create and manage your marketing campaigns</p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
        >
          <Send className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <CreateCampaignDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Sent</p>
                <h3 className="text-2xl font-bold mt-2">16,800</h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Send className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Delivery Rate</p>
                <h3 className="text-2xl font-bold mt-2">98.2%</h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Rate</p>
                <h3 className="text-2xl font-bold mt-2">68.5%</h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Click Rate</p>
                <h3 className="text-2xl font-bold mt-2">27.3%</h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
          <CardDescription>View and manage all your campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="bg-secondary mb-6">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">All Campaigns</TabsTrigger>
              <TabsTrigger value="email" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Email</TabsTrigger>
              <TabsTrigger value="whatsapp" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">WhatsApp</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{campaign.name}</h3>
                        <Badge className={
                          campaign.status === "completed" ? "bg-green-500/20 text-green-500" :
                          campaign.status === "active" ? "bg-primary/20 text-primary" :
                          "bg-blue-500/20 text-blue-500"
                        }>
                          {campaign.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {campaign.type === "email" ? <Mail className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                        <span className="capitalize">{campaign.type}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Sent</p>
                      <p className="text-lg font-semibold">{campaign.sent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Delivered</p>
                      <p className="text-lg font-semibold">{campaign.delivered.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Opened</p>
                      <p className="text-lg font-semibold">{campaign.opened.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Clicked</p>
                      <p className="text-lg font-semibold">{campaign.clicked.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="email">
              {campaigns.filter(c => c.type === "email").map((campaign) => (
                <div key={campaign.id} className="p-6 rounded-lg bg-card border border-border mb-4">
                  <h3 className="text-lg font-semibold mb-2">{campaign.name}</h3>
                  <Badge>{campaign.status}</Badge>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="whatsapp">
              {campaigns.filter(c => c.type === "whatsapp").map((campaign) => (
                <div key={campaign.id} className="p-6 rounded-lg bg-card border border-border mb-4">
                  <h3 className="text-lg font-semibold mb-2">{campaign.name}</h3>
                  <Badge>{campaign.status}</Badge>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
