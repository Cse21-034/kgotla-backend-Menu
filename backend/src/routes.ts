import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { z } from "zod";
import cors from "cors";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertPlanSchema, updateDayResultSchema, restartPlanSchema } from "./schema";
import { generatePlanEntries, recalculatePlanFromDay } from "./lib/calculations";

// Configure Passport
passport.use(new LocalStrategy(
  { usernameField: "email" },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: "Invalid email or password" });
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return done(null, false, { message: "Invalid email or password" });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Authentication required" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // CORS configuration
  app.use(cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173", // Vite dev server default
      process.env.CORS_ORIGIN
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
  }));

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("Registration attempt:", { email: req.body.email, name: req.body.name });
    
    // Check if session secret exists
    if (!process.env.SESSION_SECRET && !req.sessionStore) {
      console.error("SESSION_SECRET not configured");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const { name, email, password } = insertUserSchema.parse(req.body);

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("Creating user hash...");
    const passwordHash = await bcrypt.hash(password, 10);

    console.log("Storing user in database...");
    const user = await storage.createUser({ name, email, passwordHash });
    console.log("User created successfully:", user.id);

    // Auto-login
    req.login(user, (err) => {
      if (err) {
        console.error("Login error after registration:", err);
        return res.status(500).json({ message: "Login failed after registration" });
      }
      console.log("User logged in successfully");
      res.status(201).json({ 
        user: { id: user.id, name: user.name, email: user.email } 
      });
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Validation error:", error.errors);
      return res.status(400).json({ message: error.errors[0].message });
    }
    console.error("Registration error details:", error);
    res.status(500).json({ 
      message: "Registration failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

  app.post("/api/auth/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      if (!user) {
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ user: { id: user.id, name: user.name, email: user.email } });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({ user: { id: user.id, name: user.name, email: user.email } });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Plan routes
  app.post("/api/plans", requireAuth, async (req, res) => {
    try {
      const planData = insertPlanSchema.parse(req.body);
      const user = req.user as any;

      // Create plan
      const plan = await storage.createPlan({
        ...planData,
        userId: user.id
      });

      // Generate day entries
      const entries = generatePlanEntries(plan);
      await storage.createDayEntries(entries);

      res.json({ plan });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to create plan" });
    }
  });

  app.get("/api/plans", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const plans = await storage.getPlansByUserId(user.id);
      res.json({ plans });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.get("/api/plans/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const plan = await storage.getPlanById(id);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Check ownership
      const user = req.user as any;
      if (plan.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const dayEntries = await storage.getDayEntriesByPlanId(id);
      res.json({ plan, dayEntries });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch plan" });
    }
  });

  app.delete("/api/plans/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const plan = await storage.getPlanById(id);
      
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Check ownership
      const user = req.user as any;
      if (plan.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deletePlan(id);
      res.json({ message: "Plan deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete plan" });
    }
  });

  // Day entry routes
  app.patch("/api/plans/:id/days/:day", requireAuth, async (req, res) => {
    try {
      const { id, day } = req.params;
      const { result } = updateDayResultSchema.parse(req.body);
      
      const plan = await storage.getPlanById(id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Check ownership
      const user = req.user as any;
      if (plan.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.updateDayResult(id, parseInt(day), result);

      // If loss, stop the plan
      if (result === "loss") {
        await storage.updatePlanStatus(id, "stopped");
      }

      // Check if plan is completed
      const dayEntries = await storage.getDayEntriesByPlanId(id);
      const completedDays = dayEntries.filter(entry => entry.result === "win").length;
      if (completedDays === plan.days) {
        await storage.updatePlanStatus(id, "completed");
      }

      res.json({ message: "Day result updated successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to update day result" });
    }
  });

  app.post("/api/plans/:id/restart", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { day } = restartPlanSchema.parse(req.body);
      
      const plan = await storage.getPlanById(id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }

      // Check ownership
      const user = req.user as any;
      if (plan.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Delete entries from restart day onwards
      await storage.deleteDayEntriesFromDay(id, day);

      // Regenerate entries from restart day
      const newEntries = recalculatePlanFromDay(plan, day);
      await storage.createDayEntries(newEntries);

      // Reactivate plan if it was stopped
      if (plan.status === "stopped") {
        await storage.updatePlanStatus(id, "active");
      }

      res.json({ message: "Plan restarted successfully" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "Failed to restart plan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
