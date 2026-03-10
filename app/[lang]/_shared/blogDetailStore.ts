let _showRelated = false;
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

export function toggleRelated() {
  _showRelated = !_showRelated;
  notify();
}

export function closeRelated() {
  if (!_showRelated) return;
  _showRelated = false;
  notify();
}

export function subscribeRelated(cb: () => void) {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
}

export function getRelatedSnapshot() {
  return _showRelated;
}

export function getRelatedServerSnapshot() {
  return false;
}
