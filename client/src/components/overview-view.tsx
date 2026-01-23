import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Calendar,
  CheckSquare,
  Clock,
  MessageSquare,
  BookOpen,
  Lightbulb,
  MapPin,
  Flame,
  FileText,
  Users,
  FlaskConical,
  PenTool
} from "lucide-react";
import type { UserProfile, Task, Course } from "@shared/schema";

interface OverviewViewProps {
  onViewChange: (view: "chat" | "schedule" | "tasks" | "calendar" | "spots") => void;
}

// Task type detection and styling
const getTaskType = (task: Task): "assignment" | "exam" | "meeting" | "lab" | "paper" => {
  const title = task.title.toLowerCase();
  if (title.includes("exam") || title.includes("midterm") || title.includes("final") || title.includes("quiz") || title.includes("test")) return "exam";
  if (title.includes("meeting") || title.includes("review") || title.includes("presentation")) return "meeting";
  if (title.includes("lab") || title.includes("experiment")) return "lab";
  if (title.includes("paper") || title.includes("essay") || title.includes("draft") || title.includes("report")) return "paper";
  return "assignment";
};

const typeConfig = {
  assignment: { bg: "bg-green-500/15", border: "border-green-500", icon: FileText, color: "text-green-500" },
  exam: { bg: "bg-red-500/15", border: "border-red-500", icon: BookOpen, color: "text-red-500" },
  meeting: { bg: "bg-blue-500/15", border: "border-blue-500", icon: Users, color: "text-blue-500" },
  lab: { bg: "bg-purple-500/15", border: "border-purple-500", icon: FlaskConical, color: "text-purple-500" },
  paper: { bg: "bg-yellow-500/15", border: "border-yellow-500", icon: PenTool, color: "text-yellow-500" },
};

const priorityColors = {
  high: "text-red-500",
  medium: "text-yellow-500",
  low: "text-green-500",
};

export function OverviewView({ onViewChange }: OverviewViewProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Data fetching
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  // Task toggle mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      return await apiRequest("PATCH", `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Computed values
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, [currentTime]);

  const userName = user?.firstName || "Student";

  const todayDayName = currentTime.toLocaleDateString("en-US", { weekday: "long" });

  const todayClasses = useMemo(() => {
    return courses
      .filter(course => course.days?.includes(todayDayName))
      .sort((a, b) => {
        const timeA = a.startTime || "";
        const timeB = b.startTime || "";
        return timeA.localeCompare(timeB);
      });
  }, [courses, todayDayName]);

  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    return tasks
      .filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= now && dueDate <= twoWeeksFromNow;
      })
      .sort((a, b) => {
        // Sort by: incomplete first, then by due date
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
      })
      .slice(0, 6);
  }, [tasks]);

  // Quick stats
  const quickStats = useMemo(() => {
    const now = new Date();
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const dueThisWeek = tasks.filter(t => {
      if (!t.dueDate || t.completed) return false;
      const due = new Date(t.dueDate);
      return due >= now && due <= weekEnd;
    }).length;

    const completedThisWeek = tasks.filter(t => {
      if (!t.completed || !t.updatedAt) return false;
      const updated = new Date(t.updatedAt);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return updated >= weekAgo;
    }).length;

    return {
      assignmentsDue: dueThisWeek,
      completedThisWeek,
      classesToday: todayClasses.length,
      totalTasks: tasks.filter(t => !t.completed).length,
    };
  }, [tasks, todayClasses]);

  // AI Tips - generated based on actual data
  const aiTips = useMemo(() => {
    const tips: { id: number; type: "study" | "schedule" | "wellness"; tip: string; priority: "high" | "medium" | "low" }[] = [];

    // Check for upcoming exams
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const upcomingExams = tasks.filter(t => {
      if (!t.dueDate || t.completed) return false;
      const type = getTaskType(t);
      const due = new Date(t.dueDate);
      return type === "exam" && due <= twoWeeks;
    });

    if (upcomingExams.length > 0) {
      const exam = upcomingExams[0];
      const daysUntil = Math.ceil((new Date(exam.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      tips.push({
        id: 1,
        type: "study",
        tip: `Your ${exam.title} is in ${daysUntil} days. Start reviewing key concepts and practice problems now.`,
        priority: daysUntil <= 7 ? "high" : "medium",
      });
    }

    // Check for heavy workload
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const dueSoon = tasks.filter(t => {
      if (!t.dueDate || t.completed) return false;
      return new Date(t.dueDate) <= next48Hours;
    });

    if (dueSoon.length >= 2) {
      tips.push({
        id: 2,
        type: "schedule",
        tip: `You have ${dueSoon.length} tasks due within 48 hours. Consider blocking off focused work time tonight.`,
        priority: "high",
      });
    }

    // Course-based tip
    if (todayClasses.length > 0 && todayClasses.length <= 2) {
      tips.push({
        id: 3,
        type: "study",
        tip: `Light class day today. Great time to get ahead on upcoming assignments or review material.`,
        priority: "medium",
      });
    }

    // Wellness tip
    tips.push({
      id: 4,
      type: "wellness",
      tip: "Remember to take short breaks between study sessions. A 5-minute walk can boost focus and retention.",
      priority: "low",
    });

    return tips.slice(0, 4);
  }, [tasks, todayClasses]);

  const formatTimeUntil = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (diff < 0) return "Overdue";
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    return "Due soon";
  };

  const isUrgent = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const hoursUntil = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntil <= 48 && hoursUntil > 0;
  };

  const tipIcons = { study: BookOpen, schedule: Clock, wellness: Lightbulb };

  return (
    <div className="h-full overflow-auto scrollbar-thin p-6 pb-24">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
            {greeting}, {userName} <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {currentTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {profile?.university && ` • ${profile.university}`}
            {profile?.major && ` • ${profile.major}`}
          </p>
        </div>

        {/* Study Streak Badge */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30">
          <Flame className="w-6 h-6 text-primary" aria-hidden="true" />
          <div>
            <div className="text-xl font-semibold text-primary">7 days</div>
            <div className="text-xs text-muted-foreground">Study streak</div>
          </div>
        </div>
      </header>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Due This Week", value: quickStats.assignmentsDue, icon: FileText, color: "text-red-500" },
          { label: "Completed", value: quickStats.completedThisWeek, icon: CheckSquare, color: "text-green-500" },
          { label: "Classes Today", value: quickStats.classesToday, icon: Calendar, color: "text-blue-500" },
          { label: "Open Tasks", value: quickStats.totalTasks, icon: Zap, color: "text-purple-500" },
        ].map((stat, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 rounded-xl bg-card/50 border border-border"
          >
            <stat.icon className={`w-6 h-6 ${stat.color}`} aria-hidden="true" />
            <div>
              <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Upcoming Deadlines */}
        <section className="lg:row-span-2 p-5 rounded-2xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
              Upcoming Deadlines
            </h2>
            <span className="text-xs text-muted-foreground">Next 2 weeks</span>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No upcoming deadlines</p>
              <Button
                variant="link"
                className="text-primary mt-2"
                onClick={() => onViewChange("tasks")}
              >
                Add a task
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {upcomingDeadlines.map((task) => {
                const taskType = getTaskType(task);
                const config = typeConfig[taskType];
                const urgent = task.dueDate && isUrgent(task.dueDate);
                const IconComponent = config.icon;

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskMutation.mutate({ id: task.id, completed: !task.completed })}
                    className={`
                      relative p-3.5 rounded-xl border cursor-pointer transition-all
                      ${config.bg} ${config.border}
                      ${task.completed ? "opacity-50" : "hover:scale-[1.01]"}
                    `}
                  >
                    {urgent && !task.completed && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 rounded-l-xl animate-pulse" />
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <IconComponent className={`w-5 h-5 mt-0.5 ${config.color}`} aria-hidden="true" />
                        <div>
                          <div className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                            {task.title}
                          </div>
                          {task.courseId && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {courses.find(c => c.id === task.courseId)?.code || courses.find(c => c.id === task.courseId)?.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`text-xs font-semibold whitespace-nowrap ${urgent ? "text-red-500" : "text-muted-foreground"}`}>
                        {task.dueDate && formatTimeUntil(task.dueDate)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Today's Classes */}
        <section className="p-5 rounded-2xl bg-card/50 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
              Today's Classes
            </h2>
            {todayClasses.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {todayDayName}
              </span>
            )}
          </div>

          {todayClasses.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No classes today</p>
              <Button
                variant="link"
                className="text-primary mt-2"
                onClick={() => onViewChange("schedule")}
              >
                View schedule
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {todayClasses.map((course, i) => (
                <div
                  key={course.id}
                  className={`
                    flex items-center gap-3.5 p-3 rounded-xl
                    ${i === 0 ? "bg-green-500/10 border border-green-500/30" : ""}
                  `}
                >
                  <div className="w-12 text-center">
                    <div className={`text-sm font-semibold ${i === 0 ? "text-green-500" : ""}`}>
                      {course.startTime?.split(" ")[0]}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {course.startTime?.split(" ")[1]}
                    </div>
                  </div>
                  <div className={`w-0.5 h-9 rounded-full ${i === 0 ? "bg-green-500" : "bg-border"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {course.code ? `${course.code} - ` : ""}{course.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {course.location}{course.professor && ` • ${course.professor}`}
                    </div>
                  </div>
                  {i === 0 && (
                    <span className="text-[10px] font-semibold text-green-500 shrink-0">NEXT</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AI Tips */}
        <section className="p-5 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" aria-hidden="true" />
              AI Tips for You
            </h2>
            <span className="text-[10px] text-primary bg-primary/20 px-2 py-1 rounded-md font-medium">
              Personalized
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {aiTips.map((tip) => {
              const IconComponent = tipIcons[tip.type];
              return (
                <div
                  key={tip.id}
                  className="p-3 rounded-xl bg-background/50 border-l-[3px]"
                  style={{ borderLeftColor: tip.priority === "high" ? "#ef4444" : tip.priority === "medium" ? "#eab308" : "#22c55e" }}
                >
                  <div className="flex items-start gap-2.5">
                    <IconComponent className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" aria-hidden="true" />
                    <p className="text-[13px] text-muted-foreground leading-relaxed">{tip.tip}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="p-5 rounded-2xl bg-card/50 border border-border">
          <h2 className="text-base font-semibold flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              className="h-auto py-3.5 justify-start gap-2.5 bg-primary/10 border-primary/30 hover:bg-primary/20"
              onClick={() => onViewChange("chat")}
            >
              <MessageSquare className="w-5 h-5 text-primary" aria-hidden="true" />
              <span className="text-sm">Ask AI</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3.5 justify-start gap-2.5 bg-green-500/10 border-green-500/30 hover:bg-green-500/20"
              onClick={() => onViewChange("spots")}
            >
              <MapPin className="w-5 h-5 text-green-500" aria-hidden="true" />
              <span className="text-sm">Study Spots</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3.5 justify-start gap-2.5 bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20"
              onClick={() => onViewChange("tasks")}
            >
              <CheckSquare className="w-5 h-5 text-blue-500" aria-hidden="true" />
              <span className="text-sm">Add Task</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-3.5 justify-start gap-2.5 bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20"
              onClick={() => onViewChange("calendar")}
            >
              <Calendar className="w-5 h-5 text-purple-500" aria-hidden="true" />
              <span className="text-sm">Calendar</span>
            </Button>
          </div>
        </section>
      </div>

      {/* Floating AI Chat Button */}
      <button
        onClick={() => onViewChange("chat")}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/40 flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Open AI Assistant"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}
