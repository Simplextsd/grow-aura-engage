import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PlusCircle } from "lucide-react";

interface CreateSegmentDialogProps {
  onSegmentCreated?: () => void;
}

export function CreateSegmentDialog({ onSegmentCreated }: CreateSegmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_dynamic: true,
    filter_type: "status",
    filter_value: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create filters object based on selection
      const filters: any = {};
      if (formData.filter_type && formData.filter_value) {
        filters[formData.filter_type] = formData.filter_value;
      }

      const { error } = await supabase.from("segments").insert({
        user_id: user.id,
        name: formData.name,
        description: formData.description || null,
        is_dynamic: formData.is_dynamic,
        filters: filters,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Segment created successfully",
      });

      setFormData({
        name: "",
        description: "",
        is_dynamic: true,
        filter_type: "status",
        filter_value: "",
      });
      setOpen(false);
      onSegmentCreated?.();
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Segment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Audience Segment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Segment Name</Label>
            <Input
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., High-Value Customers"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this segment..."
            />
          </div>

          <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="dynamic">Dynamic Segment</Label>
              <p className="text-sm text-muted-foreground">
                Automatically update contacts based on filters
              </p>
            </div>
            <Switch
              id="dynamic"
              checked={formData.is_dynamic}
              onCheckedChange={(checked) => setFormData({ ...formData, is_dynamic: checked })}
            />
          </div>

          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="text-sm font-medium">Segmentation Filters</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filter_type">Filter By</Label>
                <Select
                  value={formData.filter_type}
                  onValueChange={(value) => setFormData({ ...formData, filter_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="status">Contact Status</SelectItem>
                    <SelectItem value="source">Lead Source</SelectItem>
                    <SelectItem value="lead_score">Lead Score</SelectItem>
                    <SelectItem value="country">Country</SelectItem>
                    <SelectItem value="city">City</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filter_value">Value</Label>
                <Input
                  id="filter_value"
                  value={formData.filter_value}
                  onChange={(e) => setFormData({ ...formData, filter_value: e.target.value })}
                  placeholder="e.g., active, facebook, high"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              More advanced filtering options will be available after creating the segment
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Segment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
