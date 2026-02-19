import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  PlusCircle,
  Users,
  Hotel,
  DollarSign,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";

export function CreateHotelDialog({ onHotelCreated }: { onHotelCreated?: () => void }) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    guestName: "",
    phone: "",
    email: "",
    nationality: "",
    adults: "1",
    children: "0",
    hotelName: "",
    city: "",
    checkIn: "",
    checkOut: "",
    roomType: "",
    rooms: "1",
    mealPlan: "",
    supplier: "",
    confirmationNo: "",
    bookingRef: "",
    costPrice: "",
    sellingPrice: "",
    tax: "",
    discount: "",
    paymentStatus: "",
    paymentMethod: "",
    cancellationPolicy: "",
    remarks: "",
  });

  const profit =
    (parseFloat(formData.sellingPrice) || 0) -
    (parseFloat(formData.costPrice) || 0) -
    (parseFloat(formData.tax) || 0) -
    (parseFloat(formData.discount) || 0);

  const handleSave = async () => {
    try {
      setIsSaving(true);

      await fetch("http://localhost:5000/api/packages/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "hotel",
          price: formData.sellingPrice,
          image_url: selectedImage || "",
          included_services: JSON.stringify(formData),
        }),
      });

      toast({ title: "Saved ✅", description: "Hotel booking saved successfully" });
      setOpen(false);
      if (onHotelCreated) onHotelCreated();
    } catch {
      toast({ title: "Error", description: "Server error", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const sectionStyle =
    "bg-slate-900/40 border border-slate-800 rounded-lg p-4 space-y-4";

  const inputStyle =
    "bg-slate-800 border-slate-700 h-8 text-xs px-2 rounded-md";

  const labelStyle = "text-xs text-slate-400";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-xs px-4 h-8">
          <PlusCircle className="mr-1 h-4 w-4" /> Add Hotel
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl bg-slate-950 text-white border border-slate-800 p-5 overflow-y-auto max-h-[90vh] rounded-xl">

        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Hotel size={16} className="text-orange-500" />
            Hotel Booking Entry
          </DialogTitle>
        </DialogHeader>

        {/* IMAGE */}
        <div
          className="border border-dashed border-slate-800 rounded-md p-3 text-center cursor-pointer hover:border-orange-500 transition"
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedImage ? (
            <div className="relative">
              <img src={selectedImage} className="h-16 mx-auto object-contain rounded" />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-0 right-0 h-5 w-5 text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                <X size={10} />
              </Button>
            </div>
          ) : (
            <>
              <ImageIcon className="mx-auto mb-1 text-slate-500" size={16} />
              <p className="text-xs text-slate-400">Upload Voucher</p>
            </>
          )}
          <input type="file" ref={fileInputRef} className="hidden" />
        </div>

        {/* CLIENT INFORMATION */}
        <div className={sectionStyle}>
          <h4 className="text-xs font-semibold text-orange-400 flex items-center gap-1">
            <Users size={12}/> Client Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ["guestName", "Guest Name"],
              ["phone", "Phone"],
              ["email", "Email"],
              ["nationality", "Nationality"],
              ["adults", "Adults"],
              ["children", "Children"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-1">
                <Label className={labelStyle}>{label}</Label>
                <Input
                  className={inputStyle}
                  value={(formData as any)[field]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* STAY INFORMATION */}
        <div className={sectionStyle}>
          <h4 className="text-xs font-semibold text-orange-400">
            Stay Information
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ["hotelName", "Hotel Name"],
              ["city", "City"],
              ["checkIn", "Check In"],
              ["checkOut", "Check Out"],
              ["roomType", "Room Type"],
              ["rooms", "No. of Rooms"],
              ["mealPlan", "Meal Plan"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-1">
                <Label className={labelStyle}>{label}</Label>
                <Input
                  type={
                    field === "checkIn" || field === "checkOut"
                      ? "date"
                      : "text"
                  }
                  className={inputStyle}
                  value={(formData as any)[field]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* FINANCIAL */}
        <div className={sectionStyle}>
          <h4 className="text-xs font-semibold text-orange-400 flex items-center gap-1">
            <DollarSign size={12}/> Financial Summary
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              ["costPrice", "Cost"],
              ["sellingPrice", "Selling"],
              ["tax", "Tax"],
              ["discount", "Discount"],
            ].map(([field, label]) => (
              <div key={field} className="space-y-1">
                <Label className={labelStyle}>{label}</Label>
                <Input
                  type="number"
                  className={inputStyle}
                  value={(formData as any)[field]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>

          <div className="text-right text-emerald-400 text-xs font-semibold">
            Net Profit: {profit}
          </div>
        </div>

        {/* INTERNAL NOTES */}
        <div className={sectionStyle}>
          <h4 className="text-xs font-semibold text-orange-400">
            Internal Notes
          </h4>

          <div className="space-y-3">
            <div>
              <Label className={labelStyle}>Cancellation Policy</Label>
              <Textarea
                className="bg-slate-800 border-slate-700 h-14 text-xs"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cancellationPolicy: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <Label className={labelStyle}>Remarks</Label>
              <Textarea
                className="bg-slate-800 border-slate-700 h-14 text-xs"
                onChange={(e) =>
                  setFormData({ ...formData, remarks: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            size="sm"
            className="bg-orange-600 hover:bg-orange-700 text-xs px-6 h-8"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Booking"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
