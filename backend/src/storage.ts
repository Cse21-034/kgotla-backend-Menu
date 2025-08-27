import { users, plans, dayEntries, type User, type InsertUser, type Plan, type InsertPlan, type DayEntry } from "./schema";
import { db } from "./config/database";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser & { passwordHash: string }): Promise<User>;
  
  // Plans
  createPlan(plan: InsertPlan & { userId: string }): Promise<Plan>;
  getPlansByUserId(userId: string): Promise<Plan[]>;
  getPlanById(id: string): Promise<Plan | undefined>;
  updatePlanStatus(id: string, status: "active" | "stopped" | "completed"): Promise<void>;
  deletePlan(id: string): Promise<void>;
  
  // Day Entries
  createDayEntries(entries: Omit<DayEntry, "id">[]): Promise<DayEntry[]>;
  getDayEntriesByPlanId(planId: string): Promise<DayEntry[]>;
  updateDayResult(planId: string, day: number, result: "win" | "loss"): Promise<void>;
  deleteDayEntriesFromDay(planId: string, fromDay: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser & { passwordHash: string }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
      })
      .returning();
    return newUser;
  }

  async createPlan(plan: InsertPlan & { userId: string }): Promise<Plan> {
    const [newPlan] = await db
      .insert(plans)
      .values({
        userId: plan.userId,
        name: plan.name,
        startWager: plan.startWager.toString(),
        odds: plan.odds.toString(),
        days: plan.days,
      })
      .returning();
    return newPlan;
  }

  async getPlansByUserId(userId: string): Promise<Plan[]> {
    return await db
      .select()
      .from(plans)
      .where(eq(plans.userId, userId))
      .orderBy(desc(plans.createdAt));
  }

  async getPlanById(id: string): Promise<Plan | undefined> {
    const [plan] = await db.select().from(plans).where(eq(plans.id, id));
    return plan || undefined;
  }

  async updatePlanStatus(id: string, status: "active" | "stopped" | "completed"): Promise<void> {
    await db.update(plans).set({ status }).where(eq(plans.id, id));
  }

  async deletePlan(id: string): Promise<void> {
    await db.delete(plans).where(eq(plans.id, id));
  }

  async createDayEntries(entries: Omit<DayEntry, "id">[]): Promise<DayEntry[]> {
    const insertData = entries.map(entry => ({
      planId: entry.planId,
      day: entry.day,
      wager: entry.wager.toString(),
      odds: entry.odds.toString(),
      winnings: entry.winnings.toString(),
      result: entry.result,
    }));
    
    return await db.insert(dayEntries).values(insertData).returning();
  }

  async getDayEntriesByPlanId(planId: string): Promise<DayEntry[]> {
    return await db
      .select()
      .from(dayEntries)
      .where(eq(dayEntries.planId, planId))
      .orderBy(dayEntries.day);
  }

  async updateDayResult(planId: string, day: number, result: "win" | "loss"): Promise<void> {
    await db
      .update(dayEntries)
      .set({ result })
      .where(and(eq(dayEntries.planId, planId), eq(dayEntries.day, day)));
  }

  async deleteDayEntriesFromDay(planId: string, fromDay: number): Promise<void> {
    await db
      .delete(dayEntries)
      .where(and(eq(dayEntries.planId, planId), sql`day >= ${fromDay}`));
  }
}

export const storage = new DatabaseStorage();