import { getAccessToken } from "./auth";
import { fetchMatchingEmails, deleteEmails, Email } from "./graph";
import { config } from "./config";
import * as readline from "readline";

const IS_CONFIRM_MODE = process.argv.includes("--confirm");
// --hard-delete overrides config.softDelete → permanently removes emails
const IS_HARD_DELETE  = process.argv.includes("--hard-delete");
const SOFT_DELETE = IS_HARD_DELETE ? false : config.softDelete;

function printBanner() {
  let modeLabel: string;
  if (!IS_CONFIRM_MODE) {
    modeLabel = "👀 DRY RUN (preview only) ";
  } else if (SOFT_DELETE) {
    modeLabel = "🗂  MOVE TO TRASH         ";
  } else {
    modeLabel = "🗑  PERMANENT DELETE      ";
  }

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║       OUTLOOK MAIL CLEANER  v2           ║");
  console.log(`║  Mode: ${modeLabel} ║`);
  console.log("╚══════════════════════════════════════════╝\n");
}

function printConfig() {
  console.log("── Active filters ───────────────────────────");
  console.log(`  Sender domains  : ${config.senderDomains.length} configured`);
  console.log(`  Subject keywords: ${config.subjectKeywords.length} configured`);
  console.log(`  Folders         : ${config.folders.join(", ")}`);
  if (config.unreadOnly) {
    console.log(`  Unread only     : ✓ (read emails will be skipped)`);
  }
  if (config.olderThanDays > 0) {
    console.log(`  Age filter      : older than ${config.olderThanDays} days`);
  }
  console.log(`  Delete mode     : ${SOFT_DELETE ? "soft (move to Deleted Items)" : "hard (permanent)"}`);
  console.log("─────────────────────────────────────────────\n");
}

function printPreview(emails: Email[]) {
  console.log(`\n── Preview (first 15 of ${emails.length}) ──────────────────`);
  emails.slice(0, 15).forEach((e, i) => {
    const date = new Date(e.receivedAt).toLocaleDateString("en-IN");
    console.log(`  ${String(i + 1).padStart(2)}. [${date}] [${e.folder}] ${e.from}`);
    console.log(`      "${e.subject.substring(0, 72)}${e.subject.length > 72 ? "…" : ""}"`);
    console.log(`      ↳ matched: ${e.matchedRule}`);
  });
  if (emails.length > 15) {
    console.log(`  ... and ${emails.length - 15} more`);
  }
  console.log("─────────────────────────────────────────────");
}

function printBreakdown(emails: Email[]) {
  // By folder
  const byFolder: Record<string, number> = {};
  for (const e of emails) byFolder[e.folder] = (byFolder[e.folder] ?? 0) + 1;

  // Top 5 sender domains
  const byDomain: Record<string, number> = {};
  for (const e of emails) {
    const domain = e.from.split("@")[1] ?? e.from;
    byDomain[domain] = (byDomain[domain] ?? 0) + 1;
  }
  const topDomains = Object.entries(byDomain)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top 5 matched rules
  const byRule: Record<string, number> = {};
  for (const e of emails) byRule[e.matchedRule] = (byRule[e.matchedRule] ?? 0) + 1;
  const topRules = Object.entries(byRule)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  console.log("\n── Breakdown ────────────────────────────────");

  console.log("  By folder:");
  for (const [folder, count] of Object.entries(byFolder)) {
    console.log(`    ${folder.padEnd(16)} ${count}`);
  }

  console.log("  Top senders:");
  for (const [domain, count] of topDomains) {
    console.log(`    ${domain.padEnd(32)} ${count}`);
  }

  console.log("  Top matched rules:");
  for (const [rule, count] of topRules) {
    console.log(`    ${rule.padEnd(36)} ${count}`);
  }

  console.log("─────────────────────────────────────────────\n");
}

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

function printProgress(done: number, total: number) {
  const pct = Math.round((done / total) * 100);
  const bar = "█".repeat(Math.floor(pct / 5)) + "░".repeat(20 - Math.floor(pct / 5));
  process.stdout.write(`\r  [${bar}] ${pct}% (${done}/${total})`);
}

async function main() {
  printBanner();
  printConfig();

  // Validate config
  if (!config.azure.clientId || config.azure.clientId === "YOUR_CLIENT_ID_HERE") {
    console.error("❌  ERROR: You haven't set your Azure clientId in src/config.ts");
    console.error("    See README.md for setup instructions.\n");
    process.exit(1);
  }

  // Authenticate
  console.log("── Step 1: Authenticate ─────────────────────");
  const token = await getAccessToken();

  // Fetch matching emails
  console.log("── Step 2: Scanning folders ─────────────────");
  const emails = await fetchMatchingEmails(token);

  if (emails.length === 0) {
    console.log("\n✓ No matching emails found. Your inbox is clean!\n");
    process.exit(0);
  }

  printPreview(emails);
  printBreakdown(emails);

  // DRY RUN — just show the count and exit
  if (!IS_CONFIRM_MODE) {
    const action = SOFT_DELETE ? "move to Deleted Items" : "permanently delete";
    console.log(`📋 DRY RUN: Would ${action} ${emails.length} emails.`);
    console.log("   Run with --confirm to actually clean:\n");
    console.log("     npm run delete          # soft-delete (move to trash)");
    console.log("     npm run hard-delete     # permanently remove\n");
    process.exit(0);
  }

  // CONFIRM MODE — ask before acting
  const action = SOFT_DELETE ? "move to Deleted Items" : "PERMANENTLY delete";
  console.log(`⚠️  You are about to ${action} ${emails.length} emails.`);
  if (!SOFT_DELETE) console.log("   This cannot be undone.\n");
  else console.log("   They can be recovered from Deleted Items within 30 days.\n");

  const proceed = await confirm("   Type 'y' to proceed: ");

  if (!proceed) {
    console.log("\n  Aborted. No emails were modified.\n");
    process.exit(0);
  }

  // Execute
  console.log(`\n── Step 3: ${SOFT_DELETE ? "Moving to trash" : "Deleting"} ──────────────────────`);
  const { deleted, failed } = await deleteEmails(token, emails, SOFT_DELETE, printProgress);

  const verb = SOFT_DELETE ? "Moved  " : "Deleted";
  console.log("\n\n── Done ─────────────────────────────────────");
  console.log(`  ✓ ${verb}: ${deleted}`);
  if (failed > 0) console.log(`  ✗ Failed : ${failed}`);
  if (SOFT_DELETE) console.log("  💡 Review them in Deleted Items, then empty the folder to free space.");
  console.log("─────────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message ?? err);
  process.exit(1);
});
