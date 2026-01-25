import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [initials, setInitials] = useState("U");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        const names = user.user_metadata.full_name.split(" ");
        setInitials(names.map(n => n[0]).join("").toUpperCase().slice(0, 2));
      }
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully",
    });
    navigate("/auth");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b border-border flex items-center px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger />
            <div className="ml-auto flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
              <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-semibold">
                {initials}
              </div>
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
          <footer className="border-t border-border py-4 px-6 bg-card/30 backdrop-blur-sm">
            <div className="text-center text-sm text-muted-foreground">
              Powered by{" "}
              <a
                href="https://growbusinessdigital.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Grow Business Digital
              </a>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
