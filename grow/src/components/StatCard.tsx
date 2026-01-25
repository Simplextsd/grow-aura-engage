import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Interface and Component
export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string; 
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  onClick?: () => void;
}

export function StatCard({ title, value, description, changeType, icon: Icon, onClick }: StatCardProps) {
  return (
    <Card 
      onClick={onClick} 
      className={`shadow-card hover:shadow-glow transition-all duration-300 border-border/50 ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold">{value}</h3>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            
            {description && (
              <p className={`text-xs font-bold ${
                changeType === "positive" ? "text-green-500" : 
                changeType === "negative" ? "text-red-500" : 
                "text-muted-foreground" // neutral case
              }`}>
                {description}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}