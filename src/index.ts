import { getAccessToken } from "./auth";
import { fetchMatchingEmails, deleteEmails } from "./graph";
import { config } from "./config";
import * as readline from "readline";

const IS_CONFIRM_MODE = process.argv.includes("--confirm");

function printBanner() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║        OUTLOOK PROMO CLEANER             ║");
  console.log(`║  Mode: ${IS_CONFIRM_MODE ? "🗑  PERMANENT DELETE     " : "👀 DRY RUN (preview only)"}  ║`);
  console.log("╚══════════════════════════════════════════╝\n");
}

function printConfig() {
  console.log("── Active filters ───────────────────────────");
  console.log(`  Sender domains : ${config.senderDomains.length} configured`);
  console.log(`  Subject keywords: ${config.subjectKeywords.length} configured`);
  console.log(`  Folders        : ${config.folders.join(", ")}`);
  console.log("─────────────────────────────────────────────\n");
}

function printPreview(emails: { id: string; subject: string; from: string; receivedAt: string }[]) {
  console.log(`\n── Preview (first 10 of ${emails.length}) ──────────────────`);
  emails.slice(0, 10).forEach((e, i) => {
    const date = new Date(e.receivedAt).toLocaleDateString("en-IN");
    console.log(`  ${String(i + 1).padStart(2)}. [${date}] ${e.from}`);
    console.log(`      "${e.subject.substring(0, 70)}${e.subject.length > 70 ? "…" : ""}"`);
  });
  if (emails.length > 10) {
    console.log(`  ... and ${emails.length - 10} more`);
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
  console.log("── Step 2: Scanning inbox ───────────────────");
  const emails = await fetchMatchingEmails(token);

  if (emails.length === 0) {
    console.log("\n✓ No matching emails found. Your inbox is clean!\n");
    process.exit(0);
  }

  printPreview(emails);

  // DRY RUN — just show the count and exit
  if (!IS_CONFIRM_MODE) {
    console.log(`📋 DRY RUN: Would permanently delete ${emails.length} emails.`);
    console.log("   Run with --confirm to actually delete:\n");
    console.log("     npm run delete\n");
    process.exit(0);
  }

  // CONFIRM MODE — ask before deleting
  console.log(`⚠️  You are about to PERMANENTLY delete ${emails.length} emails.`);
  console.log("   This cannot be undone.\n");

  const proceed = await confirm("   Type 'y' to proceed: ");

  if (!proceed) {
    console.log("\n  Aborted. No emails were deleted.\n");
    process.exit(0);
  }

  // Delete
  console.log("\n── Step 3: Deleting ─────────────────────────");
  const { deleted, failed } = await deleteEmails(token, emails, printProgress);

  console.log("\n\n── Done ─────────────────────────────────────");
  console.log(`  ✓ Deleted : ${deleted}`);
  if (failed > 0) console.log(`  ✗ Failed  : ${failed}`);
  console.log("─────────────────────────────────────────────\n");
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message ?? err);
  process.exit(1);
});
