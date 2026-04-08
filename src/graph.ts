import { config } from "./config";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0/me";

interface Email {
  id: string;
  subject: string;
  from: string;
  receivedAt: string;
}

interface GraphMessage {
  id: string;
  subject: string;
  receivedDateTime: string;
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

// Build OData filter for a single folder
function buildFilter(): string {
  const domainFilters = config.senderDomains
    .map((d) => `contains(from/emailAddress/address, '${d}')`)
    .join(" or ");

  const keywordFilters = config.subjectKeywords
    .map((k) => `contains(subject, '${k}')`)
    .join(" or ");

  return `((${domainFilters}) or (${keywordFilters}))`;
}

async function graphFetch(
  token: string,
  url: string,
  method: "GET" | "DELETE" = "GET"
): Promise<any> {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Graph API error [${res.status}]: ${body}`);
  }

  if (method === "DELETE") return null;
  return res.json();
}

// Resolve well-known folder name to folder ID
async function getFolderId(token: string, folderName: string): Promise<string | null> {
  try {
    const data = await graphFetch(token, `${GRAPH_BASE}/mailFolders/${folderName}`);
    return data.id ?? null;
  } catch {
    return null;
  }
}

export async function fetchMatchingEmails(token: string): Promise<Email[]> {
  const filter = buildFilter();
  const allEmails: Email[] = [];

  for (const folderName of config.folders) {
    const folderId = await getFolderId(token, folderName);
    if (!folderId) {
      console.log(`  ⚠ Folder "${folderName}" not found, skipping.`);
      continue;
    }

    console.log(`  Scanning folder: ${folderName}...`);
    let pageCount = 0;

    let url: string | undefined =
      `${GRAPH_BASE}/mailFolders/${folderId}/messages` +
      `?$filter=${encodeURIComponent(filter)}` +
      `&$select=id,subject,from,receivedDateTime` +
      `&$top=${config.pageSize}`;

    while (url) {
      const data: GraphResponse = await graphFetch(token, url);

      for (const msg of data.value) {
        allEmails.push({
          id: msg.id,
          subject: msg.subject ?? "(no subject)",
          from: msg.from?.emailAddress?.address ?? "unknown",
          receivedAt: msg.receivedDateTime,
        });
      }

      pageCount++;
      url = data["@odata.nextLink"];

      // Small delay to respect Graph API throttling
      if (url) await sleep(300);
    }

    console.log(`    Found ${allEmails.length} matching emails so far.`);
  }

  return allEmails;
}

export async function deleteEmails(
  token: string,
  emails: Email[],
  onProgress?: (deleted: number, total: number) => void
): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;

  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    try {
      await graphFetch(
        token,
        `${GRAPH_BASE}/messages/${email.id}`,
        "DELETE"
      );
      deleted++;
    } catch (err) {
      failed++;
      console.error(`  ✗ Failed to delete "${email.subject}": ${err}`);
    }

    if (onProgress) onProgress(deleted + failed, emails.length);

    // Throttle: Graph API allows ~4 deletes/sec for personal accounts
    await sleep(250);
  }

  return { deleted, failed };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
