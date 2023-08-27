const http = require("http");
const fs = require("fs").promises;
const path = require("path");

const host = "localhost";
const port = "8080";

const requestListener = function (req, res) {
  if (req.url === "/" || requestListener.url === "/index.html") {
    fs.readFile("./index.html").then((contents) => {
      res.setHeader("Content-Type", "text/html");
      res.writeHead(200);
      res.end(contents);
    });
  } else {
    fs.readFile(`.${req.url}`).then((contents) => {
      const extension = path.extname(req.url);
      switch (extension) {
        case ".js":
          res.setHeader("Content-Type", "application/javascript");
          break;
        case ".css":
          res.setHeader("Content-Type", "text/css");
          break;
        case ".png":
          res.setHeader("Content-Type", "image/png");
          break;
        case ".ico":
          res.setHeader("Content-Type", "image/webp");
          break;
      }

      res.writeHead(200);
      res.end(contents);
    });
  }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});