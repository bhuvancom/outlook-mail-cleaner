import { PublicClientApplication, DeviceCodeRequest, AuthenticationResult } from "@azure/msal-node";
import { config } from "./config";
import * as fs from "fs";
import * as path from "path";

const TOKEN_CACHE_FILE = path.join(__dirname, "../.token_cache.json");

const msalConfig = {
  auth: {
    clientId: config.azure.clientId,
    authority: `https://login.microsoftonline.com/${config.azure.tenantId}`,
  },
  cache: {
    cachePlugin: {
      beforeCacheAccess: async (cacheContext: any) => {
        if (fs.existsSync(TOKEN_CACHE_FILE)) {
          cacheContext.tokenCache.deserialize(
            fs.readFileSync(TOKEN_CACHE_FILE, "utf-8")
          );
        }
      },
      afterCacheAccess: async (cacheContext: any) => {
        if (cacheContext.cacheHasChanged) {
          fs.writeFileSync(
            TOKEN_CACHE_FILE,
            cacheContext.tokenCache.serialize()
          );
        }
      },
    },
  },
};

const SCOPES = ["Mail.ReadWrite", "offline_access"];

let pca: PublicClientApplication;

function getPCA(): PublicClientApplication {
  if (!pca) {
    pca = new PublicClientApplication(msalConfig);
  }
  return pca;
}

export async function getAccessToken(): Promise<string> {
  const app = getPCA();

  // Try silent auth first (uses cached token)
  const accounts = await app.getTokenCache().getAllAccounts();
  if (accounts.length > 0) {
    try {
      const silentResult = await app.acquireTokenSilent({
        account: accounts[0],
        scopes: SCOPES,
      });
      if (silentResult?.accessToken) {
        console.log("✓ Using cached token\n");
        return silentResult.accessToken;
      }
    } catch {
      // Silent failed, fall through to device code
    }
  }

  // Device code flow — works in any terminal, no browser redirect needed
  const deviceCodeRequest: DeviceCodeRequest = {
    scopes: SCOPES,
    deviceCodeCallback: (response) => {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("  SIGN IN REQUIRED");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`\n  1. Open this URL: ${response.verificationUri}`);
      console.log(`  2. Enter code:    ${response.userCode}`);
      console.log("\n  Waiting for sign-in...\n");
    },
  };

  const result: AuthenticationResult | null = await app.acquireTokenByDeviceCode(deviceCodeRequest);
  if (!result?.accessToken) {
    throw new Error("Authentication failed — no access token received.");
  }

  console.log("✓ Signed in successfully\n");
  return result.accessToken;
}
