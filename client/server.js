import http from "http";
import { promises as fs } from "fs";
import path from "path";

const host = "0.0.0.0";
const port = "8080";

const requestListener = async function (req, res) {
  console.log("request", req.url);

  try {
    // Default to index.html for root path
    if (req.url === "/" || req.url === "/index.html") {
      const contents = await fs.readFile("./public/index.html");
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(contents);
      return;
    }

    // Handle favicon.ico requests
    if (req.url === "/favicon.ico") {
      res.writeHead(204); // No content
      res.end();
      return;
    }

    const parsedUrl = path.parse(req.url);
    let filePath = `.${req.url.split("?")[0]}`;

    // Map URL paths to actual file locations
    if (filePath.startsWith('./styles.css')) {
      filePath = './public/styles.css';
    } else if (filePath.startsWith('./src/')) {
      // Already correct path
    } else if (filePath.startsWith('./assets/')) {
      // Already correct path
    } else {
      // Check if file is in assets directory
      const assetExtensions = [".png", ".mp3", ".ico"];
      if (assetExtensions.includes(parsedUrl.ext)) {
        const assetPath = path.join("assets", parsedUrl.base);
        // Try assets folder first, fallback to root if not found
        try {
          await fs.access(assetPath);
          filePath = assetPath;
        } catch {
          // Keep original path if not found in assets
        }
      }
    }

    const contents = await fs.readFile(filePath);

    // Set appropriate content type
    const contentTypes = {
      ".js": "application/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".ico": "image/x-icon",
      ".json": "application/json",
      ".mp3": "audio/mpeg",
    };

    const contentType =
      contentTypes[parsedUrl.ext] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.writeHead(200);
    res.end(contents);
  } catch (err) {
    console.error(`Error handling request for ${req.url}:`, err);
    res.writeHead(404);
    res.end("Not found");
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
