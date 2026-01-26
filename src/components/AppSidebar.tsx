
import { 
  LayoutDashboard, MessageSquare, Send, Users, BarChart3, Settings,
  Target, CheckSquare, Calendar, Workflow, Star, DollarSign, GraduationCap, Phone,
  Package, Map, Sparkles, Filter, ClipboardList
} from "lucide-react";
import { NavLink } from "react-router-dom";
import gbdLogo from "@/assets/growbussines.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
// fjrjdjdbnodibnsb ni
const crmItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Bookings", url: "/bookings", icon: Calendar },
  // { title: "Packages", url: "/packages", icon: Package },
  // { title: "Itineraries", url: "/itineraries", icon: Map },
  // { title: "Pipeline", url: "/pipeline", icon: Target },
  { title: "Hotels", url: "/hotels", icon: CheckSquare },
];

const marketingItems = [
  { title: "Campaigns", url: "/campaigns", icon: Send },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Segments", url: "/segments", icon: Filter },
  { title: "Lead Forms", url: "/lead-forms", icon: ClipboardList },
  { title: "Workflows", url: "/workflows", icon: Workflow },
];

const businessItems = [
  { title: "Reputation", url: "/reputation", icon: Star },
  { title: "Invoices", url: "/invoices", icon: DollarSign },
  { title: "Courses", url: "/courses", icon: GraduationCap },
  { title: "Calls", url: "/calls", icon: Phone },
];

const systemItems = [
  { title: "AI Assistant", url: "/ai-assistant", icon: Sparkles },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  // 1. Get user data from LocalStorage
  const userRole = localStorage.getItem("userRole");
  const savedPages = localStorage.getItem("userPages");
  
  let allowedPages: string[] = [];
  try {
    allowedPages = savedPages ? JSON.parse(savedPages) : [];
  } catch (e) {
    allowedPages = [];
  }

  // 2. Filter Function: Admin ko sab dikhao, baaki ko sirf allowed pages
  const filterItems = (items: any[]) => {
    if (userRole === "admin") return items; // Admin bypass
    return items.filter(item => allowedPages.includes(item.title));
  };

  const filteredCRM = filterItems(crmItems);
  const filteredMarketing = filterItems(marketingItems);
  const filteredBusiness = filterItems(businessItems);
  const filteredSystem = filterItems(systemItems);

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-6">
        <div className="flex items-center gap-3">
          <img 
            src={gbdLogo} 
            alt="Grow Business Digital" 
            className="h-10 w-auto"
          />
          <div>
            <h2 className="text-base font-semibold text-sidebar-foreground">Grow Business</h2>
            <p className="text-xs text-muted-foreground">Digital Marketing</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {filteredCRM.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">CRM</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredCRM.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/50"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredMarketing.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">Marketing</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMarketing.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/50"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredBusiness.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">Business</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredBusiness.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/50"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredSystem.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSystem.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/50"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}