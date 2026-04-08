// ============================================================
//  config.ts — EDIT THIS FILE to add your own filters
// ============================================================

export const config = {

  // -----------------------------------------------------------
  // ADD / REMOVE sender domains here
  // Script deletes emails where the sender's email ends with
  // any of these domains (case-insensitive)
  // -----------------------------------------------------------
  senderDomains: [
    "hdfcbank.com",
    "axisbank.com",
    "icicibank.com",
    "sbicard.com",
    "kotakbank.com",
    "yesbank.in",
    "indusind.com",
    "aubank.in",
    "citibank.com",
    "amexnetwork.com",
    "digital.axisbankmail.bank.in",
    "mail.reliancedigital.in",
    "follow-suggestions@mail.instagram.com",
    "standardcharteredbulletin@sc.com",
    "sahilist@substack.com",
    "mail.instagram.com",
    "creditreport+ratealert@bankbazaar.com",
    "statements@transactions.indmoney.com",
    "updates.indmoney.com",
    "info@digital.axisbankmail.bank.in",
    "customerawareness@irctc.co.in"
    // ---- ADD YOUR OWN BELOW ----
    // "paytmbank.com",
    // "federalbank.co.in",
  ],

  // -----------------------------------------------------------
  // ADD / REMOVE subject keywords here
  // Script deletes emails whose subject contains ANY of these
  // words (case-insensitive, partial match)
  // -----------------------------------------------------------
  subjectKeywords: [
    "cashback",
    "reward",
    "credit limit",
    "emi",
    "pre-approved",
    "exclusive",
    "upgrade",
    "spend",
    "win",
    "earn",
    "bonus",
    "discount",
    "deal",
    // ---- ADD YOUR OWN BELOW ----
    // "statement",
    // "due date",
  ],

  // -----------------------------------------------------------
  // Folders to scan — "inbox" covers your main inbox
  // Add "junkemail" to also clean Junk/Spam folder
  // -----------------------------------------------------------
  folders: ["inbox", "junkemail"],

  // -----------------------------------------------------------
  // How many emails to fetch per API page (max 100 per Graph API)
  // -----------------------------------------------------------
  pageSize: 100,

  // -----------------------------------------------------------
  // Azure App credentials — fill these after Azure setup
  // See README.md for step-by-step instructions
  // -----------------------------------------------------------
  azure: {
    clientId: "",      // From Azure App Registration
    tenantId: "consumers",                 // Keep as "consumers" for personal accounts
    redirectUri: "http://localhost:3000/callback",
  },
};
