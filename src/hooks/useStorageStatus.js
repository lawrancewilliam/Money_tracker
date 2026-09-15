import { useSyncExternalStore } from 'react';
import { getStorageStatus, subscribeStorageStatus, setStorageStatus } from '../utils/storageStatus.js';

export default function useStorageStatus() {
  return useSyncExternalStore(subscribeStorageStatus, getStorageStatus);
}

export { setStorageStatus };