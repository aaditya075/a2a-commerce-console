import crypto from "node:crypto";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

function getDb() {
  const dataDir = path.join(process.cwd(), ".data");
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new Database(path.join(dataDir, "a2a.sqlite"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    create table if not exists catalog_products (
      sku text primary key,
      title text not null,
      category text not null,
      price_usd real not null,
      stock integer not null,
      tags text not null
    );
    create table if not exists inventory_reservations (
      id text primary key,
      sku text not null,
      qty integer not null,
      reservation_token text not null unique,
      expires_at text not null,
      created_at text not null
    );
  `);
  return db;
}

function seed(db: Database.Database) {
  const row = db.prepare("select count(*) as c from catalog_products").get() as {
    c: number;
  };
  if (row.c > 0) return;
  const seed = [
    ["TR9-442", "Trail Runner Wide", "footwear", 168, 42, "running,trail,wide-toe"],
    ["JK-120", "City Packable Jacket", "outerwear", 129, 18, "waterproof,travel,lightweight"],
    ["BAG-77", "Everyday Tote Canvas", "bags", 79, 64, "tote,canvas,everyday"],
    ["HD-90", "Noise Soft Headphones", "electronics", 219, 27, "audio,bluetooth,travel"],
  ];
  const insert = db.prepare(
    "insert into catalog_products (sku, title, category, price_usd, stock, tags) values (?, ?, ?, ?, ?, ?)",
  );
  for (const row of seed) insert.run(...row);
}

export function agentSearchCatalog(query: string, maxPrice?: number) {
  const db = getDb();
  seed(db);
  const q = `%${query.toLowerCase()}%`;
  const rows = db
    .prepare(
      `select sku, title, category, price_usd as priceUsd, stock, tags
       from catalog_products
       where lower(title) like ? or lower(tags) like ? or lower(category) like ?`,
    )
    .all(q, q, q) as Array<{
    sku: string;
    title: string;
    category: string;
    priceUsd: number;
    stock: number;
    tags: string;
  }>;
  return rows.filter((r) =>
    typeof maxPrice === "number" ? r.priceUsd <= maxPrice : true,
  );
}

export function agentReserve(sku: string, qty: number, ttlMinutes: number) {
  const db = getDb();
  seed(db);
  const product = db
    .prepare(
      "select sku, title, stock, price_usd as priceUsd from catalog_products where sku = ?",
    )
    .get(sku) as
    | { sku: string; title: string; stock: number; priceUsd: number }
    | undefined;
  if (!product) return { ok: false as const, error: "sku_not_found", sku };
  if (product.stock < qty) {
    return {
      ok: false as const,
      error: "insufficient_stock",
      sku,
      available: product.stock,
    };
  }
  const token = `rsv_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  const tx = db.transaction(() => {
    db.prepare("update catalog_products set stock = stock - ? where sku = ?").run(
      qty,
      sku,
    );
    db.prepare(
      `insert into inventory_reservations
        (id, sku, qty, reservation_token, expires_at, created_at)
        values (?, ?, ?, ?, ?, ?)`,
    ).run(crypto.randomUUID(), sku, qty, token, expiresAt, now);
  });
  tx();
  return {
    ok: true as const,
    sku: product.sku,
    title: product.title,
    qty,
    unitPriceUsd: product.priceUsd,
    reservationToken: token,
    expiresAt,
  };
}
