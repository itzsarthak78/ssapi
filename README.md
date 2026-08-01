# ssapi
# Sarthak Screenshot API

A simple Screenshot API built with Express and Playwright.

## Endpoints

### GET /

Returns API information.

### GET /health

Returns API health status.

### POST /api/screenshot

Request:

```json
{
  "url": "https://example.com"
}
