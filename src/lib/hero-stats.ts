import { promises as fs } from "node:fs";
import path from "node:path";

type HeroStatsStore = {
  totalViews: number;
  activeSessions: Record<string, number>;
  seenSessions: Record<string, number>;
};

export type HeroStatsSnapshot = {
  totalViews: number;
  liveViewers: number;
};

const STORE_PATH = path.join(process.cwd(), "tmp", "hero-stats.json");
const ACTIVE_WINDOW_MS = 45_000;
const SEEN_RETENTION_MS = 365 * 24 * 60 * 60 * 1000;
const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const UPSTASH_ACTIVE_KEY = "portfolio:hero:active";
const UPSTASH_TOTAL_KEY = "portfolio:hero:total_views";
const UPSTASH_SEEN_PREFIX = "portfolio:hero:seen:";
const HAS_UPSTASH = Boolean(UPSTASH_URL && UPSTASH_TOKEN);

let writeQueue: Promise<HeroStatsSnapshot> = Promise.resolve({
  totalViews: 0,
  liveViewers: 0,
});

const defaultStore = (): HeroStatsStore => ({
  totalViews: 0,
  activeSessions: {},
  seenSessions: {},
});

async function ensureStoreFile() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  try {
    await fs.access(STORE_PATH);
  } catch {
    await fs.writeFile(STORE_PATH, JSON.stringify(defaultStore(), null, 2), "utf8");
  }
}

async function readStore() {
  await ensureStoreFile();
  const raw = await fs.readFile(STORE_PATH, "utf8");
  const parsed = JSON.parse(raw) as Partial<HeroStatsStore>;

  return {
    totalViews: parsed.totalViews ?? 0,
    activeSessions: parsed.activeSessions ?? {},
    seenSessions: parsed.seenSessions ?? {},
  } satisfies HeroStatsStore;
}

async function writeStore(store: HeroStatsStore) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function pruneStore(store: HeroStatsStore, now: number) {
  for (const [sessionId, lastSeen] of Object.entries(store.activeSessions)) {
    if (now - lastSeen > ACTIVE_WINDOW_MS) {
      delete store.activeSessions[sessionId];
    }
  }

  for (const [sessionId, firstSeen] of Object.entries(store.seenSessions)) {
    if (now - firstSeen > SEEN_RETENTION_MS) {
      delete store.seenSessions[sessionId];
    }
  }
}

function toSnapshot(store: HeroStatsStore): HeroStatsSnapshot {
  return {
    totalViews: store.totalViews,
    liveViewers: Object.keys(store.activeSessions).length,
  };
}

function getUpstashHeaders() {
  return {
    Authorization: `Bearer ${UPSTASH_TOKEN}`,
  };
}

async function runUpstashCommand<T>(...parts: Array<string | number>) {
  if (!UPSTASH_URL) {
    throw new Error("Upstash URL missing");
  }

  const commandPath = parts.map((part) => encodeURIComponent(String(part))).join("/");
  const response = await fetch(`${UPSTASH_URL}/${commandPath}`, {
    method: "POST",
    headers: getUpstashHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed: ${response.status}`);
  }

  const payload = (await response.json()) as { result?: T; error?: string };
  if (payload.error) {
    throw new Error(payload.error);
  }

  return payload.result as T;
}

async function pruneUpstashActiveSessions(now: number) {
  await runUpstashCommand("ZREMRANGEBYSCORE", UPSTASH_ACTIVE_KEY, 0, now - ACTIVE_WINDOW_MS);
}

async function getUpstashSnapshot(now = Date.now()) {
  await pruneUpstashActiveSessions(now);

  const [totalViewsRaw, liveViewersRaw] = await Promise.all([
    runUpstashCommand<string | null>("GET", UPSTASH_TOTAL_KEY),
    runUpstashCommand<number>("ZCARD", UPSTASH_ACTIVE_KEY),
  ]);

  return {
    totalViews: Number(totalViewsRaw ?? 0),
    liveViewers: Number(liveViewersRaw ?? 0),
  } satisfies HeroStatsSnapshot;
}

async function registerUpstashSession(sessionId: string, trackView: boolean) {
  const now = Date.now();
  await pruneUpstashActiveSessions(now);

  if (trackView) {
    const firstSeen = await runUpstashCommand<string | null>(
      "SET",
      `${UPSTASH_SEEN_PREFIX}${sessionId}`,
      "1",
      "EX",
      Math.floor(SEEN_RETENTION_MS / 1000),
      "NX"
    );

    if (firstSeen === "OK") {
      await runUpstashCommand<number>("INCR", UPSTASH_TOTAL_KEY);
    }
  }

  await runUpstashCommand<number>("ZADD", UPSTASH_ACTIVE_KEY, now, sessionId);
  return getUpstashSnapshot(now);
}

async function getFileSnapshot() {
  const store = await readStore();
  pruneStore(store, Date.now());
  await writeStore(store);
  return toSnapshot(store);
}

async function registerFileSession(sessionId: string, trackView: boolean) {
  writeQueue = writeQueue.then(async () => {
    const now = Date.now();
    const store = await readStore();

    pruneStore(store, now);

    if (trackView && !store.seenSessions[sessionId]) {
      store.totalViews += 1;
      store.seenSessions[sessionId] = now;
    }

    store.activeSessions[sessionId] = now;

    await writeStore(store);
    return toSnapshot(store);
  });

  return writeQueue;
}

export async function getHeroStatsSnapshot() {
  if (HAS_UPSTASH) {
    return getUpstashSnapshot();
  }

  return getFileSnapshot();
}

export async function registerHeroSession(sessionId: string, trackView: boolean) {
  if (HAS_UPSTASH) {
    return registerUpstashSession(sessionId, trackView);
  }

  return registerFileSession(sessionId, trackView);
}
