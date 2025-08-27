import express from "express";
import { registerRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  try {
    // Register all routes
    const server = await registerRoutes(app);

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API docs: http://localhost:${PORT}/health`);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔧 Development mode - CORS enabled`);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();