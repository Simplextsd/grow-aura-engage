import { useState, useEffect } from "react";
import { MessageSquare, Instagram, Facebook, TrendingUp, MessageCircle, Eye, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ComposeMessageDialog } from "@/components/ComposeMessageDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfDay, subDays, endOfDay } from "date-fns";

interface Message {
  id: string;
  contact_id: string | null;
  platform: string;
  message_text: string | null;
  is_read: boolean;
  responded: boolean;
  received_at: string;
  contacts: {
    first_name: string;
    last_name: string;
  } | null;
}

interface MessageStats {
  total: number;
  unread: number;
  responded: number;
}

export default function Messages() {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats>({ total: 0, unread: 0, responded: 0 });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("today");
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, [timeFilter, activeTab]);

  const getTimeRange = () => {
    const now = new Date();
    switch (timeFilter) {
      case "today":
        return { start: startOfDay(now), end: endOfDay(now) };
      case "week":
        return { start: startOfDay(subDays(now, 7)), end: endOfDay(now) };
      case "month":
        return { start: startOfDay(subDays(now, 30)), end: endOfDay(now) };
      default:
        return { start: startOfDay(now), end: endOfDay(now) };
    }
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { start, end } = getTimeRange();

      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          contacts (
            first_name,
            last_name
          )
        `)
        .eq("user_id", user.id)
        .eq("platform", activeTab)
        .gte("received_at", start.toISOString())
        .lte("received_at", end.toISOString())
        .order("received_at", { ascending: false });

      if (error) throw error;

      setMessages(data || []);
      
      // Calculate stats
      const totalMessages = data?.length || 0;
      const unreadMessages = data?.filter(m => !m.is_read).length || 0;
      const respondedMessages = data?.filter(m => m.responded).length || 0;
      
      setStats({
        total: totalMessages,
        unread: unreadMessages,
        responded: respondedMessages,
      });
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (platform: string) => {
    switch (platform) {
      case "whatsapp": return <MessageSquare className="h-5 w-5" />;
      case "instagram": return <Instagram className="h-5 w-5" />;
      case "facebook": return <Facebook className="h-5 w-5" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    return format(date, "MMM d, h:mm a");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Unified inbox for all your conversations</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px] bg-card border-border">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <ComposeMessageDialog />
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {timeFilter === "today" ? "Received today" : `Last ${timeFilter === "week" ? "7" : "30"} days`}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Responded</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responded}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${Math.round((stats.responded / stats.total) * 100)}%` : "0%"} response rate
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unopened</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unread}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Inbox</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-secondary">
              <TabsTrigger value="whatsapp" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </TabsTrigger>
              <TabsTrigger value="instagram" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </TabsTrigger>
              <TabsTrigger value="facebook" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              <Input 
                placeholder="Search messages..." 
                className="bg-secondary border-border"
              />
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages found for this period</p>
                  <p className="text-sm mt-2">Connect your {activeTab} account in Settings to start receiving messages</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-card hover:bg-secondary/50 transition-colors cursor-pointer border border-border"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        {getIcon(msg.platform)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">
                            {msg.contacts 
                              ? `${msg.contacts.first_name} ${msg.contacts.last_name}`
                              : "Unknown Contact"}
                          </h4>
                          {!msg.is_read && <Badge className="bg-primary text-primary-foreground">New</Badge>}
                          {msg.responded && <Badge variant="outline">Responded</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {msg.message_text || "No message content"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(msg.received_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
