 import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { z } from "zod";
import cors from "cors";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertPlanSchema, updateDayResultSchema, restartPlanSchema } from "./schema";
import { generatePlanEntries, recalculatePlanFromDay } from "./lib/calculations";

// Configure Postgres session store with better error handling
const PgSession = connectPgSimple(session);
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test database connection
pgPool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL for sessions:', err);
  } else {
    console.log('✅ PostgreSQL session store connected successfully');
    release();
  }
});

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
  console.log("🔄 Serializing user:", user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    console.log("🔄 Deserializing user:", id);
    const user = await storage.getUser(id);
    console.log("✅ User deserialized successfully:", user?.id);
    done(null, user);
  } catch (error) {
    console.error("❌ Error deserializing user:", error);
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
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://money-marathon.vercel.app",
      ];
      console.log("CORS Origin Received:", origin);
      
      if (!origin) {
        return callback(null, true);
      }
      
      if (allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        console.error("CORS Error: Origin not allowed:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
  }));

  // Session configuration with enhanced debugging
  const isProduction = process.env.NODE_ENV === 'production';
  console.log("🔧 Session config - Production:", isProduction);
  
  const sessionStore = new PgSession({
    pool: pgPool,
    tableName: 'sessions',
    createTableIfMissing: true,
    ttl: 24 * 60 * 60, // 24 hours in seconds
    schemaName: 'public',
  });

  // Add store event listeners for debugging
  sessionStore.on('connect', () => {
    console.log('✅ Session store connected');
  });

  sessionStore.on('disconnect', () => {
    console.log('❌ Session store disconnected');
  });

  sessionStore.on('error', (err) => {
    console.error('❌ Session store error:', err);
  });

  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false, // Important: don't save empty sessions
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    },
    name: "sessionId",
    // Add debugging
    rolling: false, // Don't reset expiry on every request
  }));

  // Add session debugging middleware
  app.use((req, res, next) => {
    console.log("📋 Session Debug Info:");
    console.log("  Session ID:", req.sessionID);
    console.log("  Session exists:", !!req.session);
    console.log("  Session data:", req.session);
    console.log("  Cookies received:", req.headers.cookie);
    console.log("  Is authenticated:", req.isAuthenticated ? req.isAuthenticated() : false);
    
    // Log when session is saved
    const originalEnd = res.end;
    res.end = function(...args) {
      console.log("💾 Final session before response:", req.session);
      console.log("🍪 Response headers:", res.getHeaders());
      originalEnd.apply(this, args);
    };
    
    next();
  });

  app.use(passport.initialize());
  app.use(passport.session());

  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Test route to manually set a cookie
  app.get("/test-session", (req, res) => {
    console.log("🧪 Testing session creation");
    req.session.testValue = "hello-world";
    req.session.save((err) => {
      if (err) {
        console.error("❌ Session save error:", err);
        return res.status(500).json({ error: "Session save failed" });
      }
      console.log("✅ Session saved successfully");
      res.json({ 
        message: "Session created", 
        sessionId: req.sessionID,
        sessionData: req.session 
      });
    });
  });

  // Enhanced register route
  app.post("/api/auth/register", async (req, res) => {
    try {
      console.log("📝 Registration attempt:", { email: req.body.email, name: req.body.name });
      
      if (!process.env.SESSION_SECRET) {
        console.error("❌ SESSION_SECRET not configured");
        return res.status(500).json({ message: "Server configuration error" });
      }

      const { name, email, password } = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      console.log("🔐 Creating user hash...");
      const passwordHash = await bcrypt.hash(password, 10);
      console.log("💾 Storing user in database...");
      const user = await storage.createUser({ name, email, passwordHash });
      console.log("✅ User created successfully:", user.id);

      // Manual session creation before login
      console.log("🔄 Logging in user...");
      req.login(user, (err) => {
        if (err) {
          console.error("❌ Login error after registration:", err);
          return res.status(500).json({ message: "Login failed after registration" });
        }
        
        console.log("✅ User logged in successfully");
        console.log("📋 Session after login:", req.session);
        console.log("🆔 Session ID:", req.sessionID);
        
        // Force save the session
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("❌ Session save error:", saveErr);
            return res.status(500).json({ message: "Session save failed" });
          }
          
          console.log("✅ Session saved successfully");
          console.log("🍪 Response headers:", res.getHeaders());
          
          res.status(201).json({ 
            user: { id: user.id, name: user.name, email: user.email },
            sessionId: req.sessionID // For debugging
          });
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("❌ Validation error:", error.errors);
        return res.status(400).json({ message: error.errors[0].message });
      }
      console.error("❌ Registration error details:", error);
      res.status(500).json({ 
        message: "Registration failed", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  });

  // Enhanced login route
  app.post("/api/auth/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
    }

    console.log("🔐 Login attempt for:", req.body.email);

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("❌ Passport authentication error:", err);
        return res.status(500).json({ message: "Login failed" });
      }
      if (!user) {
        console.log("❌ Login failed for:", req.body.email, "Reason:", info?.message);
        return res.status(401).json({ message: info.message || "Invalid credentials" });
      }

      console.log("✅ User authenticated, logging in...");
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("❌ Login session error:", loginErr);
          return res.status(500).json({ message: "Login failed" });
        }
        
        console.log("✅ User logged in successfully:", user.id);
        console.log("📋 Session after login:", req.session);
        console.log("🆔 Session ID:", req.sessionID);
        
        // Force save the session
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error("❌ Session save error:", saveErr);
            return res.status(500).json({ message: "Session save failed" });
          }
          
          console.log("✅ Session saved successfully");
          console.log("🍪 Response headers:", res.getHeaders());
          
          res.json({ 
            user: { id: user.id, name: user.name, email: user.email },
            sessionId: req.sessionID // For debugging
          });
        });
      });
    })(req, res, next);
  });
 
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("❌ Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("❌ Session destroy error:", destroyErr);
        }
        console.log("✅ User logged out successfully");
        res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    console.log("🔍 Auth check:");
    console.log("  Session ID:", req.sessionID);
    console.log("  Session data:", req.session);
    console.log("  Authenticated:", req.isAuthenticated());
    console.log("  Received cookies:", req.headers.cookie);
    
    if (req.isAuthenticated()) {
      const user = req.user as any;
      console.log("✅ Returning user:", user.id);
      res.json({ user: { id: user.id, name: user.name, email: user.email } });
    } else {
      console.log("❌ User not authenticated");
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // ... rest of your routes remain the same ...
  app.post("/api/plans", requireAuth, async (req, res) => {
    try {
      const planData = insertPlanSchema.parse(req.body);
      const user = req.user as any;
      const plan = await storage.createPlan({ ...planData, userId: user.id });
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

  app.patch("/api/plans/:id/days/:day", requireAuth, async (req, res) => {
    try {
      const { id, day } = req.params;
      const { result } = updateDayResultSchema.parse(req.body);
      const plan = await storage.getPlanById(id);
      if (!plan) {
        return res.status(404).json({ message: "Plan not found" });
      }
      const user = req.user as any;
      if (plan.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.updateDayResult(id, parseInt(day), result);
      if (result === "loss") {
        await storage.updatePlanStatus(id, "stopped");
      }
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
      const user = req.user as any;
      if (plan.userId !== user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteDayEntriesFromDay(id, day);
      const newEntries = recalculatePlanFromDay(plan, day);
      await storage.createDayEntries(newEntries);
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
