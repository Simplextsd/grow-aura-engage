import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Info, MapPin, Clock, Filter, ImageIcon, Hotel, Plane } from "lucide-react";
import { CreatePackageDialog } from "@/components/CreatePackageDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Packages = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, []);

  // Image URL Fix
  const getImageUrl = (url: string) => {
    if (!url) return "";
    // Agar Google Drive link hai
    if (url.includes("drive.google.com")) {
      const fileId = url.split("/d/")[1]?.split("/")[0] || url.split("id=")[1]?.split("&")[0];
      return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
    }
    return url;
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/packages/all");
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch packages");
      setPackages(data || []);
    } catch (error: any) {
      toast({
        title: "Database Error",
        description: "Could not connect to MySQL packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      adventure: "bg-orange-500",
      luxury: "bg-purple-500",
      family: "bg-blue-500",
      honeymoon: "bg-pink-500",
      business: "bg-gray-500",
      umrah: "bg-yellow-600",
      hotel: "bg-emerald-500",
      flight: "bg-sky-500",
    };
    return colors[category?.toLowerCase()] || "bg-green-500";
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = 
      pkg.packageName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      pkg.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || pkg.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div className="p-8 text-white text-center">Loading packages...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Travel Packages</h1>
          <p className="text-muted-foreground">Manage your travel packages</p>
        </div>
        <CreatePackageDialog onPackageCreated={fetchPackages} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/30 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-950 border-slate-800 text-white h-11"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="text-orange-500 h-5 w-5 hidden md:block" />
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-[200px] bg-slate-950 border-slate-800 h-11 text-white">
              <SelectValue placeholder="Category: All" />
            </SelectTrigger>
            <SelectContent className="bg-slate-950 text-white border-slate-800">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="umrah">Umrah</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="flight">Flight</SelectItem>
              <SelectItem value="honeymoon">Honeymoon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-800/50">
            <TableRow>
              <TableHead className="text-white">Package Name</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Destination</TableHead>
              <TableHead className="text-white">Duration</TableHead>
              <TableHead className="text-white">Price</TableHead>
              <TableHead className="text-right text-white">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPackages.map((pkg) => {
              
              // Safe JSON Parsing to prevent crash
              let extraDetails: any = {};
              try {
                if (pkg.included_services) {
                  extraDetails = typeof pkg.included_services === 'string' 
                    ? JSON.parse(pkg.included_services) 
                    : pkg.included_services;
                }
              } catch (e) {
                console.error("Error parsing details for:", pkg.packageName);
                extraDetails = {};
              }

              return (
                <TableRow key={pkg.id} className="hover:bg-slate-800/30 transition-colors border-slate-800 text-white">
                  <TableCell className="font-medium">{pkg.packageName}</TableCell>
                  <TableCell>
                    <Badge className={getCategoryColor(pkg.category)}>{pkg.category || "General"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-300">
                      <MapPin className="h-3 w-3 text-orange-500" /> {pkg.destination}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-slate-300">
                      <Clock className="h-3 w-3 text-blue-500" /> {pkg.duration}
                    </div>
                  </TableCell>
                  <TableCell className="text-green-500 font-bold">
                    ${parseFloat(pkg.price).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 border-blue-500/50 text-blue-400">
                          <Info className="mr-2 h-3 w-3" /> View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-950 text-white border-slate-800 max-w-2xl overflow-y-auto max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle className="text-2xl text-orange-500 border-b border-slate-800 pb-2 flex justify-between">
                            {pkg.packageName}
                            <Badge className={getCategoryColor(pkg.category)}>{pkg.category}</Badge>
                          </DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6 py-4">
                          {/* Screenshot */}
                          <div className="space-y-2">
                            <p className="text-[10px] text-slate-500 uppercase flex items-center gap-2 tracking-widest"><ImageIcon size={14}/> Attached Screenshot</p>
                            {pkg.image_url ? (
                              <div className="w-full h-64 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
                                <img 
                                  src={getImageUrl(pkg.image_url)} 
                                  alt="Package Preview" 
                                  className="w-full h-full object-contain"
                                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Image+Not+Found'; }}
                                />
                              </div>
                            ) : (
                              <div className="w-full h-24 flex items-center justify-center bg-slate-900 rounded-xl border border-dashed border-slate-800 text-slate-500">
                                No screenshot provided
                              </div>
                            )}
                          </div>

                          {/* Grid Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                              <h4 className="text-orange-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-800 pb-1">Basic Information</h4>
                              <p className="text-sm flex justify-between"><span className="text-slate-500">Destination:</span> <span>{pkg.destination}</span></p>
                              <p className="text-sm flex justify-between"><span className="text-slate-500">Duration:</span> <span>{pkg.duration}</span></p>
                              <p className="text-sm flex justify-between"><span className="text-slate-500">Price:</span> <span className="text-green-500 font-bold">${pkg.price}</span></p>
                              <p className="text-sm flex justify-between"><span className="text-slate-500">Max Travelers:</span> <span>{extraDetails?.noOfTravelers || pkg.maxTravelers || 'N/A'}</span></p>
                            </div>

                            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                              <h4 className="text-blue-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-1"><Hotel size={14}/> Stay Details</h4>
                              {extraDetails?.hotelName && <p className="text-sm flex justify-between"><span className="text-slate-500">Hotel:</span> <span className="text-blue-300">{extraDetails.hotelName}</span></p>}
                              {extraDetails?.roomType && <p className="text-sm flex justify-between"><span className="text-slate-500">Room:</span> <span>{extraDetails.roomType}</span></p>}
                              {extraDetails?.makkahNights && <p className="text-sm flex justify-between"><span className="text-slate-500">Makkah:</span> <span>{extraDetails.makkahNights} Nights</span></p>}
                              {extraDetails?.madinahNights && <p className="text-sm flex justify-between"><span className="text-slate-500">Madinah:</span> <span>{extraDetails.madinahNights} Nights</span></p>}
                              {extraDetails?.airline && <p className="text-sm flex justify-between pt-1 border-t border-slate-800 mt-2"><span className="text-slate-500">Airline:</span> <span className="flex items-center gap-1"><Plane size={12}/> {extraDetails.airline}</span></p>}
                            </div>
                          </div>

                          {/* Description */}
                          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Description / Special Notes</p>
                            <p className="text-sm text-slate-300 leading-relaxed italic border-l-2 border-orange-500 pl-4 py-1">
                              {pkg.description || "No additional notes found."}
                            </p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Packages;