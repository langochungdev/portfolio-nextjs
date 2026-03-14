let _showRelated = false;
const _listeners = new Set<() => void>();
const _detailCollectorBySlug = new Map<string, string>();

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

export function setDetailCollectorForSlug(slug: string, collectionId: string) {
  const normalizedSlug = slug.trim();
  const normalizedCollectionId = collectionId.trim();
  if (!normalizedSlug || !normalizedCollectionId) return;
  _detailCollectorBySlug.set(normalizedSlug, normalizedCollectionId);
}

export function getDetailCollectorForSlug(slug: string): string {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return "";
  return _detailCollectorBySlug.get(normalizedSlug) ?? "";
}

export function clearDetailCollectorForSlug(slug: string) {
  const normalizedSlug = slug.trim();
  if (!normalizedSlug) return;
  _detailCollectorBySlug.delete(normalizedSlug);
}
