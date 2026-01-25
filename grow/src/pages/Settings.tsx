import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Bell, Lock, User, Database, Plus, Save, Building, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { IntegrationConfigDialog } from "@/components/IntegrationConfigDialog";
import { AddIntegrationDialog } from "@/components/AddIntegrationDialog";

export default function Settings() {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<"whatsapp" | "facebook" | "instagram" | "email">("whatsapp");
  const [loading, setLoading] = useState(false);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    company: "",
    phone: "",
  });
  const [integrationStatus, setIntegrationStatus] = useState({
    whatsapp: false,
    facebook: false,
    instagram: false,
    email: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
    fetchIntegrationStatus();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      setProfile({
        full_name: data?.full_name || user.user_metadata?.full_name || "",
        email: data?.email || user.email || "",
        company: data?.company || "Grow Business Digital",
        phone: data?.phone || "",
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchIntegrationStatus = async () => {
    setIntegrationsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("integrations")
        .select("platform, status")
        .eq("user_id", user.id);

      if (error) throw error;

      const statusMap = {
        whatsapp: false,
        facebook: false,
        instagram: false,
        email: false,
      };

      data?.forEach((integration) => {
        if (integration.status === "connected") {
          statusMap[integration.platform as keyof typeof statusMap] = true;
        }
      });

      setIntegrationStatus(statusMap);
    } catch (error: any) {
      console.error("Error fetching integration status:", error);
      toast({
        title: "Error",
        description: "Failed to load integration status",
        variant: "destructive",
      });
    } finally {
      setIntegrationsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          company: profile.company,
          phone: profile.phone,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
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

  const handleConfigure = (platform: "whatsapp" | "facebook" | "instagram" | "email") => {
    setSelectedPlatform(platform);
    setConfigDialogOpen(true);
  };

  const handleAddIntegration = (integration: string) => {
    if (integration === "whatsapp" || integration === "facebook" || integration === "instagram" || integration === "email") {
      setSelectedPlatform(integration as "whatsapp" | "facebook" | "instagram" | "email");
      setConfigDialogOpen(true);
    }
  };

  const handleConnectionSuccess = (platform: "whatsapp" | "facebook" | "instagram" | "email") => {
    setIntegrationStatus(prev => ({ ...prev, [platform]: true }));
    fetchIntegrationStatus(); // Refresh status from database
    toast({
      title: "Success",
      description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully`,
    });
  };

  const handleDisconnect = async (platform: "whatsapp" | "facebook" | "instagram" | "email") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("integrations")
        .delete()
        .eq("user_id", user.id)
        .eq("platform", platform);

      if (error) throw error;

      setIntegrationStatus(prev => ({ ...prev, [platform]: false }));
      toast({
        title: "Disconnected",
        description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} has been disconnected`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your travel agency profile and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input 
                    id="name" 
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="John Doe" 
                    className="bg-secondary border-border" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile.email}
                    placeholder="john@example.com" 
                    className="bg-secondary border-border"
                    disabled 
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Company Name
                  </Label>
                  <Input 
                    id="company" 
                    value={profile.company}
                    onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                    placeholder="Travel Agency Inc." 
                    className="bg-secondary border-border" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000" 
                    className="bg-secondary border-border" 
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email alerts for important updates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Campaign Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified when campaigns complete</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Messages</Label>
                <p className="text-sm text-muted-foreground">Alert me when new messages arrive</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Integration Settings</CardTitle>
                  <CardDescription>Connect your messaging platforms to centralize customer communications</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <p className="text-sm text-muted-foreground">
                Connect your WhatsApp, Facebook, Instagram, and Email accounts to receive and manage all customer messages in one place.
              </p>
            </div>

            {integrationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* WhatsApp Integration */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp Business API</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${integrationStatus.whatsapp ? 'bg-green-500' : 'bg-muted-foreground'}`}></span>
                        <p className="text-sm text-muted-foreground">
                          {integrationStatus.whatsapp ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={integrationStatus.whatsapp ? "outline" : "default"} 
                      size="sm" 
                      onClick={() => handleConfigure("whatsapp")}
                    >
                      {integrationStatus.whatsapp ? 'Configure' : 'Connect'}
                    </Button>
                    {integrationStatus.whatsapp && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDisconnect("whatsapp")}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Facebook Integration */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <SettingsIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Facebook Messenger</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${integrationStatus.facebook ? 'bg-green-500' : 'bg-muted-foreground'}`}></span>
                        <p className="text-sm text-muted-foreground">
                          {integrationStatus.facebook ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={integrationStatus.facebook ? "outline" : "default"} 
                      size="sm" 
                      onClick={() => handleConfigure("facebook")}
                    >
                      {integrationStatus.facebook ? 'Configure' : 'Connect'}
                    </Button>
                    {integrationStatus.facebook && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDisconnect("facebook")}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Instagram Integration */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <SettingsIcon className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Instagram Direct</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${integrationStatus.instagram ? 'bg-green-500' : 'bg-muted-foreground'}`}></span>
                        <p className="text-sm text-muted-foreground">
                          {integrationStatus.instagram ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={integrationStatus.instagram ? "outline" : "default"} 
                      size="sm" 
                      onClick={() => handleConfigure("instagram")}
                    >
                      {integrationStatus.instagram ? 'Configure' : 'Connect'}
                    </Button>
                    {integrationStatus.instagram && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDisconnect("instagram")}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                </div>

                {/* Email Integration */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium">Email Integration</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${integrationStatus.email ? 'bg-green-500' : 'bg-muted-foreground'}`}></span>
                        <p className="text-sm text-muted-foreground">
                          {integrationStatus.email ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant={integrationStatus.email ? "outline" : "default"} 
                      size="sm" 
                      onClick={() => handleConfigure("email")}
                    >
                      {integrationStatus.email ? 'Configure' : 'Connect'}
                    </Button>
                    {integrationStatus.email && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDisconnect("email")}
                      >
                        Disconnect
                      </Button>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <IntegrationConfigDialog
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          platform={selectedPlatform}
          onSuccess={() => handleConnectionSuccess(selectedPlatform)}
        />

        <AddIntegrationDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSelectIntegration={handleAddIntegration}
        />

        <Card className="shadow-card border-border/50 border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle>Danger Zone</CardTitle>
                <CardDescription>Irreversible and destructive actions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">Delete</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
