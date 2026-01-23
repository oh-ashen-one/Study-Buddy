import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Plus, 
  Loader2, 
  Trash2, 
  Calendar as CalendarIcon,
  CheckSquare,
  Flag,
  BookOpen
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Task, Course } from "@shared/schema";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PRIORITY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  low: { label: "Low", color: "bg-green-500/10 text-green-400 border-green-500/20", icon: "text-green-400" },
  medium: { label: "Medium", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", icon: "text-yellow-400" },
  high: { label: "High", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: "text-red-400" },
};

export function TasksView() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: undefined as Date | undefined,
    courseId: undefined as number | undefined,
    priority: "medium",
  });
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const createTask = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/tasks", {
        title: newTask.title,
        description: newTask.description || undefined,
        dueDate: newTask.dueDate?.toISOString(),
        courseId: newTask.courseId,
        priority: newTask.priority,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsAddDialogOpen(false);
      setNewTask({ title: "", description: "", dueDate: undefined, courseId: undefined, priority: "medium" });
      toast({ title: "Task Created", description: "Your task has been added." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create task.", variant: "destructive" });
    },
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task Deleted", description: "The task has been removed." });
    },
  });

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Incomplete tasks first
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Then by due date
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    // Then by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority as keyof typeof priorityOrder] || 1) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 1);
  });

  const getDueDateLabel = (date: Date | null | undefined) => {
    if (!date) return null;
    const d = new Date(date);
    if (isToday(d)) return { text: "Today", color: "text-yellow-400" };
    if (isTomorrow(d)) return { text: "Tomorrow", color: "text-blue-400" };
    if (isPast(d)) return { text: "Overdue", color: "text-red-400" };
    return { text: format(d, "MMM d"), color: "text-muted-foreground" };
  };

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Tasks</h2>
            <p className="text-sm text-muted-foreground">
              {pendingCount} pending, {completedCount} completed
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" data-testid="button-add-task">
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>Add a task to your to-do list</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    placeholder="e.g., Complete Chapter 5 reading"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    data-testid="input-task-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task-description">Description (optional)</Label>
                  <Textarea
                    id="task-description"
                    placeholder="Add any notes or details..."
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="min-h-[80px]"
                    data-testid="input-task-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          data-testid="button-task-due-date"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newTask.dueDate ? format(newTask.dueDate, "MMM d, yyyy") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newTask.dueDate}
                          onSelect={(date) => setNewTask({ ...newTask, dueDate: date })}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(v) => setNewTask({ ...newTask, priority: v })}
                    >
                      <SelectTrigger data-testid="select-task-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {courses.length > 0 && (
                  <div className="space-y-2">
                    <Label>Course (optional)</Label>
                    <Select
                      value={newTask.courseId?.toString() || "none"}
                      onValueChange={(v) => setNewTask({ ...newTask, courseId: v === "none" ? undefined : parseInt(v) })}
                    >
                      <SelectTrigger data-testid="select-task-course">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No course</SelectItem>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.code ? `${c.code} - ` : ""}{c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createTask.mutate()}
                    disabled={!newTask.title.trim() || createTask.isPending}
                    data-testid="button-create-task"
                  >
                    {createTask.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Task
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {(["all", "pending", "completed"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
              data-testid={`button-filter-${f}`}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {sortedTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <CheckSquare className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {filter === "all" ? "No Tasks Yet" : `No ${filter} tasks`}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {filter === "all" 
                ? "Create tasks to keep track of assignments, readings, and study goals."
                : `You don't have any ${filter} tasks right now.`}
            </p>
            {filter === "all" && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)} 
                className="gap-2"
                data-testid="button-add-first-task"
              >
                <Plus className="w-4 h-4" />
                Add Your First Task
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-w-2xl mx-auto">
            {sortedTasks.map((task) => {
              const course = courses.find((c) => c.id === task.courseId);
              const priorityConfig = PRIORITY_CONFIG[task.priority || "medium"];
              const dueLabel = getDueDateLabel(task.dueDate);

              return (
                <div
                  key={task.id}
                  className={`group flex items-start gap-3 p-4 rounded-xl bg-card border border-border transition-opacity ${
                    task.completed ? "opacity-60" : ""
                  }`}
                  data-testid={`task-item-${task.id}`}
                >
                  <Checkbox
                    checked={task.completed ?? false}
                    onCheckedChange={(checked) => 
                      toggleTask.mutate({ id: task.id, completed: checked as boolean })
                    }
                    className="mt-1"
                    data-testid={`checkbox-task-${task.id}`}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.title}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="invisible group-hover:visible h-7 w-7 shrink-0"
                        onClick={() => deleteTask.mutate(task.id)}
                        data-testid={`button-delete-task-${task.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {course && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <BookOpen className="w-3 h-3" />
                          {course.code || course.name}
                        </Badge>
                      )}
                      <Badge className={`text-xs ${priorityConfig.color}`}>
                        <Flag className={`w-3 h-3 mr-1 ${priorityConfig.icon}`} />
                        {priorityConfig.label}
                      </Badge>
                      {dueLabel && (
                        <span className={`text-xs ${dueLabel.color}`}>
                          {dueLabel.text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
