import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import errorHandler from "./middlewares/error-handler.middleware..js";
import createTables from "./data/create-user-table.js";
import authRoutes from "./modules/auth/auth.routes.js";
import billsRoutes from "./modules/bills/bills.routes.js";
import healthRoutes from "./modules/health/health.routes.js";

// Connect to the database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
// parse incoming JSON requests
app.use(express.json());
// enable Cross-Origin Resource Sharing (CORS)
app.use(cors());
// Middleware to parse URL-encoded data from incoming requests
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/auth", authRoutes);
app.use("/bills", billsRoutes);
app.use("/health", healthRoutes);

// Error handling
app.use(errorHandler);

// Create User Table If Doesn't Exist and start server
async function init() {
  try {
    await createTables();
    
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  }
}

init();
