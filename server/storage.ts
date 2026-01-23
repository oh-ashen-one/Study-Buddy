import { 
  userProfiles, 
  courses, 
  tasks, 
  sharedAnswers,
  studyChats,
  studyChatMessages,
  type UserProfile, 
  type InsertUserProfile,
  type Course,
  type InsertCourse,
  type Task,
  type InsertTask,
  type SharedAnswer,
  type InsertSharedAnswer,
  type StudyChat,
  type InsertStudyChat,
  type StudyChatMessage,
  type InsertStudyChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User profiles
  getProfileByUserId(userId: string): Promise<UserProfile | undefined>;
  createProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateProfile(userId: string, data: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;

  // Courses
  getCoursesByUserId(userId: string): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  createCoursesBulk(courses: InsertCourse[]): Promise<Course[]>;
  deleteCourse(id: number): Promise<void>;

  // Tasks
  getTasksByUserId(userId: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<void>;

  // Shared answers
  getSharedAnswer(shareId: string): Promise<SharedAnswer | undefined>;
  createSharedAnswer(answer: InsertSharedAnswer): Promise<SharedAnswer>;

  // Study chats
  getStudyChatsByUserId(userId: string): Promise<StudyChat[]>;
  getStudyChat(id: number): Promise<StudyChat | undefined>;
  getCurrentStudyChat(userId: string): Promise<(StudyChat & { messages: StudyChatMessage[] }) | undefined>;
  createStudyChat(chat: InsertStudyChat): Promise<StudyChat>;
  getStudyChatMessages(chatId: number): Promise<StudyChatMessage[]>;
  createStudyChatMessage(message: InsertStudyChatMessage): Promise<StudyChatMessage>;
}

export class DatabaseStorage implements IStorage {
  // User profiles
  async getProfileByUserId(userId: string): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [created] = await db.insert(userProfiles).values(profile).returning();
    return created;
  }

  async updateProfile(userId: string, data: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    const [updated] = await db
      .update(userProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Courses
  async getCoursesByUserId(userId: string): Promise<Course[]> {
    return db.select().from(courses).where(eq(courses.userId, userId)).orderBy(courses.name);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [created] = await db.insert(courses).values(course).returning();
    return created;
  }

  async createCoursesBulk(coursesToCreate: InsertCourse[]): Promise<Course[]> {
    if (coursesToCreate.length === 0) return [];
    return db.insert(courses).values(coursesToCreate).returning();
  }

  async deleteCourse(id: number): Promise<void> {
    await db.delete(courses).where(eq(courses.id, id));
  }

  // Tasks
  async getTasksByUserId(userId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async updateTask(id: number, data: Partial<InsertTask>): Promise<Task | undefined> {
    const [updated] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Shared answers
  async getSharedAnswer(shareId: string): Promise<SharedAnswer | undefined> {
    const [answer] = await db.select().from(sharedAnswers).where(eq(sharedAnswers.shareId, shareId));
    return answer;
  }

  async createSharedAnswer(answer: InsertSharedAnswer): Promise<SharedAnswer> {
    const [created] = await db.insert(sharedAnswers).values(answer).returning();
    return created;
  }

  // Study chats
  async getStudyChatsByUserId(userId: string): Promise<StudyChat[]> {
    return db.select().from(studyChats).where(eq(studyChats.userId, userId)).orderBy(desc(studyChats.updatedAt));
  }

  async getStudyChat(id: number): Promise<StudyChat | undefined> {
    const [chat] = await db.select().from(studyChats).where(eq(studyChats.id, id));
    return chat;
  }

  async getCurrentStudyChat(userId: string): Promise<(StudyChat & { messages: StudyChatMessage[] }) | undefined> {
    // Get the most recent chat or create one
    let [chat] = await db
      .select()
      .from(studyChats)
      .where(eq(studyChats.userId, userId))
      .orderBy(desc(studyChats.updatedAt))
      .limit(1);

    if (!chat) {
      [chat] = await db.insert(studyChats).values({ userId, title: "New Chat" }).returning();
    }

    const messages = await db
      .select()
      .from(studyChatMessages)
      .where(eq(studyChatMessages.chatId, chat.id))
      .orderBy(studyChatMessages.createdAt);

    return { ...chat, messages };
  }

  async createStudyChat(chat: InsertStudyChat): Promise<StudyChat> {
    const [created] = await db.insert(studyChats).values(chat).returning();
    return created;
  }

  async getStudyChatMessages(chatId: number): Promise<StudyChatMessage[]> {
    return db
      .select()
      .from(studyChatMessages)
      .where(eq(studyChatMessages.chatId, chatId))
      .orderBy(studyChatMessages.createdAt);
  }

  async createStudyChatMessage(message: InsertStudyChatMessage): Promise<StudyChatMessage> {
    const [created] = await db.insert(studyChatMessages).values(message).returning();
    
    // Update the chat's updatedAt
    await db
      .update(studyChats)
      .set({ updatedAt: new Date() })
      .where(eq(studyChats.id, message.chatId));

    return created;
  }
}

export const storage = new DatabaseStorage();
