import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Image as ImageIcon, Layout } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const SYSTEM_TEMPLATES = [
  "Professional Blue", "Modern Dark", "Classic Corporate", "Minimalist Light",
  "Luxury Gold", "Emerald Tech", "Sunset Premium", "Slate Industrial",
  "Royal Purple", "Clean Service", "Agency Special", "Compact Grid",
  "Bold Crimson", "Midnight Pro", "Traveler Choice", "Eco Friendly",
  "Startup Vibrant", "Traditional White", "Neon Cyber", "Abstract Creative"
];

export default function InvoiceTemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    company_details: "",
    terms_and_conditions: "",
    payment_terms: "",
    bank_details: "",
    footer_text: "",
    atol_certificate_number: "",
    atol_holder_name: "",
    atol_expiry_date: "",
    include_atol: false,
    is_default: false,
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("invoice_templates")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
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

  const handleLogoUpload = async (file: File): Promise<string | null> => {
    try {
      setUploadingLogo(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("invoices")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Error uploading logo",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let logoUrl = editingTemplate?.company_logo_url || "";

      if (logoFile) {
        const uploadedUrl = await handleLogoUpload(logoFile);
        if (uploadedUrl) logoUrl = uploadedUrl;
      }

      const templateData = {
        ...formData,
        user_id: user.id,
        company_logo_url: logoUrl,
        template_html: `<div>Invoice Template HTML</div>`,
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from("invoice_templates")
          .update(templateData)
          .eq("id", editingTemplate.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("invoice_templates")
          .insert(templateData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Template ${editingTemplate ? "updated" : "created"} successfully`,
      });

      setDialogOpen(false);
      resetForm();
      fetchTemplates();
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

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      company_details: template.company_details || "",
      terms_and_conditions: template.terms_and_conditions || "",
      payment_terms: template.payment_terms || "",
      bank_details: template.bank_details || "",
      footer_text: template.footer_text || "",
      atol_certificate_number: template.atol_certificate_number || "",
      atol_holder_name: template.atol_holder_name || "",
      atol_expiry_date: template.atol_expiry_date || "",
      include_atol: template.include_atol || false,
      is_default: template.is_default || false,
    });
    setLogoPreview(template.company_logo_url || "");
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const { error } = await supabase
        .from("invoice_templates")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      fetchTemplates();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      description: "",
      company_details: "",
      terms_and_conditions: "",
      payment_terms: "",
      bank_details: "",
      footer_text: "",
      atol_certificate_number: "",
      atol_holder_name: "",
      atol_expiry_date: "",
      include_atol: false,
      is_default: false,
    });
    setLogoFile(null);
    setLogoPreview("");
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleUseTemplate = (templateName: string) => {

    navigate(`/invoices?new=true&template=${encodeURIComponent(templateName)}`);
  };

  if (loading) {
    return <div className="p-8">Loading templates...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Invoice Templates</h1>
          <p className="text-muted-foreground">Manage professional and custom templates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTemplate ? "Edit" : "Create"} Invoice Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name </Label>
                  <Input
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Professional Invoice"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Template description"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    disabled={uploadingLogo}
                  />
                  {logoPreview && (
                    <img src={logoPreview} alt="Logo preview" className="h-16 w-16 object-contain border rounded" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company Details</Label>
                <Textarea
                  value={formData.company_details}
                  onChange={(e) => setFormData({ ...formData, company_details: e.target.value })}
                  placeholder="Company name, address, contact info..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Textarea
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    placeholder="Payment due within 30 days..."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bank Details</Label>
                  <Textarea
                    value={formData.bank_details}
                    onChange={(e) => setFormData({ ...formData, bank_details: e.target.value })}
                    placeholder="Account number, sort code..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={formData.terms_and_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                  placeholder="Terms and conditions..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Footer Text</Label>
                <Input
                  value={formData.footer_text}
                  onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                  placeholder="Thank you for your business"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="include_atol"
                  checked={formData.include_atol}
                  onChange={(e) => setFormData({ ...formData, include_atol: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="include_atol">Include ATOL Protection</Label>
              </div>

              {formData.include_atol && (
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>ATOL Number</Label>
                    <Input
                      value={formData.atol_certificate_number}
                      onChange={(e) => setFormData({ ...formData, atol_certificate_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Holder Name</Label>
                    <Input
                      value={formData.atol_holder_name}
                      onChange={(e) => setFormData({ ...formData, atol_holder_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      type="date"
                      value={formData.atol_expiry_date}
                      onChange={(e) => setFormData({ ...formData, atol_expiry_date: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_default">Set as default template</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || uploadingLogo} className="bg-orange-600 hover:bg-orange-700">
                  {loading ? "Saving..." : editingTemplate ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SYSTEM_TEMPLATES.map((name, index) => (
          <Card key={`system-${index}`} className="border-border/50 bg-slate-900/50 hover:border-orange-500 transition-colors cursor-pointer" onClick={() => handleUseTemplate(name)}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {name}
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">System</Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Professional pre-designed layout</p>
                </div>
                <Layout className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  className="w-full text-xs bg-orange-600/10 text-orange-500 border border-orange-600/20 hover:bg-orange-600 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUseTemplate(name);
                  }}
                >
                  Use This Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}


        {templates.map((template) => (
          <Card key={template.id} className="shadow-card border-orange-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2 text-orange-500">
                    {template.name}
                    {template.is_default && (
                      <Badge className="text-xs bg-orange-600">Default</Badge>
                    )}
                  </CardTitle>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  )}
                </div>
                {template.company_logo_url ? (
                  <img src={template.company_logo_url} className="h-8 w-8 object-contain rounded" alt="logo" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(template)} className="flex-1">
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(template.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={() => handleUseTemplate(template.name)}
                  >
                    Use
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}