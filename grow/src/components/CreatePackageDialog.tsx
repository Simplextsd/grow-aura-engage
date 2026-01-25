import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Calendar, Hotel, Plane, Package, Search, Moon, Heart, Download, Image as ImageIcon, X, MessageSquare, Users, Building2 } from "lucide-react";
import { jsPDF } from "jspdf";

// --- CRM PACKAGE DIALOG FOR MYSQL ---

export function CreatePackageDialog({ onPackageCreated }: { onPackageCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("hotel");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Dynamic list for auto-saving hotel names
  const [dynamicHotels, setDynamicHotels] = useState(["KFC Residency", "Pearl Continental (PC)", "Marriott Hotel", "Makkah Tower Hotel"]);

  const suggestions = {
    umrah: ["15 Days Premium Umrah", "Economy Umrah Package 2026", "Ramadan Special (Makkah/Madinah)"],
    hotel: ["KFC Residency", "Pearl Continental (PC)", "Marriott Hotel", "Makkah Tower Hotel"],
    flight: ["LHE-JED (PIA)", "KHI-DXB (Emirates)"],
    honeymoon: ["Maldives Luxury Resort", "Paris Romantic Tour", "Bali Private Villa"]
  };

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    startDate: "",
    endDate: "",
    destination: "",
    makkahNights: "", 
    madinahNights: "", 
    duration: "", 
    pnrNumber: "", 
    airline: "", 
    roomType: "", 
    noOfTravelers: "1",
    specialRequest: "",
    // New Hotel Fields
    hotelName: "",
    hotelCheckIn: "",
    hotelCheckOut: "",
    hotelPersons: ""
  });

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.price) {
        toast({ title: "Error", description: "Name and Price are required!", variant: "destructive" });
        return;
      }

      setIsSaving(true);

      // --- AUTO-SAVE HOTEL NAME TO DROPDOWN ---
      if (formData.hotelName && !dynamicHotels.includes(formData.hotelName)) {
        setDynamicHotels((prev) => [...prev, formData.hotelName]);
      }

      const packageBody = {
        packageName: formData.name,
        destination: formData.destination || "Multiple",
        duration: formData.duration || `${formData.startDate} to ${formData.endDate}`,
        price: parseFloat(formData.price) || 0,
        category: category,
        maxTravelers: parseInt(formData.noOfTravelers) || 1,
        description: formData.specialRequest,
        image_url: selectedImage || "", 
        included_services: JSON.stringify({
            ...formData
        })
      };

      const response = await fetch("http://localhost:5000/api/packages/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "MySQL Backend Error");
      }

      toast({ title: "Success ✅", description: "Data saved to CRM Database!" });
      setOpen(false); 
      if (onPackageCreated) onPackageCreated(); 

    } catch (error: any) {
      toast({ 
        title: "Database Error", 
        description: error.message || "Make sure your server is running!", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      toast({ title: "Image Added", description: "Picture successfully attached!" });
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const item = e.clipboardData.items[0];
    if (item?.type.includes("image")) {
      const blob = item.getAsFile();
      if (blob) handleImageUpload(blob);
    }
  };

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFillColor(249, 115, 22); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(`${category.toUpperCase()} BOOKING INVOICE`, 105, 25, { align: "center" });

    if (selectedImage) {
      try {
        doc.addImage(selectedImage, 'JPEG', 150, 45, 45, 35);
      } catch (e) { console.error("PDF Image Error", e); }
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Booking For: ${formData.name}`, 20, 55);
    doc.text(`Destination: ${formData.destination}`, 20, 65);
    doc.text(`Total Travelers: ${formData.noOfTravelers}`, 20, 75);
    doc.text(`Price: $${formData.price}`, 20, 85);
    doc.text(`Duration: ${formData.startDate} to ${formData.endDate}`, 20, 95);
    
    if(category === "umrah") {
        doc.text(`Nights: Makkah(${formData.makkahNights}), Madinah(${formData.madinahNights})`, 20, 105);
    }

    if (formData.specialRequest) {
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text("Special Instructions:", 20, 115);
      const splitRequest = doc.splitTextToSize(formData.specialRequest, 170);
      doc.text(splitRequest, 20, 122);
    }

    doc.save(`${category}_Invoice.pdf`);
    toast({ title: "Success", description: "Invoice Downloaded!" });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold">
          <PlusCircle className="mr-2 h-5 w-5" /> Add customer
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 text-white overflow-y-auto max-h-[95vh] p-8" onPaste={handlePaste}>
        <DialogHeader className="border-b border-slate-800 pb-4">
          <DialogTitle className="text-3xl font-bold flex items-center gap-3">
              <div className="p-2 bg-orange-600/20 rounded-lg"><Package className="text-orange-500" /></div>
              Create {category.charAt(0).toUpperCase() + category.slice(1)} Entry
          </DialogTitle>
          <DialogDescription className="sr-only">Fill in the details to save to MySQL</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
            <div className="space-y-2 flex flex-col justify-end">
              <Label className="text-slate-400 h-5 flex items-center gap-2">
                <Users size={14} className="text-orange-500" /> Category Type
              </Label>
              <Select onValueChange={(val) => setCategory(val)} defaultValue="hotel">
                <SelectTrigger className="bg-slate-900 border-slate-700 h-12">
                  <SelectValue placeholder="Choose Category" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-slate-800">
                  <SelectItem value="umrah"><span className="flex items-center gap-2"><Moon size={14} className="text-yellow-500"/> Umrah</span></SelectItem>
                  <SelectItem value="hotel"><span className="flex items-center gap-2"><Hotel size={14} className="text-blue-400"/> Hotel Booking</span></SelectItem>
                  <SelectItem value="flight"><span className="flex items-center gap-2"><Plane size={14} className="text-emerald-400"/> Flight Booking</span></SelectItem>
                  <SelectItem value="honeymoon"><span className="flex items-center gap-2"><Heart size={14} className="text-pink-500"/> Honeymoon</span></SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <Label className="flex items-center gap-2 text-slate-400 h-5">
                <Search size={14} className="text-orange-500"/> Search/Package Name
              </Label>
              <Input 
                list="category-search"
                placeholder={`e.g. ${suggestions[category as keyof typeof suggestions][0]}`}
                className="bg-slate-900 border-slate-700 h-12"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <datalist id="category-search">
                {suggestions[category as keyof typeof suggestions]?.map(s => <option key={s} value={s} />)}
              </datalist>
            </div>
          </div>

          {/* IMAGE UPLOAD SECTION */}
          <div 
            className="border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-900/20 hover:border-orange-500/50 cursor-pointer transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedImage ? (
              <div className="relative w-full h-40">
                <img src={selectedImage} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                <Button variant="destructive" size="icon" className="absolute -top-3 -right-3 h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}><X size={16} /></Button>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="mx-auto text-slate-600 mb-2" size={40} />
                <p className="text-sm text-slate-400 font-medium">Drag & Drop or <span className="text-orange-500">Paste Image (Ctrl+V)</span></p>
              </div>
            )}
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
          </div>

          <div className="p-6 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-6">
            {category === "umrah" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label>Makkah Nights</Label>
                  <Input placeholder="7" className="bg-slate-800 border-slate-700 h-11" onChange={(e)=>setFormData({...formData, makkahNights: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Madinah Nights</Label>
                  <Input placeholder="7" className="bg-slate-800 border-slate-700 h-11" onChange={(e)=>setFormData({...formData, madinahNights: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Total Duration</Label>
                  <Input placeholder="15 Days" className="bg-slate-800 border-slate-700 h-11" onChange={(e)=>setFormData({...formData, duration: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>No. of Members</Label>
                  <Input type="number" defaultValue="1" className="bg-slate-800 border-slate-700 h-11" onChange={(e)=>setFormData({...formData, noOfTravelers: e.target.value})} />
                </div>
              </div>
            )}

            {category === "flight" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-300">
                <div className="space-y-2">
                  <Label>PNR Number</Label>
                  <Input placeholder="ABC123XYZ" className="bg-slate-800 border-slate-700 h-11" onChange={(e)=>setFormData({...formData, pnrNumber: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Airline Name</Label>
                  <Input placeholder="Emirates" className="bg-slate-800 border-slate-700 h-11" onChange={(e)=>setFormData({...formData, airline: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>No. of Members</Label>
                  <Input type="number" defaultValue="1" className="bg-slate-800 border-slate-700 h-11" onChange={(e)=>setFormData({...formData, noOfTravelers: e.target.value})} />
                </div>
              </div>
            )}

            {category === "hotel" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Room Type</Label>
                  <Select onValueChange={(v)=>setFormData({...formData, roomType: v})}>
                    <SelectTrigger className="bg-slate-800 border-slate-700 h-11"><SelectValue placeholder="Select Room" /></SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-slate-800">
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="triple">Triple</SelectItem>
                        <SelectItem value="quad">Quad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>No. of Travelers</Label>
                  <Input type="number" defaultValue="1" className="bg-slate-800 border-slate-700 h-11" onChange={(e)=>setFormData({...formData, noOfTravelers: e.target.value})} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar size={14} className="text-orange-400"/> {category === "hotel" ? "Check-In Date" : "Start Date"}</Label>
                <Input type="date" className="bg-slate-800 border-slate-700 text-white h-11" onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar size={14} className="text-orange-400"/> {category === "hotel" ? "Check-Out Date" : "End Date"}</Label>
                <Input type="date" className="bg-slate-800 border-slate-700 text-white h-11" onChange={(e) => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>
          </div>

          {/* --- UPDATED HOTEL DETAILS DROPDOWN (ONLY FOR UMRAH & HONEYMOON) --- */}
          {(category === "umrah" || category === "honeymoon") && (
            <div className="p-6 bg-orange-600/5 rounded-2xl border border-orange-500/20 space-y-4 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 text-orange-500 font-bold mb-2">
                    <Building2 size={18} /> Hotel Stay Information
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Hotel Name (Search or Type New)</Label>
                        <Input 
                          list="hotel-dropdown"
                          placeholder="Enter Hotel/Resort Name" 
                          className="bg-slate-900 border-slate-700 h-11" 
                          onChange={(e)=>setFormData({...formData, hotelName: e.target.value})} 
                        />
                        <datalist id="hotel-dropdown">
                          {dynamicHotels.map((h, i) => <option key={i} value={h} />)}
                        </datalist>
                    </div>
                    <div className="space-y-2">
                        <Label>No. of People</Label>
                        <Input type="number" placeholder="How many people?" className="bg-slate-900 border-slate-700 h-11" onChange={(e)=>setFormData({...formData, hotelPersons: e.target.value})} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Check-In Date (Entry)</Label>
                        <Input type="date" className="bg-slate-900 border-slate-700 h-11 text-white" onChange={(e)=>setFormData({...formData, hotelCheckIn: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Check-Out Date (Exit)</Label>
                        <Input type="date" className="bg-slate-900 border-slate-700 h-11 text-white" onChange={(e)=>setFormData({...formData, hotelCheckOut: e.target.value})} />
                    </div>
                </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <Label>Main Destination / City</Label>
              <Input placeholder="e.g. Jeddah, London" className="bg-slate-900 border-slate-700 h-12" onChange={(e) => setFormData({...formData, destination: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Total Price ($)</Label>
              <Input type="number" placeholder="0.00" className="bg-slate-900 border-slate-700 h-12 text-emerald-400 font-bold" onChange={(e) => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-slate-400"><MessageSquare size={14} className="text-orange-500" /> Special Requests / Private Notes</Label>
            <Textarea 
              placeholder="Enter special requirements..."
              className="bg-slate-900 border-slate-700 min-h-[100px] focus:border-orange-500 transition-all"
              onChange={(e) => setFormData({...formData, specialRequest: e.target.value})}
            />
          </div>

          <DialogFooter className="gap-4">
            <Button type="button" variant="outline" className="border-slate-700 flex-1 h-12" onClick={handleDownloadInvoice}>
              <Download className="mr-2 h-4 w-4" /> Generate Invoice
            </Button>
            <Button 
              className="bg-orange-600 hover:bg-orange-700 flex-1 h-12 font-bold shadow-lg shadow-orange-900/20"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving to MySQL..." : `Save ${category.toUpperCase()} Entry`}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}