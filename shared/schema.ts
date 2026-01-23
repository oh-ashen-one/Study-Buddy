import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth and chat models
export * from "./models/auth";
export * from "./models/chat";

// User profiles with onboarding data
export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  university: text("university"),
  major: text("major"),
  year: text("year"), // Freshman, Sophomore, Junior, Senior, Grad
  onboardingComplete: boolean("onboarding_complete").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Courses from schedule
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  code: text("code"),
  professor: text("professor"),
  location: text("location"),
  days: text("days").array(), // ['Monday', 'Wednesday', 'Friday']
  startTime: text("start_time"),
  endTime: text("end_time"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Tasks / To-do items
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  courseId: integer("course_id"),
  priority: text("priority").default("medium"), // low, medium, high
  completed: boolean("completed").default(false),
  reminderTime: timestamp("reminder_time"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Shared AI answers for collaboration
export const sharedAnswers = pgTable("shared_answers", {
  id: serial("id").primaryKey(),
  shareId: varchar("share_id").notNull().unique(), // UUID for shareable link
  userId: varchar("user_id").notNull(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// AI Chat history for Study Buddy
export const studyChats = pgTable("study_chats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  title: text("title").default("New Chat"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const studyChatMessages = pgTable("study_chat_messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull().references(() => studyChats.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Relations
export const userProfilesRelations = relations(userProfiles, ({ many }) => ({
  courses: many(courses),
  tasks: many(tasks),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  course: one(courses, {
    fields: [tasks.courseId],
    references: [courses.id],
  }),
}));

export const studyChatsRelations = relations(studyChats, ({ many }) => ({
  messages: many(studyChatMessages),
}));

export const studyChatMessagesRelations = relations(studyChatMessages, ({ one }) => ({
  chat: one(studyChats, {
    fields: [studyChatMessages.chatId],
    references: [studyChats.id],
  }),
}));

// Insert schemas
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSharedAnswerSchema = createInsertSchema(sharedAnswers).omit({
  id: true,
  createdAt: true,
});

export const insertStudyChatSchema = createInsertSchema(studyChats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudyChatMessageSchema = createInsertSchema(studyChatMessages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type SharedAnswer = typeof sharedAnswers.$inferSelect;
export type InsertSharedAnswer = z.infer<typeof insertSharedAnswerSchema>;
export type StudyChat = typeof studyChats.$inferSelect;
export type InsertStudyChat = z.infer<typeof insertStudyChatSchema>;
export type StudyChatMessage = typeof studyChatMessages.$inferSelect;
export type InsertStudyChatMessage = z.infer<typeof insertStudyChatMessageSchema>;
