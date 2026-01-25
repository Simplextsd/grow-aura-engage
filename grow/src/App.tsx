import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Messages from "./pages/Messages";
import Campaigns from "./pages/Campaigns";
import Contacts from "./pages/Contacts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
// import Pipeline from "./pages/Pipeline";
// import Hotels from "./pages/Hotels";
import Calendar from "./pages/Calendar";
import Workflows from "./pages/Workflows";
import Reputation from "./pages/Reputation";
import Invoices from "./pages/Invoices";
import InvoiceTemplates from "./pages/InvoiceTemplates";
import Courses from "./pages/Courses";
import Calls from "./pages/Calls";
import Bookings from "./pages/Bookings";
import Packages from "./pages/Packages";
import Itineraries from "./pages/Itineraries";
import AIAssistant from "./pages/AIAssistant";
import Segments from "./pages/Segments";
import LeadForms from "./pages/LeadForms";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><Layout><Contacts /></Layout></ProtectedRoute>} />
          {/* <Route path="/pipeline" element={<ProtectedRoute><Layout><Pipeline /></Layout></ProtectedRoute>} /> */}
          {/* <Route path="/Hotels" element={<ProtectedRoute><Layout><Hotels /></Layout></ProtectedRoute>} /> */}
          <Route path="/calendar" element={<ProtectedRoute><Layout><Calendar /></Layout></ProtectedRoute>} />
          <Route path="/campaigns" element={<ProtectedRoute><Layout><Campaigns /></Layout></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
          <Route path="/segments" element={<ProtectedRoute><Layout><Segments /></Layout></ProtectedRoute>} />
          <Route path="/lead-forms" element={<ProtectedRoute><Layout><LeadForms /></Layout></ProtectedRoute>} />
          <Route path="/workflows" element={<ProtectedRoute><Layout><Workflows /></Layout></ProtectedRoute>} />
          <Route path="/reputation" element={<ProtectedRoute><Layout><Reputation /></Layout></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><Layout><Invoices /></Layout></ProtectedRoute>} />
          <Route path="/invoice-templates" element={<ProtectedRoute><Layout><InvoiceTemplates /></Layout></ProtectedRoute>} />
          <Route path="/courses" element={<ProtectedRoute><Layout><Courses /></Layout></ProtectedRoute>} />
          <Route path="/calls" element={<ProtectedRoute><Layout><Calls /></Layout></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Layout><Bookings /></Layout></ProtectedRoute>} />
          <Route path="/packages" element={<ProtectedRoute><Layout><Packages /></Layout></ProtectedRoute>} />
          <Route path="/itineraries" element={<ProtectedRoute><Layout><Itineraries /></Layout></ProtectedRoute>} />
          <Route path="/ai-assistant" element={<ProtectedRoute><Layout><AIAssistant /></Layout></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Layout><Reports /></Layout></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
