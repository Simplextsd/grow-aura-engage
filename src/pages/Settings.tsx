import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Settings as SettingsIcon,
  Bell,
  Lock,
  User,
  Database,
  Plus,
  Save,
  Building,
  Phone,
  Mail,
  ShieldCheck,
  CheckSquare,
  Trash2,
  Search,
  RefreshCw,
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { IntegrationConfigDialog } from "@/components/IntegrationConfigDialog";
import { AddIntegrationDialog } from "@/components/AddIntegrationDialog";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type CRMUser = {
  id: number;
  full_name: string;
  email: string;
  role: string;
  permissions: string[];
  created_at?: string;
};

export default function Settings() {
  const { toast } = useToast();

  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<"whatsapp" | "facebook" | "instagram" | "email">("whatsapp");

  const [loading, setLoading] = useState(false);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);

  // ✅ Profile state (MySQL)
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    company: "",
    phone: "",
  });

  // ✅ Create User with Access (MySQL)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [permissions, setPermissions] = useState<string[]>([]);

  // ✅ USERS LIST
  const [users, setUsers] = useState<CRMUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState("");

  const availablePages = useMemo(
    () => [
      { id: "dashboard", label: "Dashboard" },
      { id: "contacts", label: "Contacts" },
      { id: "bookings", label: "Bookings" },
      { id: "hotels", label: "Hotels" },
      { id: "campaigns", label: "Campaigns" },
      { id: "messages", label: "Messages" },
      { id: "segments", label: "Segments" },
      { id: "lead_forms", label: "Lead Forms" },
      { id: "workflows", label: "Workflows" },
      { id: "reputation", label: "Reputation" },
      { id: "invoices", label: "Invoices" },
      { id: "courses", label: "Courses" },
      { id: "calls", label: "Calls" },
      { id: "ai_assistant", label: "AI Assistant" },
      { id: "reports", label: "Reports" },
      { id: "settings", label: "Settings" },
    ],
    []
  );

  const togglePermission = (id: string) => {
    setPermissions((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  // ✅ Integration status UI (UI only)
  const [integrationStatus, setIntegrationStatus] = useState({
    whatsapp: false,
    facebook: false,
    instagram: false,
    email: false,
  });

  useEffect(() => {
    fetchProfile();
    fetchIntegrationStatus();
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ PROFILE GET
  const fetchProfile = async () => {
    try {
      const res = await api.get("/api/profile");
      setProfile({
        full_name: res.data?.full_name || "",
        email: res.data?.email || "",
        company: res.data?.company || "Grow Business Digital",
        phone: res.data?.phone || "",
      });
    } catch (error: any) {
      console.error("fetchProfile error:", error);
    }
  };

  // ✅ Integration status (UI only)
  const fetchIntegrationStatus = async () => {
    setIntegrationsLoading(true);
    try {
      setIntegrationStatus({
        whatsapp: false,
        facebook: false,
        instagram: false,
        email: false,
      });
    } catch (error: any) {
      console.error("fetchIntegrationStatus error:", error);
      toast({
        title: "Error",
        description: "Failed to load integration status",
        variant: "destructive",
      });
    } finally {
      setIntegrationsLoading(false);
    }
  };

  // ✅ PROFILE SAVE
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/api/profile", {
        full_name: profile.full_name,
        company: profile.company,
        phone: profile.phone,
      });
      toast({ title: "Success", description: "Profile updated successfully (MySQL)" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ USERS LIST FETCH
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get("/api/users");
      setUsers(res.data?.users || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  // ✅ CREATE USER
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        full_name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: "user",
        permissions: permissions,
      };

      const res = await api.post("/api/users", payload);

      toast({
        title: "User Created!",
        description: res.data?.message || "Saved in MySQL successfully.",
      });

      setNewUser({ name: "", email: "", password: "" });
      setPermissions([]);
      await fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.response?.data?.error || error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE USER
  const handleDeleteUser = async (id: number) => {
    if (!confirm("Delete this user?")) return;

    try {
      await api.delete(`/api/users/${id}`);
      toast({ title: "Deleted", description: "User deleted successfully" });
      await fetchUsers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error.message,
        variant: "destructive",
      });
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
    );
  }, [users, userSearch]);

  // dialogs
  const handleConfigure = (platform: "whatsapp" | "facebook" | "instagram" | "email") => {
    setSelectedPlatform(platform);
    setConfigDialogOpen(true);
  };

  const handleAddIntegration = (integration: string) => {
    if (integration === "whatsapp" || integration === "facebook" || integration === "instagram" || integration === "email") {
      setSelectedPlatform(integration as any);
      setConfigDialogOpen(true);
    }
  };

  const handleConnectionSuccess = (platform: "whatsapp" | "facebook" | "instagram" | "email") => {
    setIntegrationStatus((prev) => ({ ...prev, [platform]: true }));
    fetchIntegrationStatus();
    toast({
      title: "Success",
      description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} connected successfully`,
    });
  };

  const handleDisconnect = async (platform: "whatsapp" | "facebook" | "instagram" | "email") => {
    try {
      setIntegrationStatus((prev) => ({ ...prev, [platform]: false }));
      toast({
        title: "Disconnected",
        description: `${platform.charAt(0).toUpperCase() + platform.slice(1)} has been disconnected`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || error.message,
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
        {/* Profile Settings */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your personal information (MySQL)</CardDescription>
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
                  <Input id="email" type="email" value={profile.email} className="bg-secondary border-border" disabled />
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
                    placeholder="Grow Business Digital"
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
                    placeholder="+92 300 0000000"
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

        {/* Create User */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <CardTitle>User Management & Access Control</CardTitle>
                <CardDescription>Create new users and assign page access (MySQL)</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="newUser_name">User Name</Label>
                  <Input
                    id="newUser_name"
                    placeholder="Employee Name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newUser_email">User Email</Label>
                  <Input
                    id="newUser_email"
                    type="email"
                    placeholder="email@example.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newUser_password">Password</Label>
                  <Input
                    id="newUser_password"
                    type="password"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  Select Page Access
                </Label>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg">
                  {availablePages.map((page) => (
                    <div key={page.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={page.id}
                        checked={permissions.includes(page.id)}
                        onCheckedChange={() => togglePermission(page.id)}
                      />
                      <label htmlFor={page.id} className="text-sm font-medium cursor-pointer">
                        {page.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full md:w-auto bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                {loading ? "Creating..." : "Create User with Access"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Users List (CRM) */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>CRM Users</CardTitle>
                <CardDescription>All saved users (Name, Email, Role, Permissions)</CardDescription>
              </div>

              <div className="flex gap-2">
                <div className="relative hidden md:block">
                  <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search name/email/role..."
                    className="pl-9 w-[280px]"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={fetchUsers} disabled={usersLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${usersLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="md:hidden mb-3">
              <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search name/email/role..."
                  className="pl-9"
                />
              </div>
            </div>

            {usersLoading ? (
              <div className="py-10 text-center text-muted-foreground">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">No users found</div>
            ) : (
              <div className="w-full overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr className="text-left">
                      <th className="p-3 font-semibold">#</th>
                      <th className="p-3 font-semibold">Name</th>
                      <th className="p-3 font-semibold">Email</th>
                      <th className="p-3 font-semibold">Role</th>
                      <th className="p-3 font-semibold">Permissions</th>
                      <th className="p-3 font-semibold">Password</th>
                      <th className="p-3 font-semibold">Created</th>
                      <th className="p-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((u, idx) => (
                      <tr key={u.id} className="border-t border-border hover:bg-muted/20">
                        <td className="p-3 text-muted-foreground">{idx + 1}</td>
                        <td className="p-3 font-medium">{u.full_name || "-"}</td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2 py-1 text-xs font-semibold text-orange-600">
                            {u.role || "user"}
                          </span>
                        </td>

                        <td className="p-3">
                          <div className="flex flex-wrap gap-2">
                            {(u.permissions || []).slice(0, 6).map((p) => (
                              <span key={p} className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                                {p}
                              </span>
                            ))}
                            {(u.permissions || []).length > 6 && (
                              <span className="text-xs text-muted-foreground">+{u.permissions.length - 6} more</span>
                            )}
                          </div>
                        </td>

                        {/* security */}
                        <td className="p-3 text-muted-foreground">••••••••</td>

                        <td className="p-3 text-muted-foreground">
                          {u.created_at ? new Date(u.created_at).toLocaleString() : "-"}
                        </td>

                        <td className="p-3 text-right">
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
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

        {/* Integrations */}
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Integration Settings</CardTitle>
                  <CardDescription>Connect your messaging platforms to centralize communications</CardDescription>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {integrationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* WhatsApp */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <Phone className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">WhatsApp Business API</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${integrationStatus.whatsapp ? "bg-green-500" : "bg-muted-foreground"}`}></span>
                        <p className="text-sm text-muted-foreground">{integrationStatus.whatsapp ? "Connected" : "Not connected"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant={integrationStatus.whatsapp ? "outline" : "default"} size="sm" onClick={() => handleConfigure("whatsapp")}>
                      {integrationStatus.whatsapp ? "Configure" : "Connect"}
                    </Button>
                    {integrationStatus.whatsapp && (
                      <Button variant="ghost" size="sm" onClick={() => handleDisconnect("whatsapp")}>
                        Disconnect
                      </Button>
                    )}
                  </div>
                </div>

                {/* Facebook */}
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <SettingsIcon className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Facebook Messenger</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`h-2 w-2 rounded-full ${integrationStatus.facebook ? "bg-green-500" : "bg-muted-foreground"}`}></span>
                        <p className="text-sm text-muted-foreground">{integrationStatus.facebook ? "Connected" : "Not connected"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant={integrationStatus.facebook ? "outline" : "default"} size="sm" onClick={() => handleConfigure("facebook")}>
                      {integrationStatus.facebook ? "Configure" : "Connect"}
                    </Button>
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

        <AddIntegrationDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSelectIntegration={handleAddIntegration} />

        {/* Danger Zone */}
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
