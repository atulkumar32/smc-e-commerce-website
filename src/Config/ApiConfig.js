// const ENVIRONMENTS = {
//   production: {
//     FRONTEND_URL: "https://shreemahaveercollections.com",
//     BASE_URL: "https://shreemahaveercollections.com/apis/v1/",
//   },

//   uat: {
//     FRONTEND_URL: "https://shreemahaveercollections.com",
//     BASE_URL: "https://shreemahaveercollections.com/apis/v1/",
//   },

//   development: {
//     FRONTEND_URL: "http://localhost:5173",
//     BASE_URL: "http://localhost/",
//   },
// };

// const getEnvironment = () => {
//   const { hostname, origin } = window.location;

//   // Local Development
//   if (hostname === "localhost" || hostname === "127.0.0.1") {
//     return "development";
//   }

//   // UAT
//   if (hostname.includes("https://shreemahaveercollections.com")) {
//     return "uat";
//   }

//   // Production
//   if (hostname.includes("https://shreemahaveercollections.com")) {
//     return "production";
//   }

//   console.warn(
//     `[ApiConfig] Unknown host "${origin}", using development environment.`
//   );

//   return "development";
// };

// const CURRENT_ENV = getEnvironment();

// export const URL_CONFIG = {
//   ...ENVIRONMENTS[CURRENT_ENV],
//   ENV: CURRENT_ENV,
// };

// // Individual exports (optional)
// export const BASE_URL = URL_CONFIG.BASE_URL;
// export const ENV = URL_CONFIG.ENV;

// export default URL_CONFIG;






// // /**
// //  * ApiConfig.js
// //  *
// //  * Auto-resolves the API base URL from the current window location:
// //  *
// //  *  localhost / 127.0.0.1  →  http://localhost:8000/api/   (local dev)
// //  *  smcuat.com             →  https://smcuat.com/apis/     (UAT / staging)
// //  *  smc.com                →  https://smc.com/apis/        (production)
// //  */

// const { hostname, protocol } = window.location;

//  const getBaseURL = () => {
//    // ── Local development ──────────────────────────────────────────────────────
//    if (hostname === "localhost" || hostname === "127.0.0.1") {
//       Frontend: http://localhost:5173  →  API: http://localhost:8000/api/
//       // Change 8000 to whatever port your backend runs on
//      return "http://localhost/";
//    }
//    // ── UAT / Staging ──────────────────────────────────────────────────────────
//    if (hostname.includes("https://shreemahaveercollections.com")) {
//     //  return `${protocol}//smcuat.com/apis/`;
//      return "https://shreemahaveercollections.com/apis/v1/";
//     }
    
//     // ── Production ─────────────────────────────────────────────────────────────
//     if (hostname.includes("https://shreemahaveercollections.com")) {
//      return "https://shreemahaveercollections.com/apis/v1/";
//     //  return `${protocol}//smc.com/apis/`;
//    }

//    // ── Fallback (unknown host) ────────────────────────────────────────────────
//    console.warn(
//      `[ApiConfig] Unrecognised hostname "${hostname}". Falling back to localhost API.`
//    );
//    return "http://localhost/";
//  };

//  export const BASE_URL = getBaseURL();

//  // Current environment label — useful for conditional logic elsewhere
//  export const ENV =
//    hostname === "localhost" || hostname === "127.0.0.1"   ? "development"
//      : hostname.includes("smcuat.com")
//      ? "uat"
//      : hostname.includes("smc.com")
//      ? "production"
//      : "development";

//  export default BASE_URL;




// new code start 
// ApiConfig.js

const ENVIRONMENTS = {
  production: {
    FRONTEND_URL: "https://shreemahaveercollections.com",
    BASE_URL: "https://shreemahaveercollections.com/apis/v1/",
  },

  uat: {
    // Currently same as Production
    FRONTEND_URL: "https://shreemahaveercollections.com",
    BASE_URL: "https://shreemahaveercollections.com/apis/v1/",
  },

  development: {
    FRONTEND_URL: "http://localhost:5173",
    BASE_URL: "http://localhost/",
  },
};

const getEnvironment = () => {
  const currentOrigin = window.location.origin;

  console.group("🌍 API Environment");
  console.log("Current Origin :", currentOrigin);

  if (currentOrigin === ENVIRONMENTS.production.FRONTEND_URL) {
    console.log("✅ Production Environment");
    console.groupEnd();
    return "production";
  }

  if (currentOrigin === ENVIRONMENTS.uat.FRONTEND_URL) {
    console.log("✅ UAT Environment");
    console.groupEnd();
    return "uat";
  }

  if (currentOrigin === ENVIRONMENTS.development.FRONTEND_URL) {
    console.log("✅ Development Environment");
    console.groupEnd();
    return "development";
  }

  console.warn("⚠️ Unknown Environment :", currentOrigin);
  console.log("➡️ Defaulting to Development");
  console.groupEnd();

  return "development";
};

const CURRENT_ENV = getEnvironment();

export const URL_CONFIG = {
  ...ENVIRONMENTS[CURRENT_ENV],
  ENV: CURRENT_ENV,
};

console.group("🚀 URL Configuration");
console.log("Environment :", URL_CONFIG.ENV);
console.log("Frontend URL:", URL_CONFIG.FRONTEND_URL);
console.log("API Base URL:", URL_CONFIG.BASE_URL);
console.log("Full Config :", URL_CONFIG);
console.groupEnd();

export const BASE_URL = URL_CONFIG.BASE_URL;
export const FRONTEND_URL = URL_CONFIG.FRONTEND_URL;
export const ENV = URL_CONFIG.ENV;

export default URL_CONFIG;



// ApiConfig.js

// const ENVIRONMENTS = {
//   production: {
//     FRONTEND_URL: "https://shreemahaveercollections.com",
//     BASE_URL: "https://shreemahaveercollections.com/apis/v1/",
//   },

//   uat: {
//     // Currently same as production
//     FRONTEND_URL: "https://shreemahaveercollections.com",
//     BASE_URL: "https://shreemahaveercollections.com/apis/v1/",
//   },

//   development: {
//     FRONTEND_URL: "http://localhost:5173",
//     BASE_URL: "http://localhost/",
//   },
// };

// const getEnvironment = () => {
//   const { hostname, origin, protocol } = window.location;

//   console.group("🌍 ApiConfig");
//   console.log("Hostname :", hostname);
//   console.log("Origin   :", origin);
//   console.log("Protocol :", protocol);

//   // Development
//   if (hostname === "localhost" || hostname === "127.0.0.1") {
//     console.log("✅ Matched Development Environment");
//     console.groupEnd();
//     return "development";
//   }

//   // ==========================
//   // Future UAT
//   // ==========================
//   // if (
//   //   hostname === "uat.shreemahaveercollections.com" ||
//   //   hostname === "www.uat.shreemahaveercollections.com"
//   // ) {
//   //   console.log("✅ Matched UAT Environment");
//   //   console.groupEnd();
//   //   return "uat";
//   // }

//   // Production
//   if (
//     hostname === "shreemahaveercollections.com" ||
//     hostname === "www.shreemahaveercollections.com"
//   ) {
//     console.log("✅ Matched Production Environment");
//     console.groupEnd();
//     return "production";
//   }

//   console.warn(
//     `⚠️ Unknown hostname "${hostname}". Defaulting to Production.`
//   );
//   console.groupEnd();

//   return "production";
// };

// const CURRENT_ENV = getEnvironment();

// export const URL_CONFIG = {
//   ...ENVIRONMENTS[CURRENT_ENV],
//   ENV: CURRENT_ENV,
// };

// console.group("🚀 API Configuration");
// console.log("Environment :", URL_CONFIG.ENV);
// console.log("Frontend URL:", URL_CONFIG.FRONTEND_URL);
// console.log("API Base URL:", URL_CONFIG.BASE_URL);
// console.log("Full Config :", URL_CONFIG);
// console.groupEnd();

// export const BASE_URL = URL_CONFIG.BASE_URL;
// export const FRONTEND_URL = URL_CONFIG.FRONTEND_URL;
// export const ENV = URL_CONFIG.ENV;

// export default URL_CONFIG;