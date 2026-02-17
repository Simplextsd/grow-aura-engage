import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, DollarSign, FileText, Loader2, Calendar, User, 
  Info, Eye, AlertCircle, Briefcase, ChevronRight 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import CreateInvoiceDialog from "@/components/CreateInvoiceDialog";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BACKEND_URL = "http://localhost:5000";
export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_URL}/api/invoices`);
      // Backend mapping: result.data ya result.invoices dono handle kiye hain
      const data = response.data?.data || response.data?.invoices || response.data;
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      setInvoices([]);
      toast({
        title: "Connection Error",
        description: "Backend se rabta nahi ho pa raha.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || "";
    const colors: any = {
      draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      overdue: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return colors[s] || "bg-slate-800 text-slate-400";
  };

  const safeInvoices = Array.isArray(invoices) ? invoices : [];

  const totalRevenue = safeInvoices
    .filter((inv) => inv?.status?.toLowerCase() === "paid")
    .reduce((sum, inv) => sum + Number(inv?.total_amount || 0), 0);

  const pendingAmount = safeInvoices
    .filter((inv) => ["sent", "overdue", "draft"].includes(inv?.status?.toLowerCase()))
    .reduce((sum, inv) => sum + Number(inv?.total_amount || 0), 0);

  // Helper function to parse JSON safely for display
  const parseItems = (json: any) => {
    try {
      return typeof json === 'string' ? JSON.parse(json) : json;
    } catch { return null; }
  };

  if (loading && safeInvoices.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
        <p className="text-slate-400 animate-pulse font-medium">Synchronizing Invoices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-8 bg-[#020617] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight"></h1>
          <p className="text-sm text-slate-400">Manage bookings and generated invoices</p>
        </div>
        <div className="flex gap-2">
          <CreateInvoiceDialog
            onSuccess={fetchInvoices}
            trigger={
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" /> New Booking
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total Revenue", val: totalRevenue, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Pending Collection", val: pendingAmount, icon: Info, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Active Invoices", val: safeInvoices.length, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", isCount: true }
        ].map((s, i) => (
          <Card key={i} className="bg-slate-900/40 border-slate-800 shadow-md">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-2 ${s.bg} rounded-lg ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</p>
                <p className="text-2xl font-bold text-white">
                  {s.isCount ? s.val : `$${s.val.toLocaleString()}`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main List */}
      <Card className="bg-slate-900/20 border-slate-800 overflow-hidden backdrop-blur-md">
        <CardHeader className="py-4 px-6 border-b border-slate-800 bg-slate-900/40">
          <CardTitle className="text-sm font-semibold">Invoices & Linked Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-800">
            {safeInvoices.length === 0 ? (
              <div className="p-12 text-center text-slate-500"><p>No transactions found.</p></div>
            ) : (
              safeInvoices.map((invoice) => (
                <div
                  key={invoice?.id}
                  className="p-4 hover:bg-slate-800/30 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-orange-500 text-sm">{invoice?.invoice_number}</span>
                        <Badge variant="outline" className={`${getStatusColor(invoice?.status)} text-[9px] uppercase`}>
                          {invoice?.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-200">{invoice?.customer_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right mr-4">
                      <p className="text-lg font-bold text-white">${Number(invoice?.total_amount).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500 uppercase">Grand Total</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" variant="secondary" className="h-8 bg-slate-800 text-xs"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        <Eye className="h-3 w-3 mr-1" /> View
                      </Button>
                      <Button 
                        size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-xs"
                        onClick={() => navigate(`/bookings`)} // Link to your bookings page
                      >
                        <Briefcase className="h-3 w-3 mr-1" /> Booking
                      </Button>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-700" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-md rounded-xl shadow-2xl">
          <DialogHeader className="border-b border-slate-900 pb-4">
            <DialogTitle className="text-orange-500 flex items-center justify-between">
              <span className="flex items-center gap-2"><Info className="h-5 w-5" /> Invoice Details</span>
              <span className="text-slate-500 text-xs font-mono">{selectedInvoice?.invoice_number}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Customer</p>
                <p className="font-semibold">{selectedInvoice?.customer_name}</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Due Date</p>
                <p className="flex items-center gap-1 font-semibold italic">
                   {selectedInvoice?.due_date || 'Not set'}
                </p>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-orange-500/5 border border-orange-500/20 p-4 rounded-lg flex justify-between items-center">
               <div>
                  <p className="text-[10px] text-orange-500 uppercase font-bold">Outstanding Balance</p>
                  <p className="text-2xl font-black text-white">${Number(selectedInvoice?.balance_amount || 0).toLocaleString()}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Paid</p>
                  <p className="text-lg font-bold text-emerald-500">${Number(selectedInvoice?.paid_amount || 0).toLocaleString()}</p>
               </div>
            </div>

            {/* Booking Link Section */}
            <div className="pt-2">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 group"
                onClick={() => navigate(`/bookings`)}
              >
                <Briefcase className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" /> 
                Open Linked Booking File
              </Button>
              <p className="text-[9px] text-center text-slate-500 mt-2 italic">
                Booking ID: {selectedInvoice?.booking_id || "N/A"} • Created by Admin
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}