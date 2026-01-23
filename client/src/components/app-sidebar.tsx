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
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  Calendar, 
  CheckSquare, 
  CalendarDays, 
  LogOut,
  GraduationCap,
  Settings
} from "lucide-react";
import type { User } from "@shared/models/auth";
import type { UserProfile } from "@shared/schema";

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: "chat" | "schedule" | "tasks" | "calendar") => void;
  user: User | null | undefined;
  profile: UserProfile | undefined;
}

const menuItems = [
  { id: "chat", title: "AI Assistant", icon: MessageSquare },
  { id: "schedule", title: "Schedule", icon: Calendar },
  { id: "tasks", title: "Tasks", icon: CheckSquare },
  { id: "calendar", title: "Calendar", icon: CalendarDays },
] as const;

export function AppSidebar({ activeView, onViewChange, user, profile }: AppSidebarProps) {
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "SB";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Study Buddy</span>
            <span className="text-xs text-muted-foreground">
              {profile?.university || "Your Study Hub"}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-thin">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onViewChange(item.id)}
                    data-active={activeView === item.id}
                    className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                    data-testid={`button-nav-${item.id}`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {profile && (
          <SidebarGroup>
            <SidebarGroupLabel>Your Info</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2 space-y-2 text-sm">
                {profile.major && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Major</span>
                    <span className="text-foreground font-medium truncate max-w-[120px]" title={profile.major}>
                      {profile.major}
                    </span>
                  </div>
                )}
                {profile.year && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Year</span>
                    <span className="text-foreground font-medium">{profile.year}</span>
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.firstName || "User"} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-user-name">
              {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.email || "Student"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            asChild
            className="shrink-0"
            data-testid="button-logout"
          >
            <a href="/api/logout" title="Log out">
              <LogOut className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
