import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

let db: Database.Database | null = null;

export function getGatewayDb() {
  if (db) return db;
  const dataDir = path.join(process.cwd(), ".data");
  fs.mkdirSync(dataDir, { recursive: true });
  const file = path.join(dataDir, "a2a.sqlite");
  db = new Database(file);
  db.pragma("journal_mode = WAL");
  return db;
}

