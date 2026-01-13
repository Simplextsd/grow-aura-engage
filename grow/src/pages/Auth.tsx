import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend (server.js) se connection
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Sabse pehle token aur user details save karein
        localStorage.setItem("token", data.token);
        localStorage.setItem("userRole", data.user.role);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userName", data.user.fullName);
        
        // 2. Permissions Sync: Backend (server.js) se aayi hui 'pages' list save karein
        const permissions = data.user.pages || [];
        localStorage.setItem("userPages", JSON.stringify(permissions));

        toast({ title: "Welcome! ✈️", description: `Logged in as ${data.user.role}` });

        // 3. Navigation aur Page Reload logic
        setTimeout(() => {
          navigate("/");
          // Reload zaroori hai taake Sidebar naye permissions ko read kar sake
          window.location.reload(); 
        }, 500);
      } else {
        setLoading(false);
        toast({ title: "Login Failed", description: data.error, variant: "destructive" });
      }
    } catch (error: any) {
      setLoading(false);
      toast({ title: "Error", description: "Server connection failed. Make sure server is running on port 5000", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-card border-border/50">
        <CardHeader className="text-center">
          <div className="h-12 w-12 rounded-lg bg-primary mx-auto mb-4 flex items-center justify-center font-bold text-primary-foreground text-xl">GB</div>
          <CardTitle className="text-2xl font-semibold">Grow Business Digital</CardTitle>
          <CardDescription>Your complete travel agency CRM solution</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="admin@test.com"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Redirecting..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}