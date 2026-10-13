// Local stand-in for Vercel: serves the function at http://127.0.0.1:2000/api/v2/execute
//   EXEC_TOKEN=secret node dev-server.js
const http = require("node:http");
const handler = require("./api/v2/execute");

http.createServer((req, res) => {
  const chunks = [];
  req.on("data", (c) => chunks.push(c));
  req.on("end", async () => {
    try { req.body = JSON.parse(Buffer.concat(chunks).toString() || "{}"); } catch { req.body = {}; }
    res.status = (c) => { res.statusCode = c; return res; };
    res.json = (o) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); };
    if (!req.url.startsWith("/api/v2/execute")) return res.status(404).json({ message: "Not found" });
    await handler(req, res);
  });
}).listen(Number(process.env.PORT) || 2000, "127.0.0.1", () => console.log("exec-service dev server on :" + (process.env.PORT || 2000)));
