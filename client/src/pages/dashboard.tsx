import { useCallback } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { OverviewView } from "@/components/overview-view";
import { ChatInterface } from "@/components/chat-interface";
import { ScheduleView } from "@/components/schedule-view";
import { TasksView } from "@/components/tasks-view";
import { CalendarView } from "@/components/calendar-view";
import StudySpots from "@/pages/study-spots";
import type { UserProfile } from "@shared/schema";

type View = "home" | "chat" | "schedule" | "tasks" | "calendar" | "spots";

const VALID_VIEWS: View[] = ["home", "chat", "schedule", "tasks", "calendar", "spots"];

function getViewFromUrl(): View {
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  if (view && VALID_VIEWS.includes(view as View)) {
    return view as View;
  }
  return "home"; // Default to home/overview
}

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const activeView = getViewFromUrl();

  const setActiveView = useCallback((view: View) => {
    const url = view === "home" ? "/" : `/?view=${view}`;
    setLocation(url);
  }, [setLocation]);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background">
        <AppSidebar 
          activeView={activeView} 
          onViewChange={setActiveView}
          user={user}
          profile={profile}
        />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Header - hidden on home view */}
          {activeView !== "home" && (
            <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-3">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <h1 className="text-lg font-semibold capitalize" data-testid="text-view-title">
                  {activeView === "chat" ? "AI Study Assistant" : activeView}
                </h1>
              </div>
            </header>
          )}

          {/* Main content */}
          <main className={`flex-1 overflow-hidden ${activeView === "home" ? "" : ""}`}>
            {activeView === "home" && <OverviewView onViewChange={setActiveView} />}
            {activeView === "chat" && <ChatInterface profile={profile} />}
            {activeView === "schedule" && <ScheduleView />}
            {activeView === "tasks" && <TasksView />}
            {activeView === "calendar" && <CalendarView />}
            {activeView === "spots" && <StudySpots />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
