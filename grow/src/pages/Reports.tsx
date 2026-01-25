import { TrendingUp, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const monthlyRevenue = [
  { month: "Jan", revenue: 42000, cost: 28000 },
  { month: "Feb", revenue: 51000, cost: 32000 },
  { month: "Mar", revenue: 48000, cost: 30000 },
  { month: "Apr", revenue: 62000, cost: 35000 },
  { month: "May", revenue: 71000, cost: 38000 },
  { month: "Jun", revenue: 84000, cost: 42000 },
];

const channelROI = [
  { channel: "Email", roi: 320, spend: 12000 },
  { channel: "WhatsApp", roi: 450, spend: 8000 },
  { channel: "Instagram", roi: 280, spend: 15000 },
  { channel: "Facebook", roi: 210, spend: 18000 },
  { channel: "Automation", roi: 520, spend: 6000 },
];

const customerGrowth = [
  { week: "W1", total: 18200, new: 420, churned: 180 },
  { week: "W2", total: 19100, new: 980, churned: 220 },
  { week: "W3", total: 20500, new: 1520, churned: 280 },
  { week: "W4", total: 22300, new: 1920, churned: 240 },
  { week: "W5", total: 24100, new: 1980, churned: 320 },
  { week: "W6", total: 25800, new: 2100, churned: 280 },
];

export default function Reports() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights into your marketing performance</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-2">$358K</h3>
                <p className="text-sm text-green-500 mt-2">+28.4% this month</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. ROI</p>
                <h3 className="text-3xl font-bold mt-2">356%</h3>
                <p className="text-sm text-green-500 mt-2">+12.8% this month</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customer LTV</p>
                <h3 className="text-3xl font-bold mt-2">$4,285</h3>
                <p className="text-sm text-green-500 mt-2">+18.2% this month</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Revenue & Cost Analysis</CardTitle>
          <CardDescription>Monthly revenue vs marketing spend</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(0 0% 10%)", 
                  border: "1px solid hsl(0 0% 18%)",
                  borderRadius: "8px"
                }} 
              />
              <Legend />
              <Bar dataKey="revenue" fill="#ff8800" radius={[8, 8, 0, 0]} />
              <Bar dataKey="cost" fill="#ff6600" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Channel ROI Performance</CardTitle>
            <CardDescription>Return on investment by marketing channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelROI} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis type="number" stroke="#888" />
                <YAxis dataKey="channel" type="category" stroke="#888" width={100} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(0 0% 10%)", 
                    border: "1px solid hsl(0 0% 18%)",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Bar dataKey="roi" fill="#ff8800" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/50">
          <CardHeader>
            <CardTitle>Customer Growth Trend</CardTitle>
            <CardDescription>New customers vs churn rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="week" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(0 0% 10%)", 
                    border: "1px solid hsl(0 0% 18%)",
                    borderRadius: "8px"
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="new" stroke="#ff8800" strokeWidth={3} dot={{ fill: "#ff8800", r: 5 }} />
                <Line type="monotone" dataKey="churned" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card border-border/50">
        <CardHeader>
          <CardTitle>Customer Base Evolution</CardTitle>
          <CardDescription>Total customer growth over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={customerGrowth}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8800" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ff8800" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="week" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(0 0% 10%)", 
                  border: "1px solid hsl(0 0% 18%)",
                  borderRadius: "8px"
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#ff8800" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
