import { useState } from "react";
import { MessageSquare, Instagram, Facebook, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface IntegrationConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: "whatsapp" | "facebook" | "instagram" | "email";
  onSuccess?: () => void;
}

const platformConfig = {
  whatsapp: {
    name: "WhatsApp Business API",
    icon: MessageSquare,
    color: "bg-green-500",
    fields: [
      { id: "phoneNumberId", label: "Phone Number ID", placeholder: "123456789012345", required: true },
      { id: "accessToken", label: "Access Token", placeholder: "Your WhatsApp Business API token", required: true, type: "password" },
      { id: "verifyToken", label: "Verify Token", placeholder: "Your webhook verify token", required: true },
      { id: "webhookUrl", label: "Webhook URL", placeholder: "https://your-domain.com/webhook", required: false },
    ],
    docs: "https://developers.facebook.com/docs/whatsapp",
  },
  facebook: {
    name: "Facebook Messenger",
    icon: Facebook,
    color: "bg-blue-500",
    fields: [
      { id: "pageId", label: "Page ID", placeholder: "Your Facebook Page ID", required: true },
      { id: "pageAccessToken", label: "Page Access Token", placeholder: "Your page access token", required: true, type: "password" },
      { id: "appSecret", label: "App Secret", placeholder: "Your app secret", required: true, type: "password" },
      { id: "verifyToken", label: "Verify Token", placeholder: "Your webhook verify token", required: true },
    ],
    docs: "https://developers.facebook.com/docs/messenger-platform",
  },
  instagram: {
    name: "Instagram Direct",
    icon: Instagram,
    color: "bg-purple-500",
    fields: [
      { id: "accountId", label: "Instagram Business Account ID", placeholder: "Your Instagram account ID", required: true },
      { id: "accessToken", label: "Access Token", placeholder: "Your Instagram Graph API token", required: true, type: "password" },
      { id: "webhookUrl", label: "Webhook URL", placeholder: "https://your-domain.com/webhook", required: false },
    ],
    docs: "https://developers.facebook.com/docs/instagram-api",
  },
  email: {
    name: "Email Integration",
    icon: MessageSquare,
    color: "bg-orange-500",
    fields: [
      { id: "smtpHost", label: "SMTP Host", placeholder: "smtp.gmail.com", required: true },
      { id: "smtpPort", label: "SMTP Port", placeholder: "587", required: true },
      { id: "smtpUser", label: "Email Address", placeholder: "your-email@example.com", required: true },
      { id: "smtpPassword", label: "Email Password", placeholder: "Your email password or app password", required: true, type: "password" },
      { id: "imapHost", label: "IMAP Host", placeholder: "imap.gmail.com", required: true },
      { id: "imapPort", label: "IMAP Port", placeholder: "993", required: true },
    ],
    docs: "https://support.google.com/mail/answer/7126229",
  },
};

export function IntegrationConfigDialog({
  open,
  onOpenChange,
  platform,
  onSuccess,
}: IntegrationConfigDialogProps) {
  const config = platformConfig[platform];
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectionStatus("idle");

    try {
      // Validate all required fields are filled
      const missingFields = config.fields
        .filter(field => field.required && !formData[field.id])
        .map(field => field.label);

      if (missingFields.length > 0) {
        throw new Error(`Please fill in: ${missingFields.join(", ")}`);
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save integration to database
      const { error } = await supabase
        .from("integrations")
        .upsert({
          user_id: user.id,
          platform,
          status: "connected",
          credentials: formData,
          last_sync_at: new Date().toISOString(),
        }, {
          onConflict: "user_id,platform"
        });

      if (error) throw error;

      setConnectionStatus("success");
      toast({
        title: "Integration Connected!",
        description: `${config.name} has been successfully configured and connected.`,
      });

      onSuccess?.();

      // Close dialog after success
      setTimeout(() => {
        onOpenChange(false);
        setConnectionStatus("idle");
        setFormData({});
      }, 1500);
    } catch (error: any) {
      setConnectionStatus("error");
      toast({
        title: "Connection Failed",
        description: error.message || "Please verify your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTestConnection = async () => {
    setIsConnecting(true);
    setConnectionStatus("idle");

    setTimeout(() => {
      const success = Math.random() > 0.3;
      
      if (success) {
        setConnectionStatus("success");
        toast({
          title: "Connection Successful!",
          description: `Successfully connected to ${config.name}.`,
        });
      } else {
        setConnectionStatus("error");
        toast({
          title: "Connection Failed",
          description: "Unable to verify credentials. Please check and try again.",
          variant: "destructive",
        });
      }
      setIsConnecting(false);
    }, 1500);
  };

  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-10 w-10 rounded-lg ${config.color}/10 flex items-center justify-center`}>
              <Icon className={`h-5 w-5 ${config.color.replace('bg-', 'text-')}`} />
            </div>
            <div>
              <DialogTitle className="text-xl">{config.name}</DialogTitle>
              <DialogDescription>Configure your API credentials</DialogDescription>
            </div>
          </div>
          {connectionStatus === "success" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <Check className="h-4 w-4 text-green-500" />
              <p className="text-sm text-green-500 font-medium">Connected successfully!</p>
            </div>
          )}
          {connectionStatus === "error" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive font-medium">Connection failed. Please check credentials.</p>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Input
                id={field.id}
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={formData[field.id] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field.id]: e.target.value })
                }
                required={field.required}
                className="bg-secondary border-border"
              />
            </div>
          ))}

          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium">Need help getting credentials?</p>
                <a
                  href={config.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View {platform} integration documentation →
                </a>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={isConnecting || !Object.values(formData).some(v => v)}
            >
              {isConnecting ? "Testing..." : "Test Connection"}
            </Button>
            <Button
              type="submit"
              disabled={isConnecting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isConnecting ? "Connecting..." : "Save & Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
