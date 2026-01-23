import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import OpenAI from "openai";
import { randomUUID } from "crypto";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // User profile routes
  app.get("/api/profile", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getProfileByUserId(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { university, major, year, onboardingComplete } = req.body;

      let profile = await storage.getProfileByUserId(userId);

      if (profile) {
        profile = await storage.updateProfile(userId, { 
          university, 
          major, 
          year, 
          onboardingComplete 
        });
      } else {
        profile = await storage.createProfile({
          userId,
          university,
          major,
          year,
          onboardingComplete,
        });
      }

      res.json(profile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Course routes
  app.get("/api/courses", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const courses = await storage.getCoursesByUserId(userId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.post("/api/courses/parse", isAuthenticated, async (req: any, res: Response) => {
    try {
      const { scheduleText } = req.body;

      if (!scheduleText) {
        return res.status(400).json({ error: "Schedule text is required" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a schedule parser. Extract course information from the provided schedule text.
Return a JSON object with a "courses" array. Each course should have:
- name: string (course name)
- code: string | null (course code like "CS 101")
- professor: string | null
- location: string | null (room/building)
- days: string[] (e.g., ["Monday", "Wednesday", "Friday"])
- startTime: string | null (e.g., "10:00 AM")
- endTime: string | null (e.g., "11:00 AM")

Only return valid JSON, no explanation. If you can't parse anything, return {"courses": []}.`,
          },
          {
            role: "user",
            content: scheduleText,
          },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 2048,
      });

      const content = response.choices[0]?.message?.content || '{"courses": []}';
      const parsed = JSON.parse(content);
      res.json(parsed);
    } catch (error) {
      console.error("Error parsing schedule:", error);
      res.status(500).json({ error: "Failed to parse schedule" });
    }
  });

  app.post("/api/courses/bulk", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { courses: coursesToCreate } = req.body;

      if (!Array.isArray(coursesToCreate)) {
        return res.status(400).json({ error: "Courses array is required" });
      }

      const coursesWithUser = coursesToCreate.map((c: any) => ({
        ...c,
        userId,
        days: c.days || [],
      }));

      const created = await storage.createCoursesBulk(coursesWithUser);
      res.json(created);
    } catch (error) {
      console.error("Error creating courses:", error);
      res.status(500).json({ error: "Failed to create courses" });
    }
  });

  app.delete("/api/courses/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const courseId = parseInt(req.params.id);
      await storage.deleteCourse(courseId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting course:", error);
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  // Task routes
  app.get("/api/tasks", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getTasksByUserId(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { title, description, dueDate, courseId, priority } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      const task = await storage.createTask({
        userId,
        title,
        description: description || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        courseId: courseId || null,
        priority: priority || "medium",
        completed: false,
        reminderTime: null,
      });

      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      const updates = req.body;

      const task = await storage.updateTask(taskId, updates);
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req: any, res: Response) => {
    try {
      const taskId = parseInt(req.params.id);
      await storage.deleteTask(taskId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Study chat routes
  app.get("/api/study-chats/current", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const chat = await storage.getCurrentStudyChat(userId);
      res.json(chat);
    } catch (error) {
      console.error("Error fetching current chat:", error);
      res.status(500).json({ error: "Failed to fetch chat" });
    }
  });

  app.post("/api/study-chats/message", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: "Message content is required" });
      }

      // Get or create current chat
      const chat = await storage.getCurrentStudyChat(userId);
      if (!chat) {
        return res.status(500).json({ error: "Failed to get chat" });
      }

      // Save user message
      await storage.createStudyChatMessage({
        chatId: chat.id,
        role: "user",
        content,
      });

      // Get user profile for context
      const profile = await storage.getProfileByUserId(userId);
      const courses = await storage.getCoursesByUserId(userId);

      // Build system prompt with user context
      let systemPrompt = `You are Study Buddy AI, a helpful and encouraging study assistant for college students. 
You provide personalized study advice, recommend learning resources, and help with academic questions.

When recommending resources, include specific recommendations like:
- YouTube channels (with channel names)
- Khan Academy topics
- Coursera courses
- Relevant subreddits (r/...) 
- Textbooks or study guides when appropriate

Be encouraging but realistic. Tailor your advice to the student's level.`;

      if (profile) {
        systemPrompt += `\n\nStudent context:`;
        if (profile.university) systemPrompt += `\n- University: ${profile.university}`;
        if (profile.major) {
          systemPrompt += `\n- Major: ${profile.major}`;
          
          // Extra context for STEM and Pre-Law
          const stemMajors = ["Computer Science", "Engineering", "Biology", "Chemistry", "Physics", "Mathematics", "Pre-Med"];
          if (stemMajors.includes(profile.major)) {
            systemPrompt += `\n- Note: This is a STEM student. Emphasize problem-solving, practice problems, and technical resources.`;
          }
          if (profile.major === "Pre-Law") {
            systemPrompt += `\n- Note: This is a Pre-Law student. Focus on LSAT prep, reading comprehension, logical reasoning, and analytical writing.`;
          }
        }
        if (profile.year) systemPrompt += `\n- Year: ${profile.year}`;
      }

      if (courses.length > 0) {
        systemPrompt += `\n\nCurrent courses:`;
        courses.forEach(c => {
          systemPrompt += `\n- ${c.code ? c.code + ": " : ""}${c.name}`;
        });
      }

      // Get chat history for context
      const messages = chat.messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

      // Add the new user message
      messages.push({ role: "user", content });

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream response from OpenAI
      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        max_completion_tokens: 2048,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save assistant message
      await storage.createStudyChatMessage({
        chatId: chat.id,
        role: "assistant",
        content: fullResponse,
      });

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });

  // Shared answers routes
  app.get("/api/shared-answers/:shareId", async (req: Request, res: Response) => {
    try {
      const shareId = req.params.shareId as string;
      const answer = await storage.getSharedAnswer(shareId);
      
      if (!answer) {
        return res.status(404).json({ error: "Answer not found" });
      }

      res.json(answer);
    } catch (error) {
      console.error("Error fetching shared answer:", error);
      res.status(500).json({ error: "Failed to fetch answer" });
    }
  });

  app.post("/api/shared-answers", isAuthenticated, async (req: any, res: Response) => {
    try {
      const userId = req.user.claims.sub;
      const { question, answer } = req.body;

      if (!answer) {
        return res.status(400).json({ error: "Answer is required" });
      }

      const shareId = randomUUID();
      const sharedAnswer = await storage.createSharedAnswer({
        shareId,
        userId,
        question: question || "",
        answer,
      });

      res.status(201).json(sharedAnswer);
    } catch (error) {
      console.error("Error creating shared answer:", error);
      res.status(500).json({ error: "Failed to create shared answer" });
    }
  });

  return httpServer;
}
