const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Controllers
const { getSales, addSale } = require("./controllers/salesController");

// Routes
app.get("/api/sales", getSales);
app.post("/api/sales", addSale);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`⚡ Server running on port ${PORT}`);
});

// Socket.io
const io = require("socket.io")(server, { cors: { origin: "*" } });
app.set("io", io);

io.on("connection", (socket) => {
  console.log("🔌 New client connected");
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected");
  });
});

// Serve React frontend
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(frontendPath));

  // Catch-all route for React (works in Express 4.x)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next(); // skip API calls
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}
