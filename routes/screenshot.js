const express = require("express");
const { chromium } = require("playwright");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required"
      });
    }

    const browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage({
      viewport: {
        width: 1280,
        height: 720
      }
    });

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 60000
    });

    const screenshot = await page.screenshot({
      fullPage: true,
      type: "png"
    });

    await browser.close();

    res.setHeader("Content-Type", "image/png");
    res.send(screenshot);

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
