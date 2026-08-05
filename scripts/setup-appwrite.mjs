/**
 * Creates Appwrite DB + tables for Dopamine Arena (Appwrite 1.8.x).
 * Usage: npm run setup:appwrite
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env.local");
  const env = { ...process.env };
  try {
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#") || !t.includes("=")) continue;
      const i = t.indexOf("=");
      env[t.slice(0, i)] = t.slice(i + 1);
    }
  } catch {
    /* optional */
  }
  return env;
}

const env = loadEnv();
const endpoint = env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = env.API_KEY || env.APPWRITE_API_KEY;
const databaseId = env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "dopamine_arena";
const playersTableId = env.NEXT_PUBLIC_APPWRITE_PLAYERS_TABLE_ID || "players";
const betsTableId = env.NEXT_PUBLIC_APPWRITE_BETS_TABLE_ID || "bets";

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing NEXT_PUBLIC_APPWRITE_* or API_KEY in .env.local");
  process.exit(1);
}

async function api(method, path, body) {
  const res = await fetch(`${endpoint}${path}`, {
    method,
    headers: {
      "X-Appwrite-Project": projectId,
      "X-Appwrite-Key": apiKey,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = new Error(data.message || res.statusText);
    err.code = data.code || res.status;
    err.type = data.type;
    throw err;
  }
  return data;
}

async function sleep(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

async function ensureDatabase() {
  try {
    await api("GET", `/databases/${databaseId}`);
    console.log(`✓ Database exists: ${databaseId}`);
  } catch {
    await api("POST", "/databases", {
      databaseId,
      name: "Dopamine Arena",
    });
    console.log(`✓ Database created: ${databaseId}`);
  }
}

async function ensureCollection(id, name, permissions) {
  try {
    await api("GET", `/databases/${databaseId}/collections/${id}`);
    console.log(`✓ Table exists: ${id}`);
    return false;
  } catch {
    await api("POST", `/databases/${databaseId}/collections`, {
      collectionId: id,
      name,
      permissions,
      documentSecurity: true,
      enabled: true,
    });
    console.log(`✓ Table created: ${id}`);
    return true;
  }
}

async function ensureAttribute(collectionId, kind, payload) {
  const list = await api(
    "GET",
    `/databases/${databaseId}/collections/${collectionId}/attributes`,
  );
  if (list.attributes?.some((a) => a.key === payload.key)) {
    console.log(`  · column exists: ${collectionId}.${payload.key}`);
    return;
  }
  await api(
    "POST",
    `/databases/${databaseId}/collections/${collectionId}/attributes/${kind}`,
    payload,
  );
  console.log(`  · column created: ${collectionId}.${payload.key}`);
}

async function waitAttributes(collectionId, keys) {
  for (let i = 0; i < 20; i++) {
    const list = await api(
      "GET",
      `/databases/${databaseId}/collections/${collectionId}/attributes`,
    );
    const map = Object.fromEntries(
      (list.attributes || []).map((a) => [a.key, a.status]),
    );
    if (keys.every((k) => map[k] === "available")) return;
    await sleep(500);
  }
  throw new Error(`Attributes not ready on ${collectionId}`);
}

async function ensureIndex(collectionId, key, type, attributes, orders) {
  const list = await api(
    "GET",
    `/databases/${databaseId}/collections/${collectionId}/indexes`,
  );
  if (list.indexes?.some((i) => i.key === key)) {
    console.log(`  · index exists: ${collectionId}.${key}`);
    return;
  }
  await api("POST", `/databases/${databaseId}/collections/${collectionId}/indexes`, {
    key,
    type,
    attributes,
    ...(orders ? { orders } : {}),
  });
  console.log(`  · index created: ${collectionId}.${key}`);
}

async function main() {
  console.log(`Setting up Appwrite @ ${endpoint} / ${projectId}`);
  await ensureDatabase();

  await ensureCollection(playersTableId, "Players", [
    'create("users")',
    'read("users")',
    'update("users")',
  ]);
  await ensureAttribute(playersTableId, "string", {
    key: "userId",
    size: 64,
    required: true,
    array: false,
  });
  await ensureAttribute(playersTableId, "string", {
    key: "displayName",
    size: 128,
    required: true,
    array: false,
  });
  await ensureAttribute(playersTableId, "float", {
    key: "balance",
    required: true,
    min: 0,
    array: false,
  });
  await waitAttributes(playersTableId, ["userId", "displayName", "balance"]);
  await ensureIndex(playersTableId, "userId_idx", "unique", ["userId"]);

  await ensureCollection(betsTableId, "Bets", [
    'create("users")',
    'read("any")',
  ]);
  for (const [kind, payload] of [
    ["string", { key: "userId", size: 64, required: true, array: false }],
    ["string", { key: "displayName", size: 128, required: true, array: false }],
    ["string", { key: "game", size: 64, required: true, array: false }],
    ["float", { key: "bet", required: true, min: 0, array: false }],
    ["float", { key: "multi", required: true, min: 0, array: false }],
    ["float", { key: "payout", required: true, min: 0, array: false }],
    ["boolean", { key: "isWin", required: true, array: false }],
  ]) {
    await ensureAttribute(betsTableId, kind, payload);
  }
  await waitAttributes(betsTableId, [
    "userId",
    "displayName",
    "game",
    "bet",
    "multi",
    "payout",
    "isWin",
  ]);
  await ensureIndex(betsTableId, "created_idx", "key", ["$createdAt"], ["DESC"]);

  console.log("Done. Anonymous auth is already enabled on this project.");
}

main().catch((err) => {
  console.error("Setup failed:", err.message || err);
  process.exit(1);
});
