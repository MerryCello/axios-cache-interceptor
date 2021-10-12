import type { CacheUpdater } from '../axios/types';
import type { CacheStorage } from '../storage/types';

export async function updateCache<T = any>(
  storage: CacheStorage,
  data: T,
  entries: Record<string, CacheUpdater>
): Promise<void> {
  for (const cacheKey in entries) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const value = entries[cacheKey]!;

    if (value == 'delete') {
      await storage.remove(cacheKey);
      continue;
    }

    const oldValue = await storage.get(cacheKey);

    if (oldValue.state === 'loading') {
      throw new Error('cannot update the cache while loading');
    }

    const newValue = value(oldValue, data);

    if (newValue === undefined) {
      await storage.remove(cacheKey);
      continue;
    }

    await storage.set(cacheKey, newValue);
  }
}
