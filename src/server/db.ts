import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

let db: Database.Database | null = null;

function dbPath() {
  const dataDir = path.join(process.cwd(), ".data");
  fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, "a2a.sqlite");
}

function runMigrations(d: Database.Database) {
  d.pragma("journal_mode = WAL");

  d.exec(`
    create table if not exists tenants (
      id text primary key,
      name text not null,
      created_at text not null
    );

    create table if not exists agent_skus (
      id text primary key,
      name text not null,
      category text not null,
      price_monthly_usd integer not null,
      created_at text not null
    );

    create table if not exists agent_keys (
      id text primary key,
      tenant_id text not null,
      agent_id text not null,
      key_hash text not null,
      created_at text not null,
      revoked_at text,
      foreign key (tenant_id) references tenants(id)
    );

    create table if not exists fleet_agents (
      id text primary key,
      tenant_id text not null,
      sku_id text not null,
      display_name text not null,
      provider text not null,
      status text not null,
      last_handshake_at text,
      created_at text not null,
      foreign key (tenant_id) references tenants(id),
      foreign key (sku_id) references agent_skus(id)
    );

    create table if not exists connections (
      id text primary key,
      tenant_id text not null,
      agent_id text not null,
      provider text not null,
      capabilities_json text not null,
      remote_addr text,
      connected_at text not null,
      last_seen_at text not null,
      disconnected_at text,
      foreign key (tenant_id) references tenants(id)
    );

    create table if not exists traces (
      id text primary key,
      tenant_id text not null,
      created_at text not null,
      root_intent text not null,
      status text not null,
      foreign key (tenant_id) references tenants(id)
    );

    create table if not exists trace_events (
      id text primary key,
      trace_id text not null,
      tenant_id text not null,
      ts text not null,
      direction text not null,
      from_agent text not null,
      to_agent text not null,
      type text not null,
      intent text,
      body_json text not null,
      foreign key (trace_id) references traces(id),
      foreign key (tenant_id) references tenants(id)
    );

    create index if not exists idx_fleet_agents_tenant on fleet_agents(tenant_id);
    create index if not exists idx_connections_tenant on connections(tenant_id);
    create index if not exists idx_traces_tenant on traces(tenant_id, created_at desc);
    create index if not exists idx_trace_events_trace on trace_events(trace_id, ts asc);
  `);
}

export function getDb() {
  if (db) return db;
  db = new Database(dbPath());
  runMigrations(db);
  return db;
}

