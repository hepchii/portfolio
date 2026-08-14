const { createServer } = require("node:http");
const { readFile, mkdir } = require("node:fs/promises");
const { existsSync } = require("node:fs");
const { extname, join, normalize } = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const root = __dirname;
const dataDir = join(root, "data");
const dbPath = join(dataDir, "contact.sqlite");
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;

      if (body.length > 10000) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function validateSubmission(input) {
  const name = String(input.name || "").trim();
  const email = String(input.email || "").trim();
  const message = String(input.message || "").trim();
  const errors = {};

  if (name.length < 2 || name.length > 80) {
    errors.name = "Name must be between 2 and 80 characters.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    errors.email = "Enter a valid email address.";
  }

  if (message.length < 10 || message.length > 1000) {
    errors.message = "Message must be between 10 and 1000 characters.";
  }

  return {
    values: { name, email, message },
    errors
  };
}

function getStaticPath(urlPath) {
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = normalize(join(root, decodeURIComponent(requestedPath)));

  if (!filePath.startsWith(root)) {
    return null;
  }

  return filePath;
}

async function start() {
  await mkdir(dataDir, { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const insertContact = db.prepare(`
    INSERT INTO contacts (name, email, message)
    VALUES (?, ?, ?)
  `);

  const server = createServer(async (request, response) => {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "POST" && url.pathname === "/api/contact") {
      try {
        const body = await readBody(request);
        const payload = JSON.parse(body || "{}");
        const { values, errors } = validateSubmission(payload);

        if (Object.keys(errors).length > 0) {
          sendJson(response, 400, {
            message: "Please fix the form fields.",
            errors
          });
          return;
        }

        const result = insertContact.run(values.name, values.email, values.message);

        sendJson(response, 201, {
          message: "Message saved.",
          id: Number(result.lastInsertRowid)
        });
      } catch (error) {
        sendJson(response, 400, {
          message: error.message || "Invalid request."
        });
      }

      return;
    }

    if (request.method !== "GET") {
      sendJson(response, 405, { message: "Method not allowed." });
      return;
    }

    const filePath = getStaticPath(url.pathname);

    if (!filePath || !existsSync(filePath)) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    const content = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream"
    });
    response.end(content);
  });

  server.listen(port, () => {
    console.log(`Portfolio server running at http://localhost:${port}`);
    console.log(`Contact database: ${dbPath}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
