import { useState, useEffect } from "react";
import axios from "axios"; 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, FileText, Loader2, Calendar, User, Info, Eye } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import CreateInvoiceDialog from "@/components/CreateInvoiceDialog";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const API_URL = "http://localhost:5000/api/invoices";

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setInvoices(response.data || []);
    } catch (error: any) {
      console.error("Fetch Error:", error);
      toast({
        title: "Error",
        description: "Could not fetch invoices from MySQL server",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase();
    const colors: any = {
      draft: "bg-gray-500/10 text-gray-400 border-gray-500/20",
      sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      overdue: "bg-red-500/10 text-red-400 border-red-500/20",
    };
    return colors[s] || "bg-slate-800 text-slate-400";
  };

  // 🔹 REVENUE LOGIC: Sirf 'paid' status wali amount total hogi
  const totalRevenue = invoices
    .filter((inv) => inv.status?.toLowerCase() === "paid")
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  // 🔹 PENDING LOGIC: 'sent', 'overdue', 'draft' wali amount
  const pendingAmount = invoices
    .filter((inv) => ["sent", "overdue", "draft"].includes(inv.status?.toLowerCase()))
    .reduce((sum, inv) => sum + Number(inv.total_amount || 0), 0);

  if (loading && invoices.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] text-white">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
        <p className="text-slate-400 animate-pulse font-medium">Connecting to MySQL...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 md:p-8 bg-[#020617] min-h-screen text-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-slate-400 ">Tracking your business growth</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/invoice-templates")} 
            className="border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-white"
          >
            <FileText className="h-4 w-4 mr-2" /> Templates
          </Button>

          <CreateInvoiceDialog 
            onSuccess={fetchInvoices} 
            trigger={
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" /> New Invoice
              </Button>
            }
          />
        </div>
      </div>

      {/* 🔹 COMPACT DASHBOARD CARDS 🔹 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-900/40 border-slate-800 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pending Payments</p>
              <p className="text-2xl font-bold text-white">${pendingAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800 shadow-md">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Invoices Count</p>
              <p className="text-2xl font-bold text-white">{invoices.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice List Table */}
      <Card className="bg-slate-900/20 border-slate-800 overflow-hidden backdrop-blur-md">
        <CardHeader className="py-4 px-6 border-b border-slate-800 bg-slate-900/40">
          <CardTitle className="text-sm font-semibold">Transaction History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-800">
            {invoices.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No data found in MySQL.</div>
            ) : (
              invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  onClick={() => setSelectedInvoice(invoice)} 
                  className="p-5 hover:bg-slate-800/40 transition-colors cursor-pointer group flex items-center justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-orange-500 text-sm">{invoice.invoice_number}</span>
                      <Badge variant="outline" className={`${getStatusColor(invoice.status)} text-[10px] px-2 py-0`}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 font-medium">
                      <User className="h-3 w-3" /> {invoice.customer_name || "Guest"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">
                      ${Number(invoice.total_amount || 0).toLocaleString()}
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase mt-1 flex items-center justify-end gap-1">
                      Details <Eye className="h-3 w-3" />
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 🔹 DETAIL POPUP (DIALOG) 🔹 */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="bg-slate-950 border-slate-800 text-white max-w-sm rounded-xl">
          <DialogHeader className="border-b border-slate-900 pb-4">
            <DialogTitle className="text-orange-500 flex items-center gap-2">
              <Info className="h-5 w-5" /> Invoice Summary
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4 text-sm">
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">Customer</p>
                <p>{selectedInvoice?.customer_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">Invoice #</p>
                <p className="text-orange-400">{selectedInvoice?.invoice_number}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">Due Date</p>
                <p className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {selectedInvoice?.due_date || 'No Date'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black">Total</p>
                <p className="text-emerald-500 font-bold text-lg">${Number(selectedInvoice?.total_amount).toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-900">
              <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Items / Notes</p>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/50 p-2 rounded italic">
                {selectedInvoice?.notes || "No additional information provided."}
              </p>
            </div>
          </div>
          
          <Button onClick={() => setSelectedInvoice(null)} className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800">
            Close View
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}