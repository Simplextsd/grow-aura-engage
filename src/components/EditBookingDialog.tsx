import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Hash, Plane, Hotel, Car, Briefcase } from "lucide-react";

interface EditBookingDialogProps {
  booking: any;
  onBookingUpdated: () => void;
}

export function EditBookingDialog({ booking, onBookingUpdated }: EditBookingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // STAGE 1: Admin-only Check
  const userRole = localStorage.getItem("userRole"); 
  if (userRole !== 'admin') return null;

  const [formData, setFormData] = useState({
    customerName: "",
    travelDate: "",
    returnDate: "",
    status: "Pending",
    totalAmount: "",
    // Flight Table Details
    airline: "",
    flightNo: "",
    depCity: "",
    arrCity: "",
    depTime: "",
    arrTime: "",
    // Hotel Table Details
    hotelName: "",
    roomType: "",
    mealPlan: "",
    checkIn: "",
    checkOut: "",
    // Transport Table Details
    vehicle: "",
    pickup: "",
    dropoff: "",
    paxCount: "1",
    specialRequests: ""
  });

  useEffect(() => {
    if (open && booking) {
      setFormData({
        customerName: booking.customerName || "",
        travelDate: booking.travelDate ? new Date(booking.travelDate).toISOString().split('T')[0] : "",
        returnDate: booking.returnDate ? new Date(booking.returnDate).toISOString().split('T')[0] : "",
        status: booking.status || "Pending",
        totalAmount: booking.totalAmount || "",
        airline: booking.airline || "",
        flightNo: booking.flightNo || "",
        depCity: booking.depCity || "",
        arrCity: booking.arrCity || "",
        depTime: booking.depTime || "",
        arrTime: booking.arrTime || "",
        hotelName: booking.hotelName || "",
        roomType: booking.roomType || "",
        mealPlan: booking.mealPlan || "",
        checkIn: booking.checkIn ? new Date(booking.checkIn).toISOString().split('T')[0] : "",
        checkOut: booking.checkOut ? new Date(booking.checkOut).toISOString().split('T')[0] : "",
        vehicle: booking.vehicle || "",
        pickup: booking.pickup || "",
        dropoff: booking.dropoff || "",
        paxCount: booking.paxCount || "1",
        specialRequests: booking.specialRequests || ""
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

      // Error Handling logic improved for JSON/HTML error
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        if (response.ok) {
          toast({ title: "Success", description: "All trip details updated." });
          setOpen(false);
          onBookingUpdated();
        } else {
          throw new Error(result.error || "Update failed");
        }
      } else {
        // If server sends HTML error instead of JSON
        const textError = await response.text();
        console.error("Server HTML Error:", textError);
        throw new Error("Server error: Check backend console.");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-orange-500 hover:bg-orange-500/10 border border-orange-500/20">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-[#0b0f1a] text-white border-slate-800 p-0">
        <div className="sticky top-0 bg-[#0b0f1a] z-10 p-6 border-b border-slate-800">
          <DialogHeader>
            <div className="flex justify-between items-center pr-6">
              <DialogTitle className="text-2xl font-bold text-orange-500 flex items-center gap-2">
                <Briefcase className="w-6 h-6" /> TRIP MASTER EDITOR
              </DialogTitle>
              <div className="bg-slate-900 px-3 py-1 rounded border border-orange-500/40">
                <span className="text-orange-500 font-mono text-xl">#Booking ID: {booking.id}</span>
              </div>
            </div>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleUpdate} className="p-6 space-y-8">
          
          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <div className="md:col-span-2 space-y-2">
              <Label className="text-slate-400">Customer Name</Label>
              <Input className="bg-slate-950 border-slate-700" value={formData.customerName} onChange={(e)=>setFormData({...formData, customerName:e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Travel Date</Label>
              <Input type="date" className="bg-slate-950 border-slate-700 [color-scheme:dark]" value={formData.travelDate} onChange={(e)=>setFormData({...formData, travelDate:e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-400">Status</Label>
              <Select value={formData.status} onValueChange={(v)=>setFormData({...formData, status:v})}>
                <SelectTrigger className="bg-slate-950 border-slate-700"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-950 text-white border-slate-800">
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* FLIGHT TABLE SECTION */}
          <div className="space-y-3">
            <h3 className="text-blue-400 font-bold flex items-center gap-2 uppercase text-xs border-b border-blue-900 pb-2"><Plane size={14}/> Flight Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Airline</Label><Input placeholder="Airline" className="bg-slate-950 border-slate-800" value={formData.airline} onChange={(e)=>setFormData({...formData, airline:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Flt #</Label><Input placeholder="Flt #" className="bg-slate-950 border-slate-800" value={formData.flightNo} onChange={(e)=>setFormData({...formData, flightNo:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Dep City</Label><Input placeholder="Dep City" className="bg-slate-950 border-slate-800" value={formData.depCity} onChange={(e)=>setFormData({...formData, depCity:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Arr City</Label><Input placeholder="Arr City" className="bg-slate-950 border-slate-800" value={formData.arrCity} onChange={(e)=>setFormData({...formData, arrCity:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Dep Time</Label><Input type="time" className="bg-slate-950 border-slate-800" value={formData.depTime} onChange={(e)=>setFormData({...formData, depTime:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Arr Time</Label><Input type="time" className="bg-slate-950 border-slate-800" value={formData.arrTime} onChange={(e)=>setFormData({...formData, arrTime:e.target.value})} /></div>
            </div>
          </div>

          {/* ACCOMMODATION TABLE SECTION */}
          <div className="space-y-3">
            <h3 className="text-green-400 font-bold flex items-center gap-2 uppercase text-xs border-b border-green-900 pb-2"><Hotel size={14}/> Accommodation</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Hotel Name</Label><Input placeholder="Hotel Name" className="bg-slate-950 border-slate-800" value={formData.hotelName} onChange={(e)=>setFormData({...formData, hotelName:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Room Type</Label><Input placeholder="Room Type" className="bg-slate-950 border-slate-800" value={formData.roomType} onChange={(e)=>setFormData({...formData, roomType:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Meal Plan</Label><Input placeholder="Meal Plan" className="bg-slate-950 border-slate-800" value={formData.mealPlan} onChange={(e)=>setFormData({...formData, mealPlan:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Check-In</Label><Input type="date" className="bg-slate-950 border-slate-800" value={formData.checkIn} onChange={(e)=>setFormData({...formData, checkIn:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Check-Out</Label><Input type="date" className="bg-slate-950 border-slate-800" value={formData.checkOut} onChange={(e)=>setFormData({...formData, checkOut:e.target.value})} /></div>
            </div>
          </div>

          {/* TRANSPORT TABLE SECTION */}
          <div className="space-y-3">
            <h3 className="text-purple-400 font-bold flex items-center gap-2 uppercase text-xs border-b border-purple-900 pb-2"><Car size={14}/> Transport</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Vehicle</Label><Input placeholder="Vehicle Type" className="bg-slate-950 border-slate-800" value={formData.vehicle} onChange={(e)=>setFormData({...formData, vehicle:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Pick Up</Label><Input placeholder="Pick Up Point" className="bg-slate-950 border-slate-800" value={formData.pickup} onChange={(e)=>setFormData({...formData, pickup:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Drop Off</Label><Input placeholder="Drop Off Point" className="bg-slate-950 border-slate-800" value={formData.dropoff} onChange={(e)=>setFormData({...formData, dropoff:e.target.value})} /></div>
              <div className="space-y-1"><Label className="text-[10px] text-slate-500">Pax</Label><Input type="number" placeholder="Pax" className="bg-slate-950 border-slate-800" value={formData.paxCount} onChange={(e)=>setFormData({...formData, paxCount:e.target.value})} /></div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400">Notes / Special Requests</Label>
            <Textarea className="bg-slate-950 border-slate-800" value={formData.specialRequests} onChange={(e)=>setFormData({...formData, specialRequests:e.target.value})} />
          </div>

          <div className="flex justify-end gap-3 pb-8">
            <Button type="button" variant="outline" onClick={()=>setOpen(false)} className="border-slate-700 text-white">Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 px-10 text-white">
              {loading ? "Updating..." : "Save Master Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}