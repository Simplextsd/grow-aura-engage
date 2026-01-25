import { useState } from "react";
import { MessageSquare, Mail, Smartphone, Bell } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CreateCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type CampaignType = "whatsapp" | "email" | "sms" | "push" | null;

const campaignTypes = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: MessageSquare,
    description: "Send bulk messages via WhatsApp Business API",
    color: "bg-green-500",
  },
  {
    id: "email",
    name: "Email",
    icon: Mail,
    description: "Send email campaigns to your contacts",
    color: "bg-blue-500",
  },
  {
    id: "sms",
    name: "SMS",
    icon: Smartphone,
    description: "Send SMS messages to mobile numbers",
    color: "bg-purple-500",
  },
  {
    id: "push",
    name: "Push Notifications",
    icon: Bell,
    description: "Send push notifications to app users",
    color: "bg-primary",
  },
];

export function CreateCampaignDialog({ open, onOpenChange }: CreateCampaignDialogProps) {
  const [step, setStep] = useState<"select" | "create">("select");
  const [selectedType, setSelectedType] = useState<CampaignType>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
    segment: "",
    scheduledTime: "",
  });

  const handleTypeSelect = (type: CampaignType) => {
    setSelectedType(type);
    setStep("create");
  };

  const handleBack = () => {
    setStep("select");
    setSelectedType(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Campaign Created!",
      description: `Your ${selectedType} campaign "${formData.name}" has been created successfully.`,
    });
    onOpenChange(false);
    // Reset form
    setStep("select");
    setSelectedType(null);
    setFormData({
      name: "",
      subject: "",
      message: "",
      segment: "",
      scheduledTime: "",
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep("select");
      setSelectedType(null);
      setFormData({
        name: "",
        subject: "",
        message: "",
        segment: "",
        scheduledTime: "",
      });
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Create New Campaign</DialogTitle>
              <DialogDescription>
                Choose the type of campaign you want to launch
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {campaignTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id as CampaignType)}
                  className="flex flex-col items-center gap-3 p-6 rounded-lg border-2 border-border hover:border-primary transition-all duration-300 bg-secondary/50 hover:bg-secondary group"
                >
                  <div className={`h-14 w-14 rounded-lg ${type.color}/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <type.icon className={`h-7 w-7 ${type.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold mb-1">{type.name}</h3>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                {campaignTypes.find(t => t.id === selectedType)?.icon && (
                  <div className={`h-8 w-8 rounded-lg ${campaignTypes.find(t => t.id === selectedType)?.color}/10 flex items-center justify-center`}>
                    {(() => {
                      const Icon = campaignTypes.find(t => t.id === selectedType)?.icon;
                      return Icon ? <Icon className={`h-4 w-4 ${campaignTypes.find(t => t.id === selectedType)?.color.replace('bg-', 'text-')}`} /> : null;
                    })()}
                  </div>
                )}
                {campaignTypes.find(t => t.id === selectedType)?.name} Campaign
              </DialogTitle>
              <DialogDescription>
                Fill in the details for your campaign
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Summer Sale 2024"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="bg-secondary border-border"
                />
              </div>

              {selectedType === "email" && (
                <div className="space-y-2">
                  <Label htmlFor="subject">Email Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Enter email subject line"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="bg-secondary border-border"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="segment">Target Segment *</Label>
                <Select
                  value={formData.segment}
                  onValueChange={(value) => setFormData({ ...formData, segment: value })}
                  required
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select customer segment" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border z-50">
                    <SelectItem value="all">All Contacts</SelectItem>
                    <SelectItem value="vip">VIP Customers</SelectItem>
                    <SelectItem value="regular">Regular Customers</SelectItem>
                    <SelectItem value="new">New Leads</SelectItem>
                    <SelectItem value="inactive">Inactive Customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder={
                    selectedType === "email"
                      ? "Enter your email content..."
                      : selectedType === "sms"
                      ? "Enter your SMS message (160 characters max)..."
                      : selectedType === "push"
                      ? "Enter your notification message..."
                      : "Enter your WhatsApp message..."
                  }
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={6}
                  className="bg-secondary border-border resize-none"
                  maxLength={selectedType === "sms" ? 160 : undefined}
                />
                {selectedType === "sms" && (
                  <p className="text-xs text-muted-foreground">
                    {formData.message.length}/160 characters
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledTime">Schedule (Optional)</Label>
                <Input
                  id="scheduledTime"
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  className="bg-secondary border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to send immediately
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                >
                  {formData.scheduledTime ? "Schedule Campaign" : "Launch Campaign"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
