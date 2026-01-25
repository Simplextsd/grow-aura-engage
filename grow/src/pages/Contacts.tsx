import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, Users, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
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

  const filteredContacts = contacts.filter((contact) =>
    `${contact.first_name} ${contact.last_name} ${contact.email} ${contact.phone}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const segments = [
    { name: "All Contacts", count: contacts.length, color: "bg-blue-500" },
    { name: "Active", count: contacts.filter(c => c.status === "active").length, color: "bg-green-500" },
    { name: "Inactive", count: contacts.filter(c => c.status === "inactive").length, color: "bg-gray-500" },
  ];

  if (loading) {
    return <div className="p-8">Loading contacts...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Contacts</h1>
          <p className="text-muted-foreground">Manage your customer database and segments</p>
        </div>
        <CreateContactDialog onContactCreated={fetchContacts} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {segments.map((segment, index) => (
          <Card key={index} className="shadow-card border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{segment.name}</p>
                  <h3 className="text-2xl font-bold mt-2">{segment.count}</h3>
                </div>
                <div className={`h-12 w-12 rounded-lg ${segment.color}/10 flex items-center justify-center`}>
                  <Users className={`h-6 w-6 ${segment.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contact List</CardTitle>
              <CardDescription>All your contacts in one place</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search contacts..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary hover:bg-secondary">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-secondary/50">
                    <TableCell className="font-medium">{contact.first_name} {contact.last_name}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.email || "-"}</TableCell>
                    <TableCell className="text-muted-foreground">{contact.phone || "-"}</TableCell>
                    <TableCell>
                      {contact.company ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {contact.company}
                        </Badge>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={contact.status === "active" 
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-gray-500/10 text-gray-500 border-gray-500/20"
                        }
                      >
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {contact.last_contacted_at 
                        ? format(new Date(contact.last_contacted_at), "MMM dd, yyyy")
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">View</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
