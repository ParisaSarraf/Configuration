const listeners = new Set();
let pendingRequests = 0;

export function subscribeToRequests(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function hasPendingRequests() {
  return pendingRequests > 0;
}

export function trackRequests(adapter) {
  return async (config) => {
    pendingRequests += 1;
    if (pendingRequests === 1) listeners.forEach((listener) => listener());

    try {
      return await adapter(config);
    } finally {
      pendingRequests -= 1;
      if (pendingRequests === 0) listeners.forEach((listener) => listener());
    }
  };
}
