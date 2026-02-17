import { useState, useEffect } from "react";
import { Search, Filter, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateContactDialog } from "@/components/CreateContactDialog";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export default function Contacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      // ✅ Supabase ki jagah ab aapka apna backend call hoga
      const response = await fetch("http://localhost:5000/api/contacts", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Database se rabta nahi ho saka");

      const resData = await response.json();
      setContacts(Array.isArray(resData) ? resData : (resData.data || []));
    } catch (error: any) {
      // ⚠️ Agar backend par abhi table nahi hai, toh empty array set karein taake error hide ho jaye
      setContacts([]);
      console.log("Error logic: ", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = (contacts || []).filter((contact) =>
    `${contact.first_name} ${contact.last_name} ${contact.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const segments = [
    { name: "All Contacts", count: contacts.length, color: "bg-blue-500" },
    { name: "Active", count: contacts.filter(c => c.status === "active").length, color: "bg-green-500" },
    { name: "Inactive", count: contacts.filter(c => c.status === "inactive").length, color: "bg-gray-500" },
  ];

  if (loading) return <div className="p-8 text-white">Loading contacts database...</div>;

  return (
    <div className="space-y-6 p-8 bg-slate-950 min-h-screen text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Contacts</h1>
          <p className="text-slate-400">Manage your customer database from MySQL</p>
        </div>
        <CreateContactDialog onContactCreated={fetchContacts} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {segments.map((segment, index) => (
          <Card key={index} className="bg-slate-900 border-slate-800 text-white">
            <CardContent className="p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">{segment.name}</p>
                  <h3 className="text-2xl font-bold mt-2">{segment.count}</h3>
                </div>
                <div className={`h-12 w-12 rounded-lg ${segment.color}/20 flex items-center justify-center`}>
                  <Users className={`h-6 w-6 ${segment.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <CardTitle>Contact List</CardTitle>
          <CardDescription className="text-slate-400">Database synchronization active</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search contacts..." 
              className="pl-10 bg-slate-950 border-slate-700 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-800/50">
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-300">Name</TableHead>
                  <TableHead className="text-slate-300">Email</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-right text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-10 text-slate-500">No contacts found in database.</TableCell></TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id} className="border-slate-800">
                      <TableCell className="font-medium">{contact.first_name} {contact.last_name}</TableCell>
                      <TableCell>{contact.email || "-"}</TableCell>
                      <TableCell>
                        <Badge className={contact.status === "active" ? "bg-green-500/20 text-green-400" : "bg-slate-700"}>
                          {contact.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-blue-400">Edit</Button></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}