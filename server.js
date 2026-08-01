const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { chromium } = require("playwright");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Home
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Sarthak Screenshot API",
    version: "1.0.0",
    endpoints: {
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
    timestamp: new Date().toISOString()
  });
});

// Screenshot API
app.post("/api/screenshot", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "URL is required"
    });
  }

  let browser;

  try {
    browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage({
      viewport: {
        width: 1366,
        height: 768
      }
    });

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 60000
    });

    const image = await page.screenshot({
      fullPage: true,
      type: "png"
    });

    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(image);

  } catch (err) {

    if (browser) await browser.close();

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
