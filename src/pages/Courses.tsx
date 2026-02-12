import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, CheckCircle, Clock, LayoutGrid, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { CreateCourseDialog } from "@/components/CreateCourseDialog";
import { CourseViewDialog } from "@/components/CourseViewDialog";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const API_URL = "http://localhost:5000/api/courses";

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/all`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setCourses(data || []);
    } catch (error: any) {
      toast({
        title: "Database Error",
        description: "Connection error: " + error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-white bg-[#0f1117] min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500 mb-4"></div>
        <p className="text-slate-400 font-medium tracking-widest uppercase text-xs">Loading courses</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 bg-[#0f1117] min-h-screen text-white">

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-8 gap-4">
        <div>
          <h1 className="text-5xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">
            Academy
          </h1>
          <p className="text-slate-400 font-medium italic">Empowering your agents through structured training</p>
        </div>
        <CreateCourseDialog onCourseCreated={fetchCourses} />
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Courses", val: courses.length, icon: BookOpen, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Active Agents", val: courses.reduce((a, c) => a + (c.student_count || 0), 0), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Completed Units", val: courses.reduce((a, c) => a + (c.lesson_count || 0), 0), icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" }
        ].map((stat, i) => (
          <Card key={i} className="bg-[#161922] border-white/5 overflow-hidden relative group">
            <div className={`absolute inset-0 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <CardContent className="p-6 flex items-center gap-5 relative z-10">
              <div className={`p-4 ${stat.bg} ${stat.color} rounded-2xl shadow-xl`}><stat.icon size={28} /></div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-4xl font-black tracking-tighter">{stat.val}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* PREMIUM COMPACT GRID */}
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-6">
        {courses.map((course) => (
          <div key={course.id} className="w-full h-[350px] group relative bg-[#11141d] rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-orange-500/40 hover:-translate-y-3 shadow-2xl flex flex-col">

            {/* THUMBNAIL AREA */}
            <div className="h-36 w-full relative overflow-hidden bg-slate-900">
              <img
                src={course.thumbnail_url || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400"}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-50 group-hover:opacity-100"
                alt={course.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11141d] via-[#11141d]/20 to-transparent" />
              <div className="absolute top-5 right-5 h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_15px_#f97316] animate-pulse" />
            </div>

            {/* CONTENT AREA */}
            <div className="p-7 flex flex-col justify-between flex-grow">
              <div className="text-left space-y-3">
                <div className="flex justify-between items-center">
                  <Badge className="bg-orange-500 text-white border-none text-[8px] h-4 font-black tracking-widest">PREMIUM</Badge>
                  <span className="text-slate-500 text-[9px] font-bold flex items-center gap-1 uppercase"><Clock size={12} /> {course.duration || "4h 20m"}</span>
                </div>
                <h3 className="text-xl font-black text-white line-clamp-1 group-hover:text-orange-500 transition-colors tracking-tight">
                  {course.title}
                </h3>
                <p className="text-slate-500 text-[10px] line-clamp-2 leading-relaxed font-medium">
                  {course.description?.includes('import') ? "Ready for enterprise training." : course.description}
                </p>
              </div>

              {/* ACTION AREA */}
              <div className="flex items-center gap-3 mt-6">
                <CourseViewDialog course={course} />
                <button title="Grid View" className="h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-orange-600 transition-all active:scale-90">
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {courses.length === 0 && (
        <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3.5rem] bg-white/[0.02] backdrop-blur-sm">
          <GraduationCap size={100} className="mx-auto text-slate-800 mb-6 animate-bounce" />
          <h3 className="text-3xl font-black tracking-tighter">No Active Modules</h3>
          <p className="text-slate-500 mt-2 mb-10 max-w-sm mx-auto font-medium tracking-tight italic">The training vault is currently empty. Start by creating a module.</p>
          <CreateCourseDialog onCourseCreated={fetchCourses} />
        </div>
      )}
    </div>
  );
} 