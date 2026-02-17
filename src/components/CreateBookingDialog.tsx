import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Plane,
  Hotel,
  Car,
  ReceiptText,
  Save,
  X,
  DollarSign,
  UploadCloud,
  Trash2,
  Users,
  Briefcase,
  CreditCard,
  RefreshCw,
} from "lucide-react";

type PassengerRow = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
};

type FlightRow = {
  date: string;
  airline: string;
  dep: string;
  arr: string;
  depT: string;
  arrT: string;
  ref: string;
  supplier: string;
  baggage: string;
};

type HotelRow = {
  name: string;
  meal: string;
  room: string;
  in: string;
  out: string;
  ref: string;
  supplier: string;
  price: string;
  guests: string;
};

type TransportRow = {
  date: string;
  vehicle: string;
  pickup: string;
  dropoff: string;
  contact: string;
  supplier: string;
  pax: string;
  cost: string;
};

type PnrApiResponse = {
  pnr: string;
  passengers?: Array<{
    firstName?: string;
    lastName?: string;
    dob?: string;
    gender?: string;
    phone?: string;
    email?: string;
  }>;
  flights?: Array<{
    date?: string;
    airline?: string;
    dep?: string;
    arr?: string;
    depT?: string;
    arrT?: string;
    baggage?: string;
    supplier?: string;
  }>;
};

export function CreateBookingDialog({
  trigger,
  onSuccess,
}: {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ LOCK LOGIC (Agent cannot change after save)
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingLocked, setBookingLocked] = useState(false);

  // ✅ PNR FETCH states
  const [pnrLoading, setPnrLoading] = useState(false);
  const [pnrError, setPnrError] = useState<string | null>(null);

  // ✅ Flight header booking reference (global)
  const [flightBookingRef, setFlightBookingRef] = useState("");

  // States for dynamic rows
  const [passengerRows, setPassengerRows] = useState<PassengerRow[]>(
    Array(4).fill({
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      dob: "",
      gender: "Male",
    })
  );

  const [flightRows, setFlightRows] = useState<FlightRow[]>(
    Array(4).fill({
      date: "",
      airline: "",
      dep: "",
      arr: "",
      depT: "",
      arrT: "",
      ref: "",
      supplier: "",
      baggage: "",
    })
  );

  const [hotelRows, setHotelRows] = useState<HotelRow[]>(
    Array(4).fill({
      name: "",
      meal: "",
      room: "",
      in: "",
      out: "",
      ref: "",
      supplier: "",
      price: "",
      guests: "",
    })
  );

  const [transportRows, setTransportRows] = useState<TransportRow[]>(
    Array(4).fill({
      date: "",
      vehicle: "",
      pickup: "",
      dropoff: "",
      contact: "",
      supplier: "",
      pax: "",
      cost: "",
    })
  );

  // ✅ UPDATED formData (Stripe + Currency logic added)
  const [formData, setFormData] = useState({
    customer_name: "",
    due_date: "",
    status: "sent",

    // ✅ NEW
    payment_method: "Stripe",
    currency: "USD",
    exchange_rate: 1.4, // Example
    total_selling_usd: 0,
    total_selling_cad: 0,
    payment_received: 0,
    generate_stripe_link: true,

    files: [] as File[],
    other_description: "",
    visa_required: false,
    ziarat_required: false,
  });

  // ✅ Automatic currency calculation
  useEffect(() => {
    const rate = Number(formData.exchange_rate) || 1;

    if (formData.currency === "USD") {
      const usd = Number(formData.total_selling_usd) || 0;
      const cad = usd * rate;
      if (Math.abs((Number(formData.total_selling_cad) || 0) - cad) > 0.0001) {
        setFormData((prev) => ({ ...prev, total_selling_cad: cad }));
      }
    } else {
      const cad = Number(formData.total_selling_cad) || 0;
      const usd = cad / rate;
      if (Math.abs((Number(formData.total_selling_usd) || 0) - usd) > 0.0001) {
        setFormData((prev) => ({ ...prev, total_selling_usd: usd }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.currency, formData.total_selling_usd, formData.total_selling_cad, formData.exchange_rate]);

  /**
   * ✅ ONLY FLIGHT: Header booking ref change
   * - flightBookingRef update
   * - only flightRows ke ref fill
   * - only empty refs fill (manual overwrite nahi hoga)
   */
  const handleHeaderFlightBookingRefChange = (value: string) => {
    if (bookingLocked) return;
    setFlightBookingRef(value);

    setFlightRows((prev) =>
      prev.map((r) => ({
        ...r,
        ref: r.ref?.trim() ? r.ref : value,
      }))
    );
  };

  // ✅ ONLY FLIGHT: user edits any single flight row ref
  const handleFlightRefChange = (index: number, value: string) => {
    if (bookingLocked) return;
    setFlightRows((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ref: value };
      return updated;
    });
  };

  const handleInputChange = (
    index: number,
    field: string,
    value: any,
    setter: any,
    rows: any[]
  ) => {
    if (bookingLocked) return;
    const updatedRows = [...rows];
    updatedRows[index] = { ...updatedRows[index], [field]: value };
    setter(updatedRows);
  };

  // ✅ Grand totals based on currency
  const grandTotal = formData.currency === "USD" ? formData.total_selling_usd : formData.total_selling_cad;
  const remaining = grandTotal - formData.payment_received;

  // ✅ utils for PNR mapping (keep 4 rows)
  const safe4 = <T,>(arr: T[] | undefined, fallback: T) => {
    const a = arr && arr.length ? arr : [];
    const out = [...a];
    while (out.length < 4) out.push(fallback);
    return out.slice(0, 4);
  };

  const applyPnrToForm = (data: PnrApiResponse) => {
    if (!data) return;

    const pnr = (data.pnr || flightBookingRef || "").trim();
    if (pnr) {
      setFlightBookingRef(pnr);
      setFlightRows((prev) =>
        prev.map((r) => ({
          ...r,
          ref: r.ref?.trim() ? r.ref : pnr,
        }))
      );
    }

    const mappedPassengers = safe4<PassengerRow>(
      data.passengers?.map((p) => ({
        firstName: p.firstName || "",
        lastName: p.lastName || "",
        phone: p.phone || "",
        email: p.email || "",
        dob: p.dob || "",
        gender: (p.gender as any) || "Male",
      })),
      { firstName: "", lastName: "", phone: "", email: "", dob: "", gender: "Male" }
    );

    const mappedFlights = safe4<FlightRow>(
      data.flights?.map((f) => ({
        date: f.date || "",
        airline: f.airline || "",
        dep: f.dep || "",
        arr: f.arr || "",
        depT: f.depT || "",
        arrT: f.arrT || "",
        ref: pnr || "",
        supplier: f.supplier || "",
        baggage: f.baggage || "",
      })),
      { date: "", airline: "", dep: "", arr: "", depT: "", arrT: "", ref: pnr || "", supplier: "", baggage: "" }
    );

    setPassengerRows(mappedPassengers);
    setFlightRows(mappedFlights);
  };

  // ✅ Fetch PNR button action (Flight Details section)
  const fetchPNR = async () => {
    if (bookingLocked) return;

    const pnr = flightBookingRef.trim();
    if (!pnr) {
      alert("Enter PNR / Booking Ref first!");
      return;
    }

    try {
      setPnrError(null);
      setPnrLoading(true);

      // ✅ CHANGE THIS endpoint according to your backend
      // Backend should return: { pnr, passengers:[], flights:[] }
      const res = await fetch(`http://localhost:5000/api/pnr/fetch?pnr=${encodeURIComponent(pnr)}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const json = await res.json();

      if (!res.ok) {
        setPnrError(json?.message || "PNR fetch failed");
        return;
      }

      applyPnrToForm(json);
    } catch (e) {
      setPnrError("Network/Server error while fetching PNR");
    } finally {
      setPnrLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.customer_name) {
        alert("Please enter Customer Name first!");
        return;
      }

      const invoiceData = {
        customer_name: formData.customer_name,
        total_amount: grandTotal,
        currency: formData.currency,
        paid_amount: formData.payment_received,
        balance_amount: remaining,
        status: formData.status,
        payment_method: formData.payment_method,
        generate_stripe_link: formData.generate_stripe_link,
        due_date: formData.due_date || null,

        // ✅ IMPORTANT: lock booking after save (agent cannot edit)
        locked: true,

        items_json: JSON.stringify({
          passengers: passengerRows,
          flights: flightRows,
          hotels: hotelRows,
          transport: transportRows,
          flight_booking_ref: flightBookingRef,
          other_services: {
            description: formData.other_description,
            visa: formData.visa_required,
            ziarat: formData.ziarat_required,
          },
        }),
      };

      const response = await fetch("http://localhost:5000/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ Success! Booking saved & locked.");

        // ✅ lock UI so agent cannot change after save
        setBookingId(result?.id || null);
        setBookingLocked(true);

        // ✅ Stripe URL if backend returns it
        if (result?.stripe_url) window.open(result.stripe_url, "_blank");
        else if (result?.id) window.open(`http://localhost:5000/api/bookings/download/${result.id}`, "_blank");

        if (onSuccess) onSuccess();
        // optional: close dialog
        // setOpen(false);
      } else {
        alert(result?.message || "❌ Save failed!");
      }
    } catch (err) {
      alert("❌ Backend API Error!");
    }
  };

  // ✅ addMoreRow: make it generic but keep flightBookingRef in flight rows
  const addMoreRow = (setter: any, type: "passenger" | "flight" | "hotel" | "transport") => {
    if (bookingLocked) return;

    if (type === "passenger") {
      setter((prev: PassengerRow[]) => [
        ...prev,
        { firstName: "", lastName: "", phone: "", email: "", dob: "", gender: "Male" },
      ]);
      return;
    }

    if (type === "flight") {
      setter((prev: FlightRow[]) => [
        ...prev,
        {
          date: "",
          airline: "",
          dep: "",
          arr: "",
          depT: "",
          arrT: "",
          ref: flightBookingRef || "",
          supplier: "",
          baggage: "",
        },
      ]);
      return;
    }

    if (type === "hotel") {
      setter((prev: HotelRow[]) => [
        ...prev,
        { name: "", meal: "", room: "", in: "", out: "", ref: "", supplier: "", price: "", guests: "" },
      ]);
      return;
    }

    if (type === "transport") {
      setter((prev: TransportRow[]) => [
        ...prev,
        { date: "", vehicle: "", pickup: "", dropoff: "", contact: "", supplier: "", pax: "", cost: "" },
      ]);
      return;
    }
  };

  const deleteRow = (index: number, setter: any) => {
    if (bookingLocked) return;
    setter((prev: any) => prev.filter((_: any, i: number) => i !== index));
  };

  const gridInputClass =
    "h-8 bg-slate-950 border-slate-800 text-[10px] rounded-none border-r focus-visible:ring-0 focus:border-orange-500 transition-all outline-none w-full px-2 text-white";
  const headerLabelClass =
    "text-[9px] font-bold text-slate-400 uppercase text-center py-1 border-r border-slate-700 last:border-0 flex items-center justify-center";

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          // when opening a fresh dialog, reset lock (optional)
          setBookingLocked(false);
          setBookingId(null);
          setPnrError(null);
          setPnrLoading(false);
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-orange-600 hover:bg-orange-700 font-bold">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-[98vw] lg:max-w-[1400px] h-[96vh] flex flex-col bg-[#020617] text-white border-slate-800 p-0 overflow-hidden rounded-2xl shadow-2xl [&>button]:hidden">
        <div className="flex-none px-6 py-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <DialogTitle className="text-xl font-black text-orange-500 flex items-center gap-2 tracking-tight uppercase">
            <ReceiptText className="h-6 w-6 text-white" /> TRAVEL ERP SYSTEM
          </DialogTitle>

          <div className="flex items-center gap-3">
            {bookingLocked && (
              <div className="text-[10px] font-black uppercase px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                Locked{bookingId ? ` • ID: ${bookingId}` : ""}
              </div>
            )}
            <X
              className="h-5 w-5 text-slate-500 cursor-pointer hover:text-white transition-colors"
              onClick={() => setOpen(false)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#020617] scrollbar-hide">
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-900/20 rounded-xl border border-slate-800">
            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500 font-bold uppercase">Customer Name</Label>
              <Input
                className="h-9 bg-slate-950 border-slate-800 text-xs focus:border-orange-500 focus-visible:ring-0"
                placeholder="Enter Client Name"
                value={formData.customer_name}
                disabled={bookingLocked}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500 font-bold uppercase">Due Date</Label>
              <Input
                type="date"
                className="h-9 bg-slate-950 border-slate-800 text-xs [color-scheme:dark] focus:border-orange-500 focus-visible:ring-0"
                value={formData.due_date}
                disabled={bookingLocked}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500 font-bold uppercase">Status</Label>
              <Select
                onValueChange={(v) => setFormData({ ...formData, status: v })}
                defaultValue="sent"
                disabled={bookingLocked}
              >
                <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-xs focus:ring-orange-500 focus:ring-offset-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 text-white border-slate-700">
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-slate-500 font-bold uppercase">Attachments</Label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => e.target.files && setFormData({ ...formData, files: Array.from(e.target.files) })}
                multiple
                disabled={bookingLocked}
              />
              <div
                onClick={() => !bookingLocked && fileInputRef.current?.click()}
                className={`h-9 border border-dashed border-slate-700 rounded bg-slate-950/50 flex items-center justify-center cursor-pointer transition-all ${
                  bookingLocked ? "opacity-50 cursor-not-allowed" : "hover:border-orange-500"
                }`}
              >
                <UploadCloud className="h-4 w-4 mr-2 text-orange-500" />
                <span className="text-[9px] text-slate-400">
                  {formData.files.length > 0 ? `${formData.files.length} Files` : "Upload Docs"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Passenger Details */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <h3 className="text-orange-400 font-black text-[12px] uppercase tracking-tighter flex items-center gap-2">
                  <Users size={16} /> Passenger Details
                </h3>
                <Button
                  onClick={() => addMoreRow(setPassengerRows, "passenger")}
                  size="sm"
                  disabled={bookingLocked}
                  className="h-7 bg-orange-600 hover:bg-orange-500 text-[10px] font-bold"
                >
                  + ADD ROW
                </Button>
              </div>

              <div className="rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-[1fr_1fr_1fr_1.2fr_0.8fr_0.8fr_40px] bg-slate-900 border-b border-slate-800">
                  <div className={headerLabelClass}>First Name</div>
                  <div className={headerLabelClass}>Last Name</div>
                  <div className={headerLabelClass}>Phone</div>
                  <div className={headerLabelClass}>Email</div>
                  <div className={headerLabelClass}>DOB</div>
                  <div className={headerLabelClass}>Gender</div>
                  <div className="bg-slate-900"></div>
                </div>

                {passengerRows.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_1fr_1.2fr_0.8fr_0.8fr_40px] border-b border-slate-800/50 last:border-0"
                  >
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.firstName}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "firstName", e.target.value, setPassengerRows, passengerRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.lastName}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "lastName", e.target.value, setPassengerRows, passengerRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.phone}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "phone", e.target.value, setPassengerRows, passengerRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.email}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "email", e.target.value, setPassengerRows, passengerRows)}
                    />
                    <Input
                      type="date"
                      className={gridInputClass + " [color-scheme:dark]"}
                      value={row.dob}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "dob", e.target.value, setPassengerRows, passengerRows)}
                    />
                    <select
                      className={gridInputClass + " bg-slate-950 text-white appearance-none cursor-pointer"}
                      value={row.gender}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "gender", e.target.value, setPassengerRows, passengerRows)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="flex items-center justify-center bg-slate-950 border-l border-slate-800">
                      <Trash2
                        size={13}
                        className={`text-slate-600 ${bookingLocked ? "opacity-40 cursor-not-allowed" : "hover:text-red-500 cursor-pointer"}`}
                        onClick={() => !bookingLocked && deleteRow(i, setPassengerRows)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flight */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <h3 className="text-blue-400 font-black text-[12px] uppercase tracking-tighter flex items-center gap-2">
                  <Plane size={16} /> Flight Details
                </h3>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-[9px] text-slate-500 font-bold uppercase whitespace-nowrap">Booking Ref</Label>
                    <Input
                      className="h-7 bg-slate-950 border-slate-800 text-[10px] focus:border-blue-500 focus-visible:ring-0 w-[220px]"
                      placeholder="e.g. ABC123 / PNR"
                      value={flightBookingRef}
                      disabled={bookingLocked}
                      onChange={(e) => handleHeaderFlightBookingRefChange(e.target.value)}
                    />
                  </div>

                  {/* ✅ FETCH PNR BUTTON */}
                  <Button
                    onClick={fetchPNR}
                    size="sm"
                    disabled={bookingLocked || pnrLoading}
                    className="h-7 bg-cyan-600 hover:bg-cyan-500 text-[10px] font-bold"
                  >
                    {pnrLoading ? "FETCHING..." : "FETCH PNR"}
                  </Button>

                  <Button
                    onClick={() => addMoreRow(setFlightRows, "flight")}
                    size="sm"
                    disabled={bookingLocked}
                    className="h-7 bg-blue-600 hover:bg-blue-500 text-[10px] font-bold"
                  >
                    + ADD ROW
                  </Button>
                </div>
              </div>

              {pnrError && <div className="text-[10px] text-red-400 pl-1">{pnrError}</div>}

              <div className="rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.7fr_0.7fr_1fr_1fr_0.7fr_40px] bg-slate-900 border-b border-slate-800">
                  <div className={headerLabelClass}>Date</div>
                  <div className={headerLabelClass}>Airline</div>
                  <div className={headerLabelClass}>Dep</div>
                  <div className={headerLabelClass}>Arr</div>
                  <div className={headerLabelClass}>Dep T</div>
                  <div className={headerLabelClass}>Arr T</div>
                  <div className={headerLabelClass}>Ref #</div>
                  <div className={headerLabelClass}>Supplier</div>
                  <div className={headerLabelClass}>Baggage</div>
                  <div className="bg-slate-900"></div>
                </div>

                {flightRows.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_0.8fr_0.8fr_0.7fr_0.7fr_1fr_1fr_0.7fr_40px] border-b border-slate-800/50 last:border-0"
                  >
                    <Input
                      type="date"
                      className={gridInputClass + " [color-scheme:dark]"}
                      value={row.date}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "date", e.target.value, setFlightRows, flightRows)}
                    />
                    <Input
                      placeholder="Airline Name"
                      className={gridInputClass}
                      value={row.airline}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "airline", e.target.value, setFlightRows, flightRows)}
                    />
                    <Input
                      placeholder="LHE"
                      className={gridInputClass}
                      value={row.dep}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "dep", e.target.value, setFlightRows, flightRows)}
                    />
                    <Input
                      placeholder="DXB"
                      className={gridInputClass}
                      value={row.arr}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "arr", e.target.value, setFlightRows, flightRows)}
                    />
                    <Input
                      type="time"
                      className={gridInputClass + " [color-scheme:dark] px-1"}
                      value={row.depT}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "depT", e.target.value, setFlightRows, flightRows)}
                    />
                    <Input
                      type="time"
                      className={gridInputClass + " [color-scheme:dark] px-1"}
                      value={row.arrT}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "arrT", e.target.value, setFlightRows, flightRows)}
                    />
                    <Input
                      placeholder="Enter Ref"
                      value={row.ref}
                      className={gridInputClass}
                      disabled={bookingLocked}
                      onChange={(e) => handleFlightRefChange(i, e.target.value)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.supplier}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "supplier", e.target.value, setFlightRows, flightRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass + " border-r-0"}
                      value={row.baggage}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "baggage", e.target.value, setFlightRows, flightRows)}
                    />
                    <div className="flex items-center justify-center bg-slate-950 border-l border-slate-800">
                      <Trash2
                        size={13}
                        className={`text-slate-600 ${bookingLocked ? "opacity-40 cursor-not-allowed" : "hover:text-red-500 cursor-pointer"}`}
                        onClick={() => !bookingLocked && deleteRow(i, setFlightRows)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <h3 className="text-emerald-400 font-black text-[12px] uppercase tracking-tighter flex items-center gap-2">
                  <Hotel size={16} /> Accommodation
                </h3>
                <Button
                  onClick={() => addMoreRow(setHotelRows, "hotel")}
                  size="sm"
                  disabled={bookingLocked}
                  className="h-7 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-bold"
                >
                  + ADD ROW
                </Button>
              </div>

              <div className="rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_0.8fr_0.7fr_40px] bg-slate-900 border-b border-slate-800">
                  <div className={headerLabelClass}>Hotel Name</div>
                  <div className={headerLabelClass}>Meal</div>
                  <div className={headerLabelClass}>Room</div>
                  <div className={headerLabelClass}>In</div>
                  <div className={headerLabelClass}>Out</div>
                  <div className={headerLabelClass}>Ref #</div>
                  <div className={headerLabelClass}>Supplier</div>
                  <div className={headerLabelClass}>Price</div>
                  <div className={headerLabelClass}>Guests</div>
                  <div className="bg-slate-900"></div>
                </div>

                {hotelRows.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_1fr_0.8fr_0.7fr_40px] border-b border-slate-800/50 last:border-0"
                  >
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.name}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "name", e.target.value, setHotelRows, hotelRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.meal}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "meal", e.target.value, setHotelRows, hotelRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.room}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "room", e.target.value, setHotelRows, hotelRows)}
                    />
                    <Input
                      type="date"
                      className={gridInputClass + " [color-scheme:dark]"}
                      value={row.in}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "in", e.target.value, setHotelRows, hotelRows)}
                    />
                    <Input
                      type="date"
                      className={gridInputClass + " [color-scheme:dark]"}
                      value={row.out}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "out", e.target.value, setHotelRows, hotelRows)}
                    />
                    <Input placeholder="Auto Ref" value={row.ref || ""} className={gridInputClass} readOnly />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.supplier}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "supplier", e.target.value, setHotelRows, hotelRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.price}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "price", e.target.value, setHotelRows, hotelRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass + " border-r-0"}
                      value={row.guests}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "guests", e.target.value, setHotelRows, hotelRows)}
                    />
                    <div className="flex items-center justify-center bg-slate-950 border-l border-slate-800">
                      <Trash2
                        size={13}
                        className={`text-slate-600 ${bookingLocked ? "opacity-40 cursor-not-allowed" : "hover:text-red-500 cursor-pointer"}`}
                        onClick={() => !bookingLocked && deleteRow(i, setHotelRows)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transport */}
            <div className="space-y-2">
              <div className="flex justify-between items-center pl-1">
                <h3 className="text-purple-400 font-black text-[12px] uppercase tracking-tighter flex items-center gap-2">
                  <Car size={16} /> Transport
                </h3>
                <Button
                  onClick={() => addMoreRow(setTransportRows, "transport")}
                  size="sm"
                  disabled={bookingLocked}
                  className="h-7 bg-purple-600 hover:bg-purple-500 text-[10px] font-bold"
                >
                  + ADD ROW
                </Button>
              </div>

              <div className="rounded-lg border border-slate-800 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-[1fr_1fr_1.2fr_1.2fr_1fr_1fr_0.5fr_0.8fr_40px] bg-slate-900 border-b border-slate-800">
                  <div className={headerLabelClass}>Date</div>
                  <div className={headerLabelClass}>Vehicle</div>
                  <div className={headerLabelClass}>Pickup</div>
                  <div className={headerLabelClass}>Dropoff</div>
                  <div className={headerLabelClass}>Contact</div>
                  <div className={headerLabelClass}>Supplier</div>
                  <div className={headerLabelClass}>Pax</div>
                  <div className={headerLabelClass}>Cost</div>
                  <div className="bg-slate-900"></div>
                </div>

                {transportRows.map((row, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_1fr_1.2fr_1.2fr_1fr_1fr_0.5fr_0.8fr_40px] border-b border-slate-800/50 last:border-0"
                  >
                    <Input
                      type="date"
                      className={gridInputClass + " [color-scheme:dark]"}
                      value={row.date}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "date", e.target.value, setTransportRows, transportRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.vehicle}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "vehicle", e.target.value, setTransportRows, transportRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.pickup}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "pickup", e.target.value, setTransportRows, transportRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.dropoff}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "dropoff", e.target.value, setTransportRows, transportRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.contact}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "contact", e.target.value, setTransportRows, transportRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.supplier}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "supplier", e.target.value, setTransportRows, transportRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass}
                      value={row.pax}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "pax", e.target.value, setTransportRows, transportRows)}
                    />
                    <Input
                      placeholder="..."
                      className={gridInputClass + " border-r-0"}
                      value={row.cost}
                      disabled={bookingLocked}
                      onChange={(e) => handleInputChange(i, "cost", e.target.value, setTransportRows, transportRows)}
                    />
                    <div className="flex items-center justify-center bg-slate-950 border-l border-slate-800">
                      <Trash2
                        size={13}
                        className={`text-slate-600 ${bookingLocked ? "opacity-40 cursor-not-allowed" : "hover:text-red-500 cursor-pointer"}`}
                        onClick={() => !bookingLocked && deleteRow(i, setTransportRows)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* OTHER SERVICES SECTION */}
          <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
            <h3 className="text-yellow-500 font-black text-[11px] uppercase flex items-center gap-2">
              <Briefcase size={14} /> Other Services (Visa/Ziarat)
            </h3>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8">
                <Label className="text-[9px] text-slate-500 uppercase font-bold">Description (Other Options)</Label>
                <Textarea
                  value={formData.other_description}
                  disabled={bookingLocked}
                  onChange={(e) => setFormData({ ...formData, other_description: e.target.value })}
                  placeholder="Enter details for other services..."
                  className="h-20 bg-slate-950 border-slate-800 text-xs text-white"
                />
              </div>
              <div className="col-span-4 flex flex-col justify-center gap-4 pl-4 border-l border-slate-800">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="visa"
                    checked={formData.visa_required}
                    disabled={bookingLocked}
                    onCheckedChange={(v) => setFormData({ ...formData, visa_required: !!v })}
                    className="border-slate-600"
                  />
                  <label htmlFor="visa" className="text-xs font-bold text-slate-300 cursor-pointer">
                    VISA REQUIRED
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ziarat"
                    checked={formData.ziarat_required}
                    disabled={bookingLocked}
                    onCheckedChange={(v) => setFormData({ ...formData, ziarat_required: !!v })}
                    className="border-slate-600"
                  />
                  <label htmlFor="ziarat" className="text-xs font-bold text-slate-300 cursor-pointer">
                    ZIARAT INCLUDED
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* FINANCIAL SUMMARY */}
          <div className="grid grid-cols-12 gap-5 pt-4 border-t border-slate-800/50">
            <div className="col-span-4 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-4 shadow-xl border-l-4 border-l-orange-500">
              <div className="flex items-center gap-2 text-orange-500 font-bold text-[11px] uppercase tracking-widest">
                <CreditCard size={14} /> Payment & Currency
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[9px] text-slate-500 uppercase font-bold">Currency</Label>
                  <Select
                    value={formData.currency}
                    disabled={bookingLocked}
                    onValueChange={(v) => setFormData({ ...formData, currency: v })}
                  >
                    <SelectTrigger className="h-9 bg-slate-950 border-slate-800 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 text-white border-slate-700">
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] text-slate-500 uppercase font-bold">Stripe Link</Label>
                  <div className="flex items-center h-9 gap-2 pl-2 bg-slate-950 rounded border border-slate-800">
                    <Checkbox
                      checked={formData.generate_stripe_link}
                      disabled={bookingLocked}
                      onCheckedChange={(v) => setFormData({ ...formData, generate_stripe_link: !!v })}
                    />
                    <span className="text-[10px] font-bold text-slate-400">AUTO GEN</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] text-slate-500 uppercase font-bold">Exchange Rate</Label>
                <Input
                  type="number"
                  step="0.0001"
                  className="h-9 bg-slate-950 border-slate-800 text-xs text-white"
                  value={formData.exchange_rate}
                  disabled={bookingLocked}
                  onChange={(e) => setFormData({ ...formData, exchange_rate: parseFloat(e.target.value) || 1 })}
                  placeholder="e.g. 1.40"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] text-slate-500 uppercase font-bold">Selling Price ({formData.currency})</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-orange-500" />
                  <Input
                    type="number"
                    className="h-9 pl-8 bg-slate-950 border-slate-800 text-sm font-bold text-white"
                    value={formData.currency === "USD" ? formData.total_selling_usd : formData.total_selling_cad}
                    disabled={bookingLocked}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      if (formData.currency === "USD") setFormData({ ...formData, total_selling_usd: val });
                      else setFormData({ ...formData, total_selling_cad: val });
                    }}
                  />
                </div>

                <div className="flex items-center gap-2 mt-1 text-[9px] text-slate-500 italic">
                  <RefreshCw size={10} />
                  Converted:{" "}
                  {formData.currency === "USD"
                    ? `${(formData.total_selling_cad || 0).toFixed(2)} CAD`
                    : `${(formData.total_selling_usd || 0).toFixed(2)} USD`}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[9px] text-slate-500 uppercase font-bold">Received Amount</Label>
                <Input
                  type="number"
                  className="h-9 bg-slate-950 border-emerald-500/30 text-emerald-400 font-bold"
                  value={formData.payment_received}
                  disabled={bookingLocked}
                  onChange={(e) => setFormData({ ...formData, payment_received: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="col-span-5 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-around shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <CreditCard size={80} />
              </div>

              <div className="text-center">
                <span className="text-[10px] text-slate-500 uppercase font-black block mb-1">
                  Grand Total ({formData.currency})
                </span>
                <span className="text-4xl font-black text-white tracking-tighter">
                  {formData.currency === "USD" ? "$" : "C$"}
                  {grandTotal.toLocaleString()}
                </span>
              </div>

              <div className="h-12 w-[1px] bg-slate-800"></div>

              <div className="text-center">
                <span className="text-[10px] text-red-500/70 uppercase font-black block mb-1">Balance Due</span>
                <span className="text-4xl font-black text-red-500 tracking-tighter">
                  {formData.currency === "USD" ? "$" : "C$"}
                  {remaining.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="col-span-3 p-5 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl">
              <Label className="text-[9px] text-slate-500 uppercase font-bold mb-2 block">Internal Agency Notes</Label>
              <Textarea
                placeholder="Booking notes..."
                disabled={bookingLocked}
                className="h-[74px] bg-slate-950 border-slate-800 text-[10px] resize-none text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex-none p-4 bg-slate-950 border-t border-slate-800 flex justify-end items-center gap-6 px-10">
          <button
            onClick={() => setOpen(false)}
            className="text-slate-500 hover:text-white uppercase text-[10px] font-bold transition-colors"
          >
            Close
          </button>

          <Button
            onClick={handleSubmit}
            disabled={bookingLocked}
            className="bg-orange-600 hover:bg-orange-700 h-11 px-10 font-black text-xs uppercase tracking-widest shadow-2xl transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" /> Save & Lock{" "}
            {formData.generate_stripe_link ? "Stripe Link" : "Invoice"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
