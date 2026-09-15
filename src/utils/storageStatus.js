let status = 'connecting';
const listeners = new Set();

export function setStorageStatus(next) {
  const value = next === true ? 'Connected' : next === false ? 'Error' : next;
  if (value !== status) {
    status = value;
    listeners.forEach((l) => l());
  }
}

export function getStorageStatus() {
  return status;
}

export function subscribeStorageStatus(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}