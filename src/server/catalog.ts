import crypto from "node:crypto";
import { getDb } from "@/server/db";

const SEED = [
  {
    sku: "TR9-442",
    title: "Trail Runner Wide",
    category: "footwear",
    priceUsd: 168,
    stock: 42,
    tags: "running,trail,wide-toe",
  },
  {
    sku: "JK-120",
    title: "City Packable Jacket",
    category: "outerwear",
    priceUsd: 129,
    stock: 18,
    tags: "waterproof,travel,lightweight",
  },
  {
    sku: "BAG-77",
    title: "Everyday Tote Canvas",
    category: "bags",
    priceUsd: 79,
    stock: 64,
    tags: "tote,canvas,everyday",
  },
  {
    sku: "HD-90",
    title: "Noise Soft Headphones",
    category: "electronics",
    priceUsd: 219,
    stock: 27,
    tags: "audio,bluetooth,travel",
  },
];

export function seedCatalogIfEmpty() {
  const db = getDb();
  const row = db.prepare("select count(*) as c from catalog_products").get() as {
    c: number;
  };
  if (row.c > 0) return;
  const insert = db.prepare(
    `insert into catalog_products (sku, title, category, price_usd, stock, tags)
     values (?, ?, ?, ?, ?, ?)`,
  );
  for (const p of SEED) {
    insert.run(p.sku, p.title, p.category, p.priceUsd, p.stock, p.tags);
  }
}

export function searchCatalog(query: string, maxPrice?: number) {
  seedCatalogIfEmpty();
  const db = getDb();
  const q = `%${query.toLowerCase()}%`;
  const rows = db
    .prepare(
      `select sku, title, category, price_usd as priceUsd, stock, tags
       from catalog_products
       where lower(title) like ? or lower(tags) like ? or lower(category) like ?
       order by price_usd asc`,
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

export function listCatalog() {
  seedCatalogIfEmpty();
  const db = getDb();
  return db
    .prepare(
      `select sku, title, category, price_usd as priceUsd, stock, tags
       from catalog_products order by title asc`,
    )
    .all() as Array<{
    sku: string;
    title: string;
    category: string;
    priceUsd: number;
    stock: number;
    tags: string;
  }>;
}

export function reserveInventory(input: {
  sku: string;
  qty: number;
  ttlMinutes: number;
}) {
  seedCatalogIfEmpty();
  const db = getDb();
  const product = db
    .prepare(
      "select sku, title, stock, price_usd as priceUsd from catalog_products where sku = ?",
    )
    .get(input.sku) as
    | { sku: string; title: string; stock: number; priceUsd: number }
    | undefined;

  if (!product) {
    return { ok: false as const, error: "sku_not_found", sku: input.sku };
  }
  if (product.stock < input.qty) {
    return {
      ok: false as const,
      error: "insufficient_stock",
      sku: input.sku,
      available: product.stock,
    };
  }

  const token = `rsv_${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + input.ttlMinutes * 60 * 1000,
  ).toISOString();

  const tx = db.transaction(() => {
    db.prepare("update catalog_products set stock = stock - ? where sku = ?").run(
      input.qty,
      input.sku,
    );
    db.prepare(
      `insert into inventory_reservations
        (id, sku, qty, reservation_token, expires_at, created_at)
        values (?, ?, ?, ?, ?, ?)`,
    ).run(crypto.randomUUID(), input.sku, input.qty, token, expiresAt, now);
  });
  tx();

  return {
    ok: true as const,
    sku: product.sku,
    title: product.title,
    qty: input.qty,
    unitPriceUsd: product.priceUsd,
    reservationToken: token,
    expiresAt,
  };
}
