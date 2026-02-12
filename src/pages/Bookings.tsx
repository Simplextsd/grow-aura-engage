import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Users, Info, UserCheck, Eye, Calendar, DollarSign, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { CreateBookingDialog } from "@/components/CreateBookingDialog";
import { EditBookingDialog } from "@/components/EditBookingDialog";

const Bookings = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // 🔹 NEW: Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10; // Aik waqt mein 10 show honge

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/bookings/all", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch bookings");

      const data = await response.json();
      setBookings(data || []);
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

  const filteredBookings = bookings.filter((booking) =>
    booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.agentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.packageId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔢 NEW: Pagination Logic
  const lastIndex = currentPage * recordsPerPage;
  const firstIndex = lastIndex - recordsPerPage;
  const currentRecords = filteredBookings.slice(firstIndex, lastIndex);
  const totalPages = Math.ceil(filteredBookings.length / recordsPerPage);

  if (loading) {
    return <div className="p-8 text-white">Loading bookings</div>;
  }

  return (
    <div className="p-8 space-y-6 text-white bg-slate-950 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage your travel bookings</p>
        </div>
      <CreateBookingDialog onSuccess={fetchBookings} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer or agent..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-slate-950 border-slate-700"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              {/* Yahan <tr> ki jagah <TableRow> use karein */}
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400">Agent</TableHead>
                <TableHead className="text-slate-400">Client Name</TableHead>
                <TableHead className="text-slate-400">Client ID</TableHead>
                <TableHead className="text-slate-400">Package</TableHead>
                <TableHead className="text-slate-400">Travel Date</TableHead>
                <TableHead className="text-slate-400">Travelers</TableHead>
                <TableHead className="text-slate-400">Amount</TableHead>
                <TableHead className="text-slate-400 text-right">Actions</TableHead>
              </TableRow> {/* Yahan pehle </tr> tha, isay update kar dein */}
            </TableHeader>
            <TableBody>
              {currentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground border-slate-800">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                currentRecords.map((booking) => (
                  <TableRow key={booking.id} className="border-slate-800">
                    <TableCell>
                      <div className="flex items-center gap-1 text-purple-400 font-medium">
                        <UserCheck className="h-3 w-3" />
                        {booking.agentName || "Aqeel"}
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">{booking.customerName || "N/A"}</TableCell>
                    <TableCell className="font-mono font-bold text-orange-500">#{booking.id}</TableCell>
                    <TableCell className="capitalize">{booking.packageId || booking.package || "Custom"}</TableCell>
                    <TableCell>{booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : "N/A"}</TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {booking.numberOfTravelers || booking.travelers || 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-emerald-400">${Number(booking.totalAmount || 0).toLocaleString()}</TableCell>

                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="text-xl font-bold flex items-center gap-2 border-b border-slate-800 pb-2">
                                <Info className="h-5 w-5 text-blue-400" /> Booking Details
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                                <span className="text-slate-400 text-sm">Booking ID:</span>
                                <span className="font-mono font-bold text-orange-500">#{booking.id}</span>
                              </div>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Client Name:</span>
                                  <span className="font-medium">{booking.customerName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Agent:</span>
                                  <span className="text-purple-400 font-medium">{booking.agentName || "Aqeel"}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Package:</span>
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <Package className="h-3 w-3" /> {booking.packageId || "Custom"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Travel Date:</span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {booking.travelDate ? new Date(booking.travelDate).toLocaleDateString() : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-slate-400">Total Travelers:</span>
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" /> {booking.numberOfTravelers || 1}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                                  <span className="text-slate-400 font-bold">Total Paid:</span>
                                  <span className="text-xl font-bold text-emerald-400">
                                    ${Number(booking.totalAmount || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <EditBookingDialog
                          booking={booking}
                          onBookingUpdated={fetchBookings}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* 🔢 NEW: Pagination Controls UI */}
          <div className="flex items-center justify-between px-2 py-4 border-t border-slate-800 mt-4">
            <div className="text-sm text-slate-400">
              Showing <span className="text-white font-medium">{firstIndex + 1}</span> to <span className="text-white font-medium">{Math.min(lastIndex, filteredBookings.length)}</span> of <span className="text-white font-medium">{filteredBookings.length}</span> entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-white disabled:opacity-50"
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>

              <div className="flex items-center gap-1 px-2">
                <span className="text-sm text-slate-400 text-center min-w-[80px]">
                  Page {currentPage} of {totalPages || 1}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="bg-slate-900 border-slate-700 hover:bg-slate-800 text-white disabled:opacity-50"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        

        </CardContent>
      </Card>
    </div>
  );
};

export default Bookings;