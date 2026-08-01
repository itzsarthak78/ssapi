require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { chromium } = require("playwright");

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan("combined"));
app.use(express.json({ limit: "5mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// API KEY Middleware
app.use((req, res, next) => {

  if (req.path === "/" || req.path === "/health") {
    return next();
  }

  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API key missing."
    });
  }

  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      message: "Invalid API key."
    });
  }

  next();
});

const PORT = process.env.PORT || 3000;

// Home
app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "Sarthak Screenshot API",
    version: "2.0.0",
    author: "Sarthak",
    endpoints: {
      home: "GET /",
      health: "GET /health",
      screenshot: "POST /api/screenshot"
    }
  });
});

// Health
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    node: process.version,
    timestamp: new Date().toISOString()
  });
});

// Screenshot Route
app.post("/api/screenshot", async (req, res) => {

  const {
    url,
    width = 1366,
    height = 768,
    fullPage = true,
    format = "png"
  } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "URL is required."
    });
  }

  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({
      success: false,
      message: "URL must start with http:// or https://"
    });
  }

  let browser;

  try {

    browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage({
      viewport: {
        width: Number(width),
        height: Number(height)
      }
    });

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 60000
    });
        const screenshot = await page.screenshot({
      fullPage: Boolean(fullPage),
      type: format === "jpeg" ? "jpeg" : "png",
      quality: format === "jpeg" ? 90 : undefined
    });

    await browser.close();

    res.setHeader(
      "Content-Type",
      format === "jpeg" ? "image/jpeg" : "image/png"
    );

    return res.send(screenshot);

  } catch (error) {

    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to capture screenshot.",
      error: error.message
    });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found."
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

app.listen(PORT, () => {
  console.log(`
==========================================
🚀 Sarthak Screenshot API Started
==========================================
Server : http://localhost:${PORT}
Health : /health
API    : /api/screenshot
==========================================
`);
});
