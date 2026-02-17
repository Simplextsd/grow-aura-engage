import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Briefcase, 
  ArrowUpRight,
  RefreshCcw
} from "lucide-react";
import { CreateBookingDialog } from "@/components/CreateBookingDialog";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from "recharts";

const Bookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // ✅ FIX 1: Sirf /api/bookings use karein (404 se bachne ke liye)
      const response = await fetch("http://localhost:5000/api/bookings", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Server response error");

      const result = await response.json();
      
      // ✅ FIX 2: Backend 'result.data' mein array bhej raha hai
      if (result.success && Array.isArray(result.data)) {
        setBookings(result.data);
      } else {
        setBookings([]);
      }
    } catch (error: any) {
      console.error("Fetch Error:", error);
      toast({
        title: "Sync Error",
        description: "Dashboard data load nahi ho saka.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Professional Data Processing
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);
  
  // ✅ FIX 3: Travelers count karne ke liye items_json ko parse karein
  const totalTravelers = bookings.reduce((sum, b) => {
    try {
      const items = typeof b.items_json === 'string' ? JSON.parse(b.items_json) : (b.items_json || {});
      const count = Array.isArray(items.passengers) ? items.passengers.length : 1;
      return sum + count;
    } catch {
      return sum + 1;
    }
  }, 0);

  // ✅ FIX 4: Chart Data mapping
  const chartData = bookings.length > 0 ? bookings.map((b) => {
    let tCount = 1;
    try {
      const items = typeof b.items_json === 'string' ? JSON.parse(b.items_json) : (b.items_json || {});
      tCount = Array.isArray(items.passengers) ? items.passengers.length : 1;
    } catch(e) { tCount = 1; }

    return {
      name: b.customerName?.split(' ')[0] || "Client",
      amount: Number(b.totalAmount || 0),
      travelers: tCount,
    };
  }).slice(-8) : [
    { name: 'N/A', amount: 0, travelers: 0 }
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="p-8 space-y-8 text-slate-100 bg-[#020617] min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Business Intelligence
          </h1>
          <p className="text-slate-400 mt-1">Real-time booking insights and revenue tracking</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchBookings}
            className="p-2 rounded-md border border-slate-700 hover:bg-slate-800 transition-colors"
          >
            <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <CreateBookingDialog onSuccess={fetchBookings} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10" },
          { title: "Total Bookings", value: bookings.length, icon: Briefcase, color: "text-blue-400", bg: "bg-blue-400/10" },
          { title: "Total Travelers", value: totalTravelers, icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
          { title: "Avg. Deal Size", value: `$${bookings.length ? Math.round(totalRevenue/bookings.length) : 0}`, icon: ArrowUpRight, color: "text-orange-400", bg: "bg-orange-400/10" }
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-slate-400">{stat.title}</p>
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="text-3xl font-bold mt-2">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Graphics Section */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-slate-900/40 border-slate-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="text-emerald-400" size={20} /> Revenue Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} dot={{r: 4, fill: '#10b981'}} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="text-blue-400" size={20} /> Booking Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                <Bar dataKey="travelers" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Bookings;