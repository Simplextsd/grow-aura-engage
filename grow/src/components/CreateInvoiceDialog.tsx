import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {  Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X } from "lucide-react";
import { useSearchParams } from "react-router-dom"; // URL se template lene ke liye

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function CreateInvoiceDialog({ trigger, onSuccess }: { trigger?: React.ReactNode; onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    customer_name: "", // 🔹 Ab ye dropdown nahi, simple string hai
    template_id: "",
    due_date: "",
    notes: "",
    tax_amount: 0,
    includes_atol: false,
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: 1, unit_price: 0, total_price: 0 }
  ]);

  // 🔹 Jab Dialog khule, to templates fetch karein aur URL check karein
  useEffect(() => {
    fetchTemplates();
    
    // Agar URL mein template ka naam hai (Templates page se aaya hai)
    const templateFromUrl = searchParams.get("template");
    const isNew = searchParams.get("new");
    
    if (isNew === "true") {
      setOpen(true);
      if (templateFromUrl) {
        setFormData(prev => ({ ...prev, template_id: templateFromUrl }));
      }
    }
  }, [open, searchParams]);

  const fetchTemplates = async () => {
    const professionalTemplates = [
      "Professional Blue", "Modern Dark", "Classic Corporate", "Minimalist Light",
      "Luxury Gold", "Emerald Tech", "Sunset Premium", "Slate Industrial",
      "Royal Purple", "Clean Service", "Agency Special", "Compact Grid",
      "Bold Crimson", "Midnight Pro", "Traveler Choice", "Eco Friendly",
      "Startup Vibrant", "Traditional White", "Neon Cyber", "Abstract Creative"
    ].map((name, index) => ({ id: name, name: name })); // ID ko naam ke barabar rakha hai navigation ke liye
    
    setTemplates(professionalTemplates);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "unit_price") {
      newItems[index].total_price = newItems[index].quantity * newItems[index].unit_price;
    }
    setItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
    const total = subtotal + formData.tax_amount;
    return { subtotal, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { subtotal, total } = calculateTotals();
      const invoiceNumber = `INV-${Date.now()}`;

      const invoicePayload = {
        invoice_number: invoiceNumber,
        status: "draft",
        total_amount: total,
        due_date: formData.due_date,
        notes: formData.notes,
        customer_name: formData.customer_name, // 🔹 ID ki jagah Name bhej rahe hain
        template_id: formData.template_id,
        tax_amount: formData.tax_amount,
        includes_atol: formData.includes_atol ? 1 : 0,
        items: items 
      };

      const response = await fetch("http://localhost:5000/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoicePayload),
      });

      if (!response.ok) throw new Error("MySQL Database error");

      toast({
        title: "Success",
        description: "Invoice saved successfully",
      });

      setOpen(false);
      onSuccess?.();
      
      // Reset Form
      setFormData({
        customer_name: "",
        template_id: "",
        due_date: "",
        notes: "",
        tax_amount: 0,
        includes_atol: false,
      });
      setItems([{ description: "", quantity: 1, unit_price: 0, total_price: 0 }]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="bg-orange-600 hover:bg-orange-700 text-white"><Plus className="h-4 w-4 mr-2" />New Invoice</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#020617] text-white border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold">Create New Invoice</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            
            {/* 🔹 Dropdown hatakar simple Input lagaya */}
            <div className="space-y-2">
              <Label className="text-slate-300">Customer Name</Label>
              <Input
                required
                placeholder="Enter customer name"
                className="bg-slate-900 border-slate-800 text-white focus:border-orange-500"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Template</Label>
              <Select value={formData.template_id} onValueChange={(value) => setFormData({ ...formData, template_id: value })}>
                <SelectTrigger className="bg-slate-900 border-slate-800 text-white">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-white">
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Due Date</Label>
              <Input
                type="date"
                required
                className="bg-slate-900 border-slate-800 text-white"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300"> Amount</Label>
              <Input
                type="number"
                step="0.01"
                className="bg-slate-900 border-slate-800 text-white"
                value={formData.tax_amount}
                onChange={(e) => setFormData({ ...formData, tax_amount: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          {/* Invoice Items Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-white">Invoice Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem} className="border-slate-700 hover:bg-slate-800 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border border-slate-800 rounded-lg bg-slate-900/50">
                <div className="col-span-5">
                  <Label className="text-xs text-slate-400">Description</Label>
                  <Input
                    className="bg-slate-900 border-slate-800 text-white"
                    placeholder="Item description"
                    required
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-slate-400">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    className="bg-slate-900 border-slate-800 text-white"
                    required
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-slate-400">Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    className="bg-slate-900 border-slate-800 text-white"
                    required
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, "unit_price", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-slate-400">Total</Label>
                  <Input
                    className="bg-slate-900 border-slate-800 text-orange-500 font-bold"
                    type="number"
                    value={item.total_price.toFixed(2)}
                    disabled
                  />
                </div>
                <div className="col-span-1">
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Notes</Label>
            <Textarea
              className="bg-slate-900 border-slate-800 text-white"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="atol"
              checked={formData.includes_atol}
              onChange={(e) => setFormData({ ...formData, includes_atol: e.target.checked })}
              className="rounded bg-slate-900 border-slate-800"
            />
            <Label htmlFor="atol" className="text-slate-300">Include ATOL Certificate</Label>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <div className="space-y-1">
              <div className="text-sm text-slate-400">Subtotal: ${subtotal.toFixed(2)}</div>
              <div className="text-sm text-slate-400">Tax: ${formData.tax_amount.toFixed(2)}</div>
              <div className="text-xl font-bold text-orange-500">Total: ${total.toFixed(2)}</div>
            </div>
            <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700 px-8 text-white">
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}