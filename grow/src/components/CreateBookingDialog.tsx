import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

interface CreateBookingDialogProps {
  onBookingCreated?: () => void;
}

export function CreateBookingDialog({
  onBookingCreated,
}: CreateBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: "",
    packageId: "",
    travelDate: "",
    return_date: "",
    travelers: "1",
    totalAmount: "",
    special_requests: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.packageId) {
      toast({
        title: "Error",
        description: "Please select a package",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("token");

    const payload = {
      customerName: formData.customerName,
      package: formData.packageId,
      travelDate: formData.travelDate,
      returnDate: formData.return_date,
      numberOfTravelers: Number(formData.travelers),
      totalAmount: Number(formData.totalAmount),
      specialRequests: formData.special_requests,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/bookings/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create booking");
      }

      toast({
        title: "Success",
        description: "Booking created successfully!",
      });

      setOpen(false);
      setFormData({
        customerName: "",
        packageId: "",
        travelDate: "",
        return_date: "",
        travelers: "1",
        totalAmount: "",
        special_requests: "",
      });

      onBookingCreated?.();
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
          New Booking
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-950 text-white border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create New Booking
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Package</Label>
              <Select
                value={formData.packageId}
                onValueChange={(value) =>
                  setFormData({ ...formData, packageId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="umrah">Umrah</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* ✅ Travel Date */}
            <div className="space-y-2">
              <Label>Travel Date</Label>
              <Input
                type="date"
                required
                className="text-white [&::-webkit-calendar-picker-indicator]:invert"
                onChange={(e) =>
                  setFormData({ ...formData, travelDate: e.target.value })
                }
              />
            </div>

            {/* ✅ Return Date */}
            <div className="space-y-2">
              <Label>Return Date</Label>
              <Input
                type="date"
                required
                className="text-white [&::-webkit-calendar-picker-indicator]:invert"
                onChange={(e) =>
                  setFormData({ ...formData, return_date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Travelers</Label>
              <Input
                type="number"
                min="1"
                value={formData.travelers}
                onChange={(e) =>
                  setFormData({ ...formData, travelers: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Total Amount</Label>
              <Input
                type="number"
                required
                onChange={(e) =>
                  setFormData({ ...formData, totalAmount: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Special Requests</Label>
            <Textarea
              onChange={(e) =>
                setFormData({
                  ...formData,
                  special_requests: e.target.value,
                })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
