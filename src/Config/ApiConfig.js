/**
 * ApiConfig.js
 *
 * Auto-resolves the API base URL from the current window location:
 *
 *  localhost / 127.0.0.1  →  http://localhost:8000/api/   (local dev)
 *  smcuat.com             →  https://smcuat.com/apis/     (UAT / staging)
 *  smc.com                →  https://smc.com/apis/        (production)
 */

const { hostname, protocol } = window.location;

const getBaseURL = () => {
  // ── Local development ──────────────────────────────────────────────────────
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    // Frontend: http://localhost:5173  →  API: http://localhost:8000/api/
    // Change 8000 to whatever port your backend runs on
    return "http://localhost/";
  }

  // ── UAT / Staging ──────────────────────────────────────────────────────────
  if (hostname.includes("smcuat.com")) {
    return `${protocol}//smcuat.com/apis/`;
  }

  // ── Production ─────────────────────────────────────────────────────────────
  if (hostname.includes("smc.com")) {
    return `${protocol}//smc.com/apis/`;
  }

  // ── Fallback (unknown host) ────────────────────────────────────────────────
  console.warn(
    `[ApiConfig] Unrecognised hostname "${hostname}". Falling back to localhost API.`
  );
  return "http://localhost/";
};

export const BASE_URL = getBaseURL();

// Current environment label — useful for conditional logic elsewhere
export const ENV =
  hostname === "localhost" || hostname === "127.0.0.1"
    ? "development"
    : hostname.includes("smcuat.com")
    ? "uat"
    : hostname.includes("smc.com")
    ? "production"
    : "development";

export default BASE_URL;
