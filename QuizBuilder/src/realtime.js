const CHANNEL = "qb-events";

const bc =
  typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel(CHANNEL)
    : null;

const listeners = new Set();

if (bc) {
  bc.onmessage = (e) => {
    listeners.forEach((fn) => fn(e.data));
  };
}

export function publish(type, payload = {}) {
  const msg = { type, payload, ts: Date.now() };
  if (bc) bc.postMessage(msg);
  listeners.forEach((fn) => fn({ ...msg, self: true }));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}