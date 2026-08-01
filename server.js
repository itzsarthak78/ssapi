const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Home Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sarthak Screenshot API is running 🚀",
    endpoints: [
      "GET /",
      "GET /health",
      "POST /api/screenshot"
    ]
  });
});

// Health Route
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Screenshot Route (Temporary)
app.post("/api/screenshot", async (req, res) => {
  res.json({
    success: true,
    message: "Screenshot endpoint created. Logic will be added next."
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
