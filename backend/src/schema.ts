import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const planStatusEnum = pgEnum("plan_status", ["active", "stopped", "completed"]);
export const dayResultEnum = pgEnum("day_result", ["pending", "win", "loss"]);

export const plans = pgTable("plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  startWager: decimal("start_wager", { precision: 12, scale: 2 }).notNull(),
  odds: decimal("odds", { precision: 4, scale: 2 }).notNull(),
  days: integer("days").notNull(),
  status: planStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dayEntries = pgTable("day_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planId: varchar("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  day: integer("day").notNull(),
  wager: decimal("wager", { precision: 12, scale: 2 }).notNull(),
  odds: decimal("odds", { precision: 4, scale: 2 }).notNull(),
  winnings: decimal("winnings", { precision: 12, scale: 2 }).notNull(),
  result: dayResultEnum("result").default("pending").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  plans: many(plans),
}));

export const plansRelations = relations(plans, ({ one, many }) => ({
  user: one(users, { fields: [plans.userId], references: [users.id] }),
  dayEntries: many(dayEntries),
}));

export const dayEntriesRelations = relations(dayEntries, ({ one }) => ({
  plan: one(plans, { fields: [dayEntries.planId], references: [plans.id] }),
}));

export const insertUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    createdAt: true,
    passwordHash: true,   // 👈 omit this so frontend doesn’t need to send it
  })
  .extend({
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertPlanSchema = createInsertSchema(plans).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
}).extend({
  startWager: z.coerce.number().min(1, "Start wager must be at least 1"),
  odds: z.coerce.number().min(1.01, "Odds must be at least 1.01"),
  days: z.coerce.number().min(1, "Duration must be at least 1 day").max(365, "Duration cannot exceed 365 days"),
});

export const updateDayResultSchema = z.object({
  result: z.enum(["win", "loss"]),
});

export const restartPlanSchema = z.object({
  day: z.number().min(1, "Day must be at least 1"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;
export type DayEntry = typeof dayEntries.$inferSelect;
export type UpdateDayResult = z.infer<typeof updateDayResultSchema>;
export type RestartPlan = z.infer<typeof restartPlanSchema>;
