import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CreateHotelDialog } from "@/components/CreateHotelDialog";
import { Search, MapPin, Phone, Star, DollarSign } from "lucide-react";

export default function Hotels() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/hotels", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "ngrok-skip-browser-warning": "true" // Agar ngrok use kar rahe hain
        }
      });

      if (!response.ok) throw new Error("Failed to fetch hotels");

      const data = await response.json();
      // Console check ke liye
      console.log("🏨 Hotels Data:", data);
      setHotels(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        title: "Database Error",
        description: error.message || "Unable to fetch hotels",
        variant: "destructive",
      });
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fix: Search ab 'category' column par kaam karega
  const filteredHotels = hotels.filter((hotel) =>
    (hotel?.category || hotel?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    if (status === "active" || !status) return "bg-green-500/10 text-green-500 border-green-500/20";
    return "bg-red-500/10 text-red-500 border-red-500/20";
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Loading hotels from database...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Hotels</h1>
          <p className="text-muted-foreground">
            Manage hotel partners, contracts & pricing
          </p>
        </div>
        <CreateHotelDialog onHotelCreated={fetchHotels} />
      </div>

      {/* SEARCH */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by category or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* GRID */}
      {filteredHotels.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-lg text-muted-foreground">
          No hotels found in database.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHotels.map((hotel) => (
            <Card key={hotel.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden border-t-4 border-t-primary">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center text-xl">
                  {/* ✅ Category ko name ki jagah use kiya hai */}
                  {hotel.category || hotel.name || "Unnamed Hotel"}
                  <Badge variant="outline" className={getStatusColor(hotel.status)}>
                    {hotel.status || "active"}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {hotel.image_url ? (
                  <img
                    src={hotel.image_url}
                    alt="Hotel"
                    className="h-40 w-full object-cover rounded-md shadow-sm"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=No+Image")}
                  />
                ) : (
                  <div className="h-40 w-full bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                    No Image Available
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm pt-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span>Price: {hotel.price || "0"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>Rating: {hotel.rating || "4"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{hotel.city || "Dubai"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{hotel.phone || "Contact"}</span>
                  </div>
                </div>

                {/* ✅ Services Display */}
                {hotel.included_services && (
                   <div className="pt-2 border-t mt-2">
                      <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(hotel.included_services).map(([key, val]: any) => 
                          val === true || val === "true" ? (
                            <Badge key={key} variant="secondary" className="text-[10px] py-0">
                              {key.replace('_', ' ')}
                            </Badge>
                          ) : null
                        )}
                      </div>
                   </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}