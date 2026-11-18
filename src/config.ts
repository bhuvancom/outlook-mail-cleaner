// ============================================================
//  config.ts — EDIT THIS FILE to add your own filters
// ============================================================

export const config = {

  // -----------------------------------------------------------
  // ADD / REMOVE sender domains here.
  // Matches if the sender address CONTAINS any of these strings
  // (case-insensitive). Can be a full domain, subdomain, or
  // even a specific email address.
  // -----------------------------------------------------------
  senderDomains: [
    // ── Indian banks & cards ────────────────────────────────
    "hdfcbank.com",
    "axisbank.com",
    "icicibank.com",
    "sbicard.com",
    "sbi.co.in",
    "kotakbank.com",
    "yesbank.in",
    "indusind.com",
    "aubank.in",
    "federalbank.co.in",
    "pnbindia.in",
    "canarabank.in",
    "unionbankofindia.co.in",
    "bankofbaroda.in",
    "idbibank.com",
    "idfcfirstbank.com",
    "rblbank.com",
    "bandhanbank.com",
    "jkbank.com",
    "southindianbank.com",
    "karurvysyabank.com",
    "dcbbank.com",
    "ujjivansfb.in",
    "fincare.in",

    // ── International banks & cards ─────────────────────────
    "citibank.com",
    "amexnetwork.com",
    "americanexpress.com",
    "sc.com",
    "standardchartered.com",
    "standardcharteredbulletin@sc.com",
    "hsbc.co.in",
    "dbs.com",

    // ── Payments, wallets & fintech ─────────────────────────
    "paytm.com",
    "paytmbank.com",
    "phonepe.com",
    "googlepay.com",
    "mobikwik.com",
    "freecharge.com",
    "razorpay.com",
    "instamojo.com",
    "slice.is",
    "lazycard.in",
    "uni.cards",

    // ── Investment & insurance ───────────────────────────────
    "zerodha.com",
    "reportsmailer.zerodha.net",
    "groww.in",
    "angelone.in",
    "upstox.com",
    "icicidirect.com",
    "hdfcsec.com",
    "sbisecurities.in",
    "kotaksecurities.com",
    "reliancenippon.com",
    "hdfclife.com",
    "icicipruli.com",
    "licindia.in",
    "maxlifeinsurance.com",
    "bajajallianz.co.in",
    "newindia.co.in",
    "policyholders.gov.in",
    "policybazaar.com",
    "coverfox.com",

    // ── Financial aggregators & credit score ─────────────────
    "bankbazaar.com",
    "creditreport+ratealert@bankbazaar.com",
    "paisabazaar.com",
    "cibil.com",
    "experian.in",
    "crif.com",
    "indmoney.com",
    "statements@transactions.indmoney.com",
    "updates.indmoney.com",

    // ── E-commerce ───────────────────────────────────────────
    "amazon.in",
    "flipkart.com",
    "myntra.com",
    "ajio.com",
    "nykaa.com",
    "snapdeal.com",
    "shopclues.com",
    "meesho.com",
    "jiomart.com",
    "bigbasket.com",
    "blinkit.com",
    "swiggy.in",
    "zomato.com",
    "mamaearth.in",
    "manyavar.com",
    "firstcry.com",
    "pepperfry.com",
    "urban ladder.com",
    "croma.com",
    "reliancedigital.in",
    "mail.reliancedigital.in",
    "vijaysales.com",

    // ── Travel & hospitality ─────────────────────────────────
    "makemytrip.com",
    "goibibo.com",
    "yatra.com",
    "cleartrip.com",
    "irctc.co.in",
    "customerawareness@irctc.co.in",
    "booking.com",
    "hotels.com",
    "airbnb.com",
    "expedia.com",
    "indigo.in",
    "airindia.com",
    "spicejet.com",
    "akasaair.com",
    "vistara.com",
    "redbus.in",
    "ola.money",
    "uber.com",
    "rapido.bike",

    // ── Telecom ──────────────────────────────────────────────
    "jio.com",
    "airtel.com",
    "vi.in",
    "vodafoneidea.com",
    "bsnl.co.in",

    // ── Utilities & government ───────────────────────────────
    "mahadiscom.in",
    "tatapower.com",
    "bsesdelhi.in",
    "cesc.co.in",

    // ── Social & news spam ───────────────────────────────────
    "mail.instagram.com",
    "follow-suggestions@mail.instagram.com",
    "facebookmail.com",
    "notification.linkedin.com",
    "notifications.quora.com",
    "substack.com",
    "sahilist@substack.com",
    "medium.com",
    "inshorts.com",

    // ── Axis bank sub-domains ────────────────────────────────
    "digital.axisbankmail.bank.in",
    "info@digital.axisbankmail.bank.in",
    "axisbankmail.bank.in",

    // ── Microsoft & tech notifications ───────────────────────
    "accountprotection.microsoft.com",

    // ── Oracle ───────────────────────────────────────────────
    "oracle.com",           // Oracle University & general Oracle marketing

    // ---- ADD YOUR OWN BELOW ────────────────────────────────
    // "example.com",
  ],

  // -----------------------------------------------------------
  // ADD / REMOVE subject keywords here
  // Deletes emails whose subject contains ANY of these strings
  // (case-insensitive, partial match)
  // -----------------------------------------------------------
  subjectKeywords: [
    // ── Offers & promotions ──────────────────────────────────
    "cashback",
    "cash back",
    "reward",
    "rewards",
    "credit limit",
    "emi",
    "pre-approved",
    "preapproved",
    "exclusive",
    "upgrade",
    "spend",
    "win",
    "earn",
    "bonus",
    "discount",
    "deal",
    "offer",
    "offers",
    "sale",
    "savings",
    "save big",
    "flat off",
    "% off",
    "upto off",
    "limited time",
    "last chance",
    "hurry",
    "today only",
    "ends tonight",
    "flash sale",
    "mega sale",
    "festive",
    "diwali",
    "christmas sale",
    "new year",
    "republic day",
    "independence day",
    "big billion",
    "great indian",
    "great deals",

    // ── Banking / card spam ──────────────────────────────────
    "statement ready",
    "e-statement",
    "credit card statement",
    "loan offer",
    "personal loan",
    "home loan",
    "gold loan",
    "top up",
    "balance transfer",
    "credit score",
    "cibil score",
    "pre-qualified",
    "overdraft",
    "locker",
    "mutual fund",
    "sip",
    "insurance plan",
    "policy renewal",
    "premium due",
    "maturity",

    // ── OTP / transactional that are purely promotional ──────
    "unsubscribe",
    "you've been selected",
    "you are eligible",
    "specially for you",
    "just for you",
    "curated for you",
    "handpicked",
    "new arrivals",
    "back in stock",
    "wishlist",
    "abandoned cart",
    "complete your purchase",
    "left in your cart",
    "don't miss",
    "don't forget",
    "reminder: your",

    // ── Travel promo ─────────────────────────────────────────
    "flight deals",
    "lowest fare",
    "cheap flights",
    "hotel deals",
    "holiday packages",
    "book now",
    "plan your trip",

    // ── Shareholder / regulatory spam ───────────────────────
    "evoting",    // matches: eVoting
    "e-voting",   // matches: e-Voting, e-voting

    // ── System / infra notifications ─────────────────────────
    "scheduled maintenance intimation",

    // ---- ADD YOUR OWN BELOW ────────────────────────────────
    // "newsletter",
  ],

  // -----------------------------------------------------------
  // Unread-only mode: when true, only emails that have NOT been
  // read are considered for deletion. Set to false to process
  // all matching emails regardless of read status.
  // -----------------------------------------------------------
  unreadOnly: false,

  // -----------------------------------------------------------
  // Age-based filter: delete emails older than N days.
  // Set to 0 to disable age filtering (match any age).
  // When > 0, only emails older than this many days are deleted
  // in addition to matching a domain/keyword filter.
  // -----------------------------------------------------------
  olderThanDays: 0,

  // -----------------------------------------------------------
  // Soft-delete mode: when true, emails are moved to the
  // Deleted Items folder instead of being permanently deleted.
  // This gives you a safety net before purging from the bin.
  // Overridden at runtime by --hard-delete flag.
  // -----------------------------------------------------------
  softDelete: true,

  // -----------------------------------------------------------
  // Folders to scan.
  // Well-known names: "inbox", "junkemail", "deleteditems",
  //                   "sentitems", "drafts", "archive"
  // -----------------------------------------------------------
  folders: ["inbox", "junkemail", "archive"],

  // -----------------------------------------------------------
  // How many emails to fetch per API page (max 100)
  // -----------------------------------------------------------
  pageSize: 100,

  // -----------------------------------------------------------
  // Concurrency for deletes (1 = sequential, up to 4 safe)
  // Higher values speed up deletion but risk throttling.
  // -----------------------------------------------------------
  deleteConcurrency: 2,

  // -----------------------------------------------------------
  // Azure App credentials — fill these after Azure setup
  // See README.md for step-by-step instructions
  // -----------------------------------------------------------
  azure: {
    clientId: "ce0f8651-a3e2-4a6e-9eac-489b3ea358e7",           // From Azure App Registration
    tenantId: "consumers",  // Keep as "consumers" for personal accounts
    redirectUri: "http://localhost:3000/callback",
  },
};
