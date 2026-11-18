import { config } from "./config";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0/me";

export interface Email {
  id: string;
  subject: string;
  from: string;
  receivedAt: string;
  folder: string;
  matchedRule: string;
  isRead: boolean;
}

interface GraphMessage {
  id: string;
  subject: string;
  receivedDateTime: string;
  isRead: boolean;
  from?: {
    emailAddress?: {
      address?: string;
    };
  };
}

interface GraphResponse {
  value: GraphMessage[];
  "@odata.nextLink"?: string;
}

// ----------------------------------------------------------------
// Client-side matching — avoids Graph API OData filter length
// limits (the $filter URL blows up with 90+ domains/keywords).
// We fetch all messages and match locally instead.
// ----------------------------------------------------------------
function matchesFilters(from: string, subject: string): boolean {
  const lFrom = from.toLowerCase();
  const lSubject = subject.toLowerCase();

  for (const d of config.senderDomains) {
    if (lFrom.includes(d.toLowerCase())) return true;
  }
  for (const k of config.subjectKeywords) {
    if (lSubject.includes(k.toLowerCase())) return true;
  }
  return false;
}

// ----------------------------------------------------------------
// Determine which rule matched (for display)
// ----------------------------------------------------------------
function whichRule(from: string, subject: string): string {
  const lFrom = from.toLowerCase();
  const lSubject = subject.toLowerCase();

  for (const d of config.senderDomains) {
    if (lFrom.includes(d.toLowerCase())) return `domain:${d}`;
  }
  for (const k of config.subjectKeywords) {
    if (lSubject.includes(k.toLowerCase())) return `keyword:${k}`;
  }
  return "age-only";
}

// ----------------------------------------------------------------
// Core fetch helper
// ----------------------------------------------------------------
async function graphFetch(
  token: string,
  url: string,
  method: "GET" | "POST" | "DELETE" = "GET",
  body?: object
): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph API error [${res.status}]: ${text}`);
  }

  if (method === "DELETE") return null;
  return res.json();
}

// ----------------------------------------------------------------
// Resolve well-known folder name → folder ID
// ----------------------------------------------------------------
async function getFolderId(token: string, folderName: string): Promise<string | null> {
  try {
    const data = await graphFetch(token, `${GRAPH_BASE}/mailFolders/${folderName}`);
    return data.id ?? null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------
// Get the Deleted Items folder ID (used for soft-delete / move)
// ----------------------------------------------------------------
async function getDeletedItemsFolderId(token: string): Promise<string> {
  const data = await graphFetch(token, `${GRAPH_BASE}/mailFolders/deleteditems`);
  return data.id;
}

// ----------------------------------------------------------------
// Age filter — returns true when the email is old enough to delete
// ----------------------------------------------------------------
function isOldEnough(receivedAt: string): boolean {
  if (!config.olderThanDays || config.olderThanDays <= 0) return true;
  const cutoff = Date.now() - config.olderThanDays * 24 * 60 * 60 * 1000;
  return new Date(receivedAt).getTime() < cutoff;
}

// ----------------------------------------------------------------
// Fetch all matching emails across configured folders
// ----------------------------------------------------------------
export async function fetchMatchingEmails(token: string): Promise<Email[]> {
  const allEmails: Email[] = [];

  for (const folderName of config.folders) {
    const folderId = await getFolderId(token, folderName);
    if (!folderId) {
      console.log(`  ⚠ Folder "${folderName}" not found, skipping.`);
      continue;
    }

    console.log(`  Scanning folder: ${folderName}...`);

    // No domain/$keyword $filter — match client-side to avoid OData URL length limits.
    // isRead is a simple equality filter so it's safe to send server-side.
    const readFilter = config.unreadOnly ? "?$filter=isRead eq false" : "?";
    let url: string | undefined =
      `${GRAPH_BASE}/mailFolders/${folderId}/messages` +
      readFilter +
      `&$select=id,subject,from,receivedDateTime,isRead` +
      `&$top=${config.pageSize}` +
      `&$orderby=receivedDateTime asc`;

    let folderCount = 0;
    let pageCount = 0;

    while (url) {
      const data: GraphResponse = await graphFetch(token, url);
      pageCount++;

      for (const msg of data.value) {
        const receivedAt = msg.receivedDateTime;
        if (!isOldEnough(receivedAt)) continue;

        const from = msg.from?.emailAddress?.address ?? "unknown";
        const subject = msg.subject ?? "(no subject)";

        if (!matchesFilters(from, subject)) continue;

        allEmails.push({
          id: msg.id,
          subject,
          from,
          receivedAt,
          folder: folderName,
          matchedRule: whichRule(from, subject),
          isRead: msg.isRead ?? true,
        });
        folderCount++;
      }

      url = data["@odata.nextLink"];
      if (url) await sleep(300);
    }

    console.log(`    └─ ${folderCount} matching emails in "${folderName}" (${pageCount} page(s) scanned).`);
  }

  return allEmails;
}

// ----------------------------------------------------------------
// Delete or soft-delete emails with configurable concurrency
// ----------------------------------------------------------------
export async function deleteEmails(
  token: string,
  emails: Email[],
  softDelete: boolean,
  onProgress?: (done: number, total: number) => void
): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;
  let deletedItemsFolderId: string | null = null;

  if (softDelete) {
    deletedItemsFolderId = await getDeletedItemsFolderId(token);
  }

  const concurrency = Math.max(1, Math.min(config.deleteConcurrency ?? 2, 4));
  const semaphore = new Semaphore(concurrency);

  const tasks = emails.map((email) =>
    semaphore.run(async () => {
      try {
        if (softDelete && deletedItemsFolderId) {
          // Move to Deleted Items
          await graphFetch(
            token,
            `${GRAPH_BASE}/messages/${email.id}/move`,
            "POST",
            { destinationId: deletedItemsFolderId }
          );
        } else {
          // Hard delete (permanent)
          await graphFetch(token, `${GRAPH_BASE}/messages/${email.id}`, "DELETE");
        }
        deleted++;
      } catch (err) {
        failed++;
        console.error(`\n  ✗ Failed: "${email.subject.substring(0, 60)}": ${err}`);
      }

      if (onProgress) onProgress(deleted + failed, emails.length);

      // Per-request throttle (Graph API: ~4 req/sec for personal accounts)
      await sleep(Math.ceil(1000 / (concurrency * 4)));
    })
  );

  await Promise.all(tasks);
  return { deleted, failed };
}

// ----------------------------------------------------------------
// Simple semaphore for concurrency control
// ----------------------------------------------------------------
class Semaphore {
  private permits: number;
  private queue: Array<() => void> = [];

  constructor(permits: number) {
    this.permits = permits;
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      return Promise.resolve();
    }
    return new Promise((resolve) => this.queue.push(resolve));
  }

  private release(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next();
    } else {
      this.permits++;
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
