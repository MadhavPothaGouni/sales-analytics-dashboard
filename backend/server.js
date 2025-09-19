const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Controllers
const salesController = require("./controllers/salesController");
const customerController = require("./controllers/customerController");
const productController = require("./controllers/productController");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes (directly in server.js)
app.get("/api/sales", salesController.getSales);
app.get("/api/customers", customerController.getCustomers);
app.get("/api/products", productController.getProducts);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ DB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`⚡ Server running on port ${PORT}`);
});
