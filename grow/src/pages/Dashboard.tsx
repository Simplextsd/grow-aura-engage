import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Package, Users, DollarSign, Plane, Sparkles, LogOut } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalPackages: 0,
    totalContacts: 0,
    totalRevenue: 0,
    bookingGrowth: "0",
    revenueGrowth: "0",
    packageGrowth: "0" // 🔹 Naya state for Package Percentage
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    const headers = { "Authorization": `Bearer ${token}` };
    try {
      // Fetching Bookings and Revenue
      const bookRes = await fetch("http://localhost:5000/api/bookings/all", { headers });
      const data = await bookRes.json();

      if (Array.isArray(data)) {
        const currentBookings = data.length; 
        const totalRev = data.reduce((sum, item) => sum + (parseFloat(item.totalAmount) || 0), 0);
        
        const previousMonthBookings = 5;
        const bGrowth = ((currentBookings - previousMonthBookings) / previousMonthBookings * 100).toFixed(0);

        const previousMonthRevenue = 1000; 
        const rGrowth = ((totalRev - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(0);

        setStats(prev => ({
          ...prev,
          totalBookings: currentBookings,
          totalRevenue: totalRev,
          bookingGrowth: `+${bGrowth}%`,
          revenueGrowth: `+${rGrowth}%`
        }));
      }

      // 🔹 Fetching Packages Count and Growth Calculation
      const packRes = await fetch("http://localhost:5000/api/packages/all", { headers });
      const packData = await packRes.json();
      if(Array.isArray(packData)) {
        const currentPackages = packData.length;
        const previousMonthPackages = 1; // फर्ज karein pichle mahine 1 tha
        const pGrowth = ((currentPackages - previousMonthPackages) / previousMonthPackages * 100).toFixed(0);

        setStats(prev => ({ 
          ...prev, 
          totalPackages: currentPackages,
          packageGrowth: `+${pGrowth}%` // Dynamic Package Percentage
        }));
      }

      setLoading(false);
    } catch (error) { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold mb-2">Sales Dashboard ✈️</h1>
          <p className="text-muted-foreground">Welcome! Let's get started</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-primary/50 text-primary"><Sparkles className="h-4 w-4" /> AI Assistant</Button>
          <Button variant="ghost" className="gap-2 text-destructive" onClick={() => { localStorage.clear(); navigate("/login"); }}><LogOut className="h-4 w-4" /> Logout</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 border border-orange-500/20 p-6 rounded-xl bg-orange-500/5">
        <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-background/50" onClick={() => navigate("/packages")}>
          <Package className="h-8 w-8 text-primary" />
          <div className="font-semibold">1. Create Packages</div>
          <div className="text-xs text-muted-foreground">Add your travel offerings</div>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-background/50" onClick={() => navigate("/contacts")}>
          <Users className="h-8 w-8 text-primary" />
          <div className="font-semibold">2. Add Customers</div>
          <div className="text-xs text-muted-foreground">Import your client list</div>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex flex-col items-start gap-2 bg-background/50" onClick={() => navigate("/bookings")}>
          <Calendar className="h-8 w-8 text-primary" />
          <div className="font-semibold">3. Start Booking</div>
          <div className="text-xs text-muted-foreground">Create your first reservation</div>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Bookings" value={stats.totalBookings} icon={Calendar} description={stats.bookingGrowth} changeType="positive" onClick={() => navigate("/bookings")} />
        
        {/* 🔹 Travel Packages Card ab Clickable hai aur Percentage dynamic hai */}
        <StatCard 
          title="Travel Packages" 
          value={stats.totalPackages} 
          icon={Package} 
          description={stats.packageGrowth} 
          changeType="positive" 
          onClick={() => navigate("/packages")} 
        />

        <StatCard title="Total Customers" value={stats.totalContacts} icon={Users} description="+0%" changeType="positive" onClick={() => navigate("/contacts")} />
        
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} description={stats.revenueGrowth} changeType="positive" />
      </div>
    </div>
  );
}