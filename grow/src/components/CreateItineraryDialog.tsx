import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

interface CreateItineraryDialogProps {
  onItineraryCreated?: () => void;
}

export function CreateItineraryDialog({ onItineraryCreated }: CreateItineraryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    booking_id: "",
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    destinations: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 🔹 Data Object structure according to Backend
      const itineraryData = {
        booking_id: formData.booking_id, 
        itinerary_name: formData.name, // Matches backend 'itinerary_name'
        description: formData.description || null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        destinations: formData.destinations, 
      };

      const response = await fetch("http://localhost:5000/api/itineraries/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itineraryData),
      });

      if (!response.ok) throw new Error("Failed to save data in MySQL");

      toast({
        title: "Success",
        description: "Itinerary saved successfully",
      });

      setFormData({
        booking_id: "",
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        destinations: "",
      });
      setOpen(false);
      onItineraryCreated?.();
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
        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
          <PlusCircle className="mr-2 h-4 w-4" />
          New Itinerary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Create Itinerary</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="booking" className="text-white">Related Booking / Client Name</Label>
            <Input
              id="booking"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
              value={formData.booking_id}
              onChange={(e) => setFormData({ ...formData, booking_id: e.target.value })}
              placeholder="Enter Booking ID or Client Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">Itinerary Name</Label>
            <Input
              id="name"
              required
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., European Adventure"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              className="bg-zinc-900 border-zinc-700 text-white min-h-[100px] placeholder:text-zinc-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the itinerary..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-white">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                required
                className="bg-zinc-900 border-zinc-700 text-white"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-white">End Date</Label>
              <Input
                id="end_date"
                type="date"
                required
                className="bg-zinc-900 border-zinc-700 text-white"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinations" className="text-white">Destinations</Label>
            <Input
              id="destinations"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
              value={formData.destinations}
              onChange={(e) => setFormData({ ...formData, destinations: e.target.value })}
              placeholder="e.g., Paris, Rome, Barcelona"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white">
              {loading ? "Creating..." : "Create Itinerary"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}