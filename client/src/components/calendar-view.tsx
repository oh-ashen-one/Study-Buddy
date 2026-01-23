import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  CalendarDays,
  CheckSquare,
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Task, Course } from "@shared/schema";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek
} from "date-fns";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };

  const getCoursesForDay = (date: Date) => {
    const dayName = format(date, "EEEE");
    return courses.filter((course) => course.days?.includes(dayName));
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const selectedDateCourses = selectedDate ? getCoursesForDay(selectedDate) : [];

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Calendar grid */}
      <div className="flex-1 p-4 overflow-auto">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              data-testid="button-prev-month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentMonth(new Date());
                setSelectedDate(new Date());
              }}
              data-testid="button-today"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              data-testid="button-next-month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div 
              key={day} 
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayTasks = getTasksForDate(day);
            const dayCourses = getCoursesForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const hasItems = dayTasks.length > 0 || dayCourses.length > 0;

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`
                  relative min-h-[80px] p-2 rounded-lg text-left transition-colors
                  ${isCurrentMonth ? "bg-card" : "bg-transparent"}
                  ${isSelected ? "ring-2 ring-primary" : ""}
                  ${isToday(day) ? "bg-primary/10" : ""}
                  ${hasItems && isCurrentMonth ? "hover-elevate" : ""}
                  border border-transparent hover:border-border
                `}
                data-testid={`calendar-day-${format(day, "yyyy-MM-dd")}`}
              >
                <span 
                  className={`
                    text-sm font-medium
                    ${!isCurrentMonth ? "text-muted-foreground/50" : ""}
                    ${isToday(day) ? "text-primary" : ""}
                  `}
                >
                  {format(day, "d")}
                </span>

                {isCurrentMonth && (
                  <div className="mt-1 space-y-1">
                    {dayCourses.slice(0, 2).map((course) => (
                      <div 
                        key={course.id}
                        className="text-xs truncate px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400"
                      >
                        {course.code || course.name}
                      </div>
                    ))}
                    {dayTasks.slice(0, 2).map((task) => (
                      <div 
                        key={task.id}
                        className={`text-xs truncate px-1.5 py-0.5 rounded ${
                          task.completed 
                            ? "bg-green-500/10 text-green-400 line-through" 
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {task.title}
                      </div>
                    ))}
                    {(dayCourses.length + dayTasks.length > 2) && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayCourses.length + dayTasks.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected date details */}
      <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-border bg-card/50">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">
            {selectedDate 
              ? format(selectedDate, "EEEE, MMMM d") 
              : "Select a date"}
          </h3>
        </div>
        
        <ScrollArea className="h-[calc(100%-57px)]">
          {selectedDate ? (
            <div className="p-4 space-y-6">
              {/* Classes */}
              {selectedDateCourses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4" />
                    Classes ({selectedDateCourses.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDateCourses.map((course) => (
                      <div 
                        key={course.id}
                        className="p-3 rounded-lg bg-card border border-border"
                        data-testid={`detail-course-${course.id}`}
                      >
                        <p className="font-medium text-sm">{course.name}</p>
                        {course.code && (
                          <Badge variant="outline" className="text-xs mt-1">
                            {course.code}
                          </Badge>
                        )}
                        {course.startTime && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <Clock className="w-3 h-3" />
                            {course.startTime} - {course.endTime}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {selectedDateTasks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" />
                    Tasks Due ({selectedDateTasks.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDateTasks.map((task) => (
                      <div 
                        key={task.id}
                        className={`p-3 rounded-lg bg-card border border-border ${
                          task.completed ? "opacity-60" : ""
                        }`}
                        data-testid={`detail-task-${task.id}`}
                      >
                        <p className={`font-medium text-sm ${task.completed ? "line-through" : ""}`}>
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <Badge 
                          className={`text-xs mt-2 ${
                            task.priority === "high" 
                              ? "bg-red-500/10 text-red-400 border-red-500/20" 
                              : task.priority === "low"
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          }`}
                        >
                          {task.priority} priority
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDateCourses.length === 0 && selectedDateTasks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nothing scheduled for this day</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
              <CalendarDays className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Click on a date to see details</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
