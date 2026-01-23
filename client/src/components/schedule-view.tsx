import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Plus, 
  Clock, 
  MapPin, 
  User, 
  Upload, 
  Loader2,
  Trash2,
  BookOpen
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Course } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_COLORS: Record<string, string> = {
  Monday: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Tuesday: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  Wednesday: "bg-green-500/10 text-green-400 border-green-500/20",
  Thursday: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Friday: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export function ScheduleView() {
  const [scheduleText, setScheduleText] = useState("");
  const [isParseDialogOpen, setIsParseDialogOpen] = useState(false);
  const [parsedCourses, setParsedCourses] = useState<Partial<Course>[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const parseSchedule = useMutation({
    mutationFn: async (text: string) => {
      const res = await apiRequest("POST", "/api/courses/parse", { scheduleText: text });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.courses && data.courses.length > 0) {
        setParsedCourses(data.courses);
      } else {
        toast({
          title: "No Courses Found",
          description: "Could not parse any courses from the text. Try a different format.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Parsing Failed",
        description: "Failed to parse schedule. Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveCourses = useMutation({
    mutationFn: async (coursesToSave: Partial<Course>[]) => {
      const res = await apiRequest("POST", "/api/courses/bulk", { courses: coursesToSave });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsParseDialogOpen(false);
      setScheduleText("");
      setParsedCourses([]);
      toast({
        title: "Schedule Saved",
        description: "Your courses have been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save courses. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (courseId: number) => {
      await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Course Deleted",
        description: "The course has been removed from your schedule.",
      });
    },
  });

  const handleParse = () => {
    if (!scheduleText.trim()) {
      toast({
        title: "Empty Schedule",
        description: "Please paste your schedule text first.",
        variant: "destructive",
      });
      return;
    }
    parseSchedule.mutate(scheduleText);
  };

  const coursesByDay = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day] = courses.filter((c) => c.days?.includes(day));
    return acc;
  }, {} as Record<string, Course[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Your Schedule</h2>
          <p className="text-sm text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? "s" : ""} this semester
          </p>
        </div>
        
        <Dialog open={isParseDialogOpen} onOpenChange={setIsParseDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-schedule">
              <Plus className="w-4 h-4" />
              Add Courses
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Add Your Schedule</DialogTitle>
              <DialogDescription>
                Paste your schedule from your university portal. We'll use AI to parse it.
              </DialogDescription>
            </DialogHeader>

            {parsedCourses.length === 0 ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste your entire schedule here (Ctrl+A, Ctrl+C from your portal)...

Example format:
CS 101 - Intro to Computer Science
Prof. Smith | MWF 10:00-11:00 AM | Room 205
                  
MATH 201 - Calculus II
Prof. Johnson | TTh 2:00-3:30 PM | Science Hall 102"
                  value={scheduleText}
                  onChange={(e) => setScheduleText(e.target.value)}
                  className="min-h-[200px] text-sm"
                  data-testid="textarea-schedule-input"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Tip: Copy your entire schedule page for best results
                  </p>
                  <Button 
                    onClick={handleParse} 
                    disabled={parseSchedule.isPending}
                    className="gap-2"
                    data-testid="button-parse-schedule"
                  >
                    {parseSchedule.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    Parse Schedule
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 -mx-6 px-6">
                  <div className="space-y-3 py-2">
                    {parsedCourses.map((course, idx) => (
                      <Card key={idx} className="bg-card">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {course.code && (
                                  <Badge variant="outline" className="text-xs">
                                    {course.code}
                                  </Badge>
                                )}
                                <span className="font-medium">{course.name}</span>
                              </div>
                              {course.professor && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <User className="w-3.5 h-3.5" />
                                  {course.professor}
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {course.days && course.days.length > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {course.days.join(", ")}
                                  </div>
                                )}
                                {course.startTime && (
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    {course.startTime} - {course.endTime}
                                  </div>
                                )}
                              </div>
                              {course.location && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {course.location}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0"
                              onClick={() => {
                                setParsedCourses((prev) => prev.filter((_, i) => i !== idx));
                              }}
                              data-testid={`button-remove-parsed-${idx}`}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setParsedCourses([]);
                      setScheduleText("");
                    }}
                    data-testid="button-start-over"
                  >
                    Start Over
                  </Button>
                  <Button
                    onClick={() => saveCourses.mutate(parsedCourses)}
                    disabled={saveCourses.isPending || parsedCourses.length === 0}
                    className="gap-2"
                    data-testid="button-save-courses"
                  >
                    {saveCourses.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : null}
                    Save {parsedCourses.length} Course{parsedCourses.length !== 1 ? "s" : ""}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1 p-4">
        {courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              Add your class schedule to help the AI give you personalized study recommendations.
            </p>
            <Button 
              onClick={() => setIsParseDialogOpen(true)} 
              className="gap-2"
              data-testid="button-add-first-schedule"
            >
              <Plus className="w-4 h-4" />
              Add Your Schedule
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{day}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {coursesByDay[day].length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {coursesByDay[day].length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed border-border text-center text-sm text-muted-foreground">
                      No classes
                    </div>
                  ) : (
                    coursesByDay[day]
                      .sort((a, b) => (a.startTime || "").localeCompare(b.startTime || ""))
                      .map((course) => (
                        <Card 
                          key={course.id} 
                          className={`group relative border ${DAY_COLORS[day] || ""}`}
                          data-testid={`card-course-${course.id}`}
                        >
                          <CardContent className="p-3">
                            <div className="space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-medium text-sm leading-tight">
                                  {course.name}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="invisible group-hover:visible h-6 w-6 shrink-0"
                                  onClick={() => deleteCourse.mutate(course.id)}
                                  data-testid={`button-delete-course-${course.id}`}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                </Button>
                              </div>
                              {course.code && (
                                <Badge variant="outline" className="text-xs">
                                  {course.code}
                                </Badge>
                              )}
                              {course.startTime && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {course.startTime} - {course.endTime}
                                </div>
                              )}
                              {course.location && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  {course.location}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
