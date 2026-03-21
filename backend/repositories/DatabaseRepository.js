import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "../storage/database.json");

function ensureDbFile() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], automations: [], usage: [] }, null, 2), "utf8");
  }
}

export function readDb() {
  ensureDbFile();
  try {
    const data = fs.readFileSync(dbPath, "utf8");
    const parsed = JSON.parse(data);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      automations: Array.isArray(parsed.automations) ? parsed.automations : [],
      usage: Array.isArray(parsed.usage) ? parsed.usage : [],
    };
  } catch (_error) {
    return { users: [], automations: [] };
  }
}

export function writeDb(data) {
  ensureDbFile();
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf8");
}
