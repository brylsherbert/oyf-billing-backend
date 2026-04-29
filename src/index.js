import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import errorHandler from "./middlewares/error-handler.middleware..js";
import createTables from "./data/create-table.js";
import authRoutes from "./modules/auth/auth.routes.js";
import billsRoutes from "./modules/bills/bills.routes.js";
import healthRoutes from "./modules/health/health.routes.js";
import stripeRoutes from "./modules/stripe/stripe.routes.js";
import { stripeWebhookController } from "./modules/stripe/stripe.controller.js";

// Connect to the database
connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
// enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Middleware to parse URL-encoded data from incoming requests
app.use(express.urlencoded({ extended: true }));

// Stripe webhook: raw body is required for signature verification — must run before express.json()
app.post(
  "/stripe/webhook/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookController
);

app.use(express.json());


// Routes
app.use("/auth", authRoutes);
app.use("/bills", billsRoutes);
app.use("/health", healthRoutes);
app.use("/stripe", stripeRoutes);
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
