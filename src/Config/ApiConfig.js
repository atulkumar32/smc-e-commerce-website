const ENVIRONMENTS = {
  production: {
    FRONTEND_URL: "https://shreemahaveercollections.com/",
    BASE_URL: "https://shreemahaveercollections.com/apis/v1/",
  },

  uat: {
    FRONTEND_URL: "https://shreemahaveercollections.com/",
    BASE_URL: "https://shreemahaveercollections.com/apis/v1/",
  },

  development: {
    FRONTEND_URL: "http://localhost:5173",
    BASE_URL: "http://localhost/",
  },
};

const getEnvironment = () => {
  const { hostname, origin } = window.location;

  // Local Development
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "development";
  }

  // UAT
  if (hostname.includes("https://shreemahaveercollections.com/")) {
    return "uat";
  }

  // Production
  if (hostname.includes("https://shreemahaveercollections.com/")) {
    return "production";
  }

  console.warn(
    `[ApiConfig] Unknown host "${origin}", using development environment.`
  );

  return "development";
};

const CURRENT_ENV = getEnvironment();

export const URL_CONFIG = {
  ...ENVIRONMENTS[CURRENT_ENV],
  ENV: CURRENT_ENV,
};

// Individual exports (optional)
export const BASE_URL = URL_CONFIG.BASE_URL;
export const ENV = URL_CONFIG.ENV;

export default URL_CONFIG;






// /**
//  * ApiConfig.js
//  *
//  * Auto-resolves the API base URL from the current window location:
//  *
//  *  localhost / 127.0.0.1  →  http://localhost:8000/api/   (local dev)
//  *  smcuat.com             →  https://smcuat.com/apis/     (UAT / staging)
//  *  smc.com                →  https://smc.com/apis/        (production)
//  */

// const { hostname, protocol } = window.location;

// const getBaseURL = () => {
//   // ── Local development ──────────────────────────────────────────────────────
//   if (hostname === "localhost" || hostname === "127.0.0.1") {
//     // Frontend: http://localhost:5173  →  API: http://localhost:8000/api/
//     // Change 8000 to whatever port your backend runs on
//     return "http://localhost/";
//   }

//   // ── UAT / Staging ──────────────────────────────────────────────────────────
//   if (hostname.includes("smcuat.com")) {
//     return `${protocol}//smcuat.com/apis/`;
//   }

//   // ── Production ─────────────────────────────────────────────────────────────
//   if (hostname.includes("smc.com")) {
//     return `${protocol}//smc.com/apis/`;
//   }

//   // ── Fallback (unknown host) ────────────────────────────────────────────────
//   console.warn(
//     `[ApiConfig] Unrecognised hostname "${hostname}". Falling back to localhost API.`
//   );
//   return "http://localhost/";
// };

// export const BASE_URL = getBaseURL();

// // Current environment label — useful for conditional logic elsewhere
// export const ENV =
//   hostname === "localhost" || hostname === "127.0.0.1"
//     ? "development"
//     : hostname.includes("smcuat.com")
//     ? "uat"
//     : hostname.includes("smc.com")
//     ? "production"
//     : "development";

// export default BASE_URL;


