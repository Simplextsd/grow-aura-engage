import { MessageSquare, Mail, Smartphone, Instagram, Facebook, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectIntegration: (integration: string) => void;
}

const availableIntegrations = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    icon: MessageSquare,
    description: "Connect WhatsApp Business API",
    color: "bg-green-500",
    status: "available",
  },
  {
    id: "facebook",
    name: "Facebook Messenger",
    icon: Facebook,
    description: "Integrate Facebook Messenger",
    color: "bg-blue-500",
    status: "available",
  },
  {
    id: "instagram",
    name: "Instagram Direct",
    icon: Instagram,
    description: "Connect Instagram messaging",
    color: "bg-purple-500",
    status: "available",
  },
  {
    id: "email",
    name: "Email Service",
    icon: Mail,
    description: "Configure email integration",
    color: "bg-orange-500",
    status: "available",
  },
  {
    id: "sms",
    name: "SMS Gateway",
    icon: Smartphone,
    description: "Add SMS messaging support",
    color: "bg-indigo-500",
    status: "coming-soon",
  },
  {
    id: "zapier",
    name: "Zapier",
    icon: Zap,
    description: "Connect with 5000+ apps",
    color: "bg-slate-500",
    status: "coming-soon",
  },
];

export function AddIntegrationDialog({
  open,
  onOpenChange,
  onSelectIntegration,
}: AddIntegrationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Integration</DialogTitle>
          <DialogDescription>
            Connect your favorite platforms and tools
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          {availableIntegrations.map((integration) => {
            const Icon = integration.icon;
            const isComingSoon = integration.status === "coming-soon";
            return (
              <button
                key={integration.id}
                onClick={() => {
                  if (!isComingSoon) {
                    onSelectIntegration(integration.id);
                    onOpenChange(false);
                  }
                }}
                disabled={isComingSoon}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 border-border transition-all duration-300 bg-secondary/50 text-left ${
                  isComingSoon 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:border-primary hover:bg-secondary group cursor-pointer'
                }`}
              >
                <div className={`h-12 w-12 rounded-lg ${integration.color}/10 flex items-center justify-center flex-shrink-0 ${!isComingSoon && 'group-hover:scale-110'} transition-transform`}>
                  <Icon className={`h-6 w-6 ${integration.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{integration.name}</h3>
                    {isComingSoon && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
