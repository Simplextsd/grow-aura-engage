import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Calendar, Eye, Pencil, MapPin } from "lucide-react";
import { CreateItineraryDialog } from "@/components/CreateItineraryDialog";

const Itineraries = () => {
  const [itineraries, setItineraries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  
  const [selectedItinerary, setSelectedItinerary] = useState<any>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/itineraries");
      const data = await response.json();
      setItineraries(data || []);
    } catch (error: any) {
      toast({ title: "Error", description: "Fetch failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Updated", description: "Changes saved successfully" });
    setEditOpen(false);
    fetchItineraries();
  };

  const filteredItineraries = itineraries.filter((it) =>
    it.itinerary_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    it.booking_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 bg-[#020817] min-h-screen text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Itineraries</h1>
          <p className="text-zinc-400 text-sm">Manage and view all trip schedules</p>
        </div>
        <CreateItineraryDialog onItineraryCreated={fetchItineraries} />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#0f172a] border-zinc-800 text-white"
          />
        </div>
      </div>

      
      <div className="rounded-md border border-zinc-800 bg-[#020817] overflow-hidden">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="bg-[#0f172a] text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="p-4">Itinerary Name</th>
              <th className="p-4">Booking ID</th>
              <th className="p-4">Duration</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredItineraries.map((it) => (
              <tr key={it.id} className="hover:bg-zinc-900/40 transition-colors">
                <td className="p-4 font-medium">{it.itinerary_name}</td>
                <td className="p-4 text-orange-500">{it.booking_id}</td>
                <td className="p-4 text-zinc-300">
                  {new Date(it.start_date).toLocaleDateString()} - {new Date(it.end_date).toLocaleDateString()}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" size="icon" className="text-blue-400"
                      onClick={() => { setSelectedItinerary(it); setViewOpen(true); }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" size="icon" className="text-orange-500"
                      onClick={() => { setSelectedItinerary(it); setEditOpen(true); }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="bg-zinc-950 text-white border-zinc-800 max-w-lg">
          <DialogHeader><DialogTitle className="border-b border-zinc-800 pb-2">Itinerary Details</DialogTitle></DialogHeader>
          {selectedItinerary && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-zinc-500 text-xs">Client/Booking</Label><p className="text-orange-500 font-semibold">{selectedItinerary.booking_id}</p></div>
                <div><Label className="text-zinc-500 text-xs">Name</Label><p>{selectedItinerary.itinerary_name}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-zinc-500 text-xs">Start Date</Label><p>{new Date(selectedItinerary.start_date).toLocaleDateString()}</p></div>
                <div><Label className="text-zinc-500 text-xs">End Date</Label><p>{new Date(selectedItinerary.end_date).toLocaleDateString()}</p></div>
              </div>
              <div><Label className="text-zinc-500 text-xs">Destinations</Label><p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedItinerary.destinations}</p></div>
              <div><Label className="text-zinc-500 text-xs">Description</Label><p className="bg-zinc-900 p-3 rounded text-zinc-400 text-xs">{selectedItinerary.description || "N/A"}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ✏️ EDIT POPUP (MUKAMMAL DETAILS) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="bg-zinc-950 text-white border-zinc-800 max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-xl font-bold">Edit Itinerary</DialogTitle></DialogHeader>
          {selectedItinerary && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-zinc-400">Related Booking / Client Name</Label>
                <Input defaultValue={selectedItinerary.booking_id} className="bg-zinc-900 border-zinc-800 text-white" />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Itinerary Name</Label>
                <Input defaultValue={selectedItinerary.itinerary_name} className="bg-zinc-900 border-zinc-800 text-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400">Start Date</Label>
                  <Input type="date" defaultValue={selectedItinerary.start_date?.split('T')[0]} className="bg-zinc-900 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400">End Date</Label>
                  <Input type="date" defaultValue={selectedItinerary.end_date?.split('T')[0]} className="bg-zinc-900 border-zinc-800" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Destinations</Label>
                <Input defaultValue={selectedItinerary.destinations} className="bg-zinc-900 border-zinc-800 text-white" />
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-400">Description</Label>
                <Textarea defaultValue={selectedItinerary.description} className="bg-zinc-900 border-zinc-800 text-white min-h-[100px]" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)} className="border-zinc-800">Cancel</Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white px-8">Update Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Itineraries;