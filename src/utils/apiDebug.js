const PREFIX = '[Product API]';
const isDebugEnabled =
  import.meta.env.DEV || import.meta.env.VITE_API_DEBUG === 'true';

function isBase64Image(value) {
  return (
    typeof value === 'string' &&
    (value.startsWith('data:image/') || value.length > 500)
  );
}

function sanitizeValue(value, depth = 0) {
  if (depth > 6) return '[Max depth]';
  if (value == null) return value;

  if (typeof value === 'string') {
    if (isBase64Image(value)) {
      return `[base64 image · ${value.length} chars]`;
    }
    if (value.length > 300) {
      return `${value.slice(0, 120)}… [${value.length} chars total]`;
    }
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, sanitizeValue(v, depth + 1)])
    );
  }

  return value;
}

export function sanitizePayloadForLog(payload) {
  return sanitizeValue(payload);
}

export function apiDebug(step, data) {
  if (!isDebugEnabled) return;

  const label = `${PREFIX} ${step}`;
  if (data === undefined) {
    console.log(label);
    return;
  }

  console.groupCollapsed(label);
  if (typeof data === 'object' && data !== null) {
    console.log(sanitizePayloadForLog(data));
  } else {
    console.log(data);
  }
  console.groupEnd();
}

export function apiDebugError(step, error, extra = {}) {
  if (!isDebugEnabled) return;

  console.groupCollapsed(`${PREFIX} ❌ ${step}`);
  console.error('Message:', error?.message || error);
  if (error?.stack) console.error('Stack:', error.stack);
  if (Object.keys(extra).length) {
    console.log('Context:', sanitizePayloadForLog(extra));
  }
  console.groupEnd();
}

export function apiDebugTable(step, rows) {
  if (!isDebugEnabled || !rows?.length) return;
  console.groupCollapsed(`${PREFIX} ${step}`);
  console.table(rows);
  console.groupEnd();
}
