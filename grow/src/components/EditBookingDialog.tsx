import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Hash } from "lucide-react"; // Added Hash icon

interface EditBookingDialogProps {
  booking: any;
  onBookingUpdated: () => void;
}

export function EditBookingDialog({ booking, onBookingUpdated }: EditBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerName: "",
    packageId: "", 
    travelDate: "",
    returnDate: "", 
    numberOfTravelers: "1", 
    totalAmount: "",
    specialRequests: "", 
    status: "Pending"
  });

  useEffect(() => {
    if (open && booking) {
      setFormData({
        customerName: booking.customerName || "",
        packageId: booking.packageId || booking.package || "Custom", 
        travelDate: booking.travelDate ? new Date(booking.travelDate).toISOString().split('T')[0] : "",
        returnDate: booking.returnDate ? new Date(booking.returnDate).toISOString().split('T')[0] : "",
        numberOfTravelers: booking.numberOfTravelers?.toString() || "1",
        totalAmount: booking.totalAmount?.toString() || "",
        specialRequests: booking.specialRequests || "",
        status: booking.status || "Pending"
      });
    }
  }, [open, booking]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:5000/api/bookings/update/${booking.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({ title: "Success!", description: "Booking updated successfully." });
        setOpen(false);
        onBookingUpdated();
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (error: any) {
      toast({ title: "Database Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-orange-500 hover:bg-orange-500/10">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#0b0f1a] text-white border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold border-b border-slate-800 pb-2">Edit Booking</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleUpdate} className="space-y-5 pt-4">
          {/* Booking ID Display Box */}
          <div className="bg-slate-900/80 border border-slate-700 p-3 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Hash className="h-4 w-4" />
              <span className="text-sm font-semibold">Booking ID:</span>
            </div>
            <span className="font-mono text-orange-500 font-bold">#{booking.id}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input
                className="bg-slate-900 border-slate-700 focus:border-orange-600"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Package</Label>
              <Select value={formData.packageId} onValueChange={(v) => setFormData({ ...formData, packageId: v })}>
                <SelectTrigger className="bg-slate-900 border-slate-700">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-slate-800">
                  <SelectItem value="Luxury">Luxury</SelectItem>
                  <SelectItem value="Umrah">Umrah</SelectItem>
                  <SelectItem value="Adventure">Adventure</SelectItem>
                  <SelectItem value="Family">Family</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Travel Date</Label>
              <Input
                type="date"
                className="bg-slate-900 border-slate-700 [color-scheme:dark]"
                value={formData.travelDate}
                onChange={(e) => setFormData({ ...formData, travelDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Return Date</Label>
              <Input
                type="date"
                className="bg-slate-900 border-slate-700 [color-scheme:dark]"
                value={formData.returnDate}
                onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>No. of Travelers</Label>
              <Input
                type="number"
                min="1"
                className="bg-slate-900 border-slate-700"
                value={formData.numberOfTravelers}
                onChange={(e) => setFormData({ ...formData, numberOfTravelers: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Total Amount ($)</Label>
              <Input
                type="number"
                className="bg-slate-900 border-slate-700 font-mono"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Booking Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="bg-slate-900 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-slate-800">
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Special Requests</Label>
            <Textarea
              className="bg-slate-900 border-slate-700 min-h-[80px]"
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-slate-700 text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 text-white min-w-[120px]">
              {loading ? "Updating..." : "Update Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}