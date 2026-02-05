import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createRscAdapter } from '../routerAdapters';

describe('createRscAdapter', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('should return type "rsc"', () => {
    const adapter = createRscAdapter('/test', new URLSearchParams());
    expect(adapter.type).toBe('rsc');
  });

  it('should always be ready', () => {
    const adapter = createRscAdapter('/test', new URLSearchParams());
    expect(adapter.isReady).toBe(true);
  });

  describe('getCurrentPath', () => {
    it('should return pathname only, when no search params', () => {
      const adapter = createRscAdapter('/products', new URLSearchParams());
      expect(adapter.getCurrentPath()).toBe('/products');
    });

    it('should return pathname with search params', () => {
      const searchParams = new URLSearchParams({ q: 'test', page: '1' });
      const adapter = createRscAdapter('/search', searchParams);
      expect(adapter.getCurrentPath()).toBe('/search?q=test&page=1');
    });

    it('should handle array params in search', () => {
      const searchParams = new URLSearchParams();
      searchParams.append('tag', 'react');
      searchParams.append('tag', 'nextjs');
      const adapter = createRscAdapter('/posts', searchParams);
      expect(adapter.getCurrentPath()).toBe('/posts?tag=react&tag=nextjs');
    });

    it('should handle special characters in search params', () => {
      const searchParams = new URLSearchParams({ q: 'hello world' });
      const adapter = createRscAdapter('/search', searchParams);
      expect(adapter.getCurrentPath()).toBe('/search?q=hello+world');
    });
  });

  describe('updateUrl', () => {
    it('should be a no-op and return false', async () => {
      const adapter = createRscAdapter('/test', new URLSearchParams());
      const result = await adapter.updateUrl('push', { foo: 'bar' }, '/test', '', false);
      expect(result).toBe(false);
    });

    it('should return false for replace method as well', async () => {
      const adapter = createRscAdapter('/test', new URLSearchParams());
      const result = await adapter.updateUrl('replace', { foo: 'bar' }, '/test', '', true);
      expect(result).toBe(false);
    });

    it('should warn in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const adapter = createRscAdapter('/test', new URLSearchParams());
      await adapter.updateUrl('push', {}, '/test', '', false);

      expect(console.warn).toHaveBeenCalledWith(
        '[next-url-state] updateUrl is not available in React Server Components'
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});
