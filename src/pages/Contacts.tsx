import { useState, useEffect } from "react";
import { Search, Upload, Eye, Trash2, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateContactDialog } from "@/components/CreateContactDialog";

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  created_at: string;
}

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // ✅ PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/contacts");
      const data = await res.json();
      setContacts(data);
    } catch (err) {
      console.log("Error loading contacts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    await fetch(`http://localhost:5000/api/contacts/${id}`, {
      method: "DELETE",
    });

    fetchContacts();
  };

  /* ================= CSV UPLOAD ================= */

  const handleCSVUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/contacts/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          `CSV Uploaded Successfully ✅\nInserted: ${
            data.inserted || 0
          }\nSkipped: ${data.skipped || 0}`
        );
        fetchContacts();
      } else {
        alert("Upload Failed ❌");
      }
    } catch (err) {
      alert("Server Error ❌");
    }

    e.target.value = "";
  };

  /* ================= FILTER + SEARCH ================= */

  const filteredContacts = contacts
    .filter((c) =>
      `${c.first_name} ${c.last_name} ${c.phone} ${c.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((c) => (filterSource ? c.source === filterSource : true));

  /* ================= PAGINATION LOGIC ================= */

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;

  const currentRecords = filteredContacts.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  const totalPages = Math.ceil(filteredContacts.length / recordsPerPage);

  if (loading) return <div className="p-10 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <CreateContactDialog onContactCreated={fetchContacts} />
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-slate-900 border-slate-700"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <select
          className="bg-slate-900 border border-slate-700 px-3 py-2"
          onChange={(e) => {
            setFilterSource(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="webchat">Web Chat</option>
          <option value="manual">Manual</option>
          <option value="csv">CSV</option>
        </select>

        <label
          htmlFor="csvInput"
          className="flex items-center gap-2 cursor-pointer bg-slate-800 px-4 py-2 rounded"
        >
          <Upload className="h-4 w-4" />
          Upload CSV
        </label>

        <input
          id="csvInput"
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleCSVUpload}
        />
      </div>

      {/* Table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle>
            All Contacts ({filteredContacts.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentRecords.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {c.first_name} {c.last_name}
                  </TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>
                    <Badge className="bg-blue-600">{c.source}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        c.status === "active"
                          ? "bg-green-600"
                          : "bg-gray-600"
                      }
                    >
                      {c.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedContact(c)}
                    >
                      <Eye className="h-4 w-4 text-blue-400" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        window.open(
                          `https://wa.me/${c.phone.replace(/\D/g, "")}`,
                          "_blank"
                        )
                      }
                    >
                      <MessageCircle className="h-4 w-4 text-green-400" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(c.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>

              <span>
                Page {currentPage} of {totalPages}
              </span>

              <Button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {selectedContact && (
        <Dialog open={true} onOpenChange={() => setSelectedContact(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Contact Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {selectedContact.first_name}{" "}
                {selectedContact.last_name}
              </p>
              <p><strong>Phone:</strong> {selectedContact.phone}</p>
              <p><strong>Email:</strong> {selectedContact.email}</p>
              <p><strong>Source:</strong> {selectedContact.source}</p>
              <p><strong>Status:</strong> {selectedContact.status}</p>
              <p><strong>Created:</strong> {selectedContact.created_at}</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
