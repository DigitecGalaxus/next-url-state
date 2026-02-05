import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { NextRouter } from 'next/router';
import { createAppRouterAdapter } from '../routerAdapters';

type MockRouter = Pick<NextRouter, 'push' | 'replace'>;

describe('createAppRouterAdapter', () => {
  const mockRouter: MockRouter = {
    push: jest.fn() as MockRouter['push'],
    replace: jest.fn() as MockRouter['replace'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset hash to default
    window.location.hash = '';
  });

  it('should return type "app"', () => {
    const adapter = createAppRouterAdapter('/test', new URLSearchParams(), mockRouter as NextRouter);
    expect(adapter.type).toBe('app');
  });

  it('should always be ready', () => {
    const adapter = createAppRouterAdapter('/test', new URLSearchParams(), mockRouter as NextRouter);
    expect(adapter.isReady).toBe(true);
  });

  describe('getCurrentPath', () => {
    it('should return pathname only when no search params and no hash', () => {
      window.location.hash = '';
      const adapter = createAppRouterAdapter('/products', new URLSearchParams(), mockRouter as NextRouter);
      expect(adapter.getCurrentPath()).toBe('/products');
    });

    it('should return pathname with search params', () => {
      window.location.hash = '';
      const searchParams = new URLSearchParams({ q: 'test', page: '1' });
      const adapter = createAppRouterAdapter('/search', searchParams, mockRouter as NextRouter);
      expect(adapter.getCurrentPath()).toBe('/search?q=test&page=1');
    });

    it('should include hash from window.location', () => {
      window.location.hash = '#top';
      const adapter = createAppRouterAdapter('/page', new URLSearchParams(), mockRouter as NextRouter);
      expect(adapter.getCurrentPath()).toBe('/page#top');
    });

    it('should return pathname with search params and hash', () => {
      window.location.hash = '#section';
      const searchParams = new URLSearchParams({ id: '123' });
      const adapter = createAppRouterAdapter('/article', searchParams, mockRouter as NextRouter);
      expect(adapter.getCurrentPath()).toBe('/article?id=123#section');
    });
  });

  describe('updateUrl', () => {
    it('should call router.push for push method', async () => {
      const adapter = createAppRouterAdapter('/test', new URLSearchParams(), mockRouter as NextRouter);
      const result = await adapter.updateUrl('push', { foo: 'bar' }, '/test', '', false);

      expect(mockRouter.push).toHaveBeenCalledWith('/test?foo=bar');
      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should call router.replace for replace method', async () => {
      const adapter = createAppRouterAdapter('/test', new URLSearchParams(), mockRouter as NextRouter);
      const result = await adapter.updateUrl('replace', { foo: 'bar' }, '/test', '', false);

      expect(mockRouter.replace).toHaveBeenCalledWith('/test?foo=bar');
      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should include hash in the URL', async () => {
      const adapter = createAppRouterAdapter('/test', new URLSearchParams(), mockRouter as NextRouter);
      await adapter.updateUrl('push', { foo: 'bar' }, '/test', '#section', false);

      expect(mockRouter.push).toHaveBeenCalledWith('/test?foo=bar#section');
    });

    it('should handle empty params', async () => {
      const adapter = createAppRouterAdapter('/test', new URLSearchParams(), mockRouter as NextRouter);
      await adapter.updateUrl('push', {}, '/page', '', false);

      expect(mockRouter.push).toHaveBeenCalledWith('/page');
    });

    it('should handle multiple params', async () => {
      const adapter = createAppRouterAdapter('/test', new URLSearchParams(), mockRouter as NextRouter);
      await adapter.updateUrl('push', { a: '1', b: '2', c: '3' }, '/multi', '', false);

      expect(mockRouter.push).toHaveBeenCalledWith('/multi?a=1&b=2&c=3');
    });

    it('should handle array params', async () => {
      const adapter = createAppRouterAdapter('/test', new URLSearchParams(), mockRouter as NextRouter);
      await adapter.updateUrl('push', { tags: ['react', 'nextjs'] }, '/posts', '', false);

      expect(mockRouter.push).toHaveBeenCalledWith('/posts?tags=react&tags=nextjs');
    });

    it('should ignore shallow parameter (App Router does not support it)', async () => {
      const adapter = createAppRouterAdapter('/test', new URLSearchParams(), mockRouter as NextRouter);

      await adapter.updateUrl('push', { foo: 'bar' }, '/test', '', true);
      expect(mockRouter.push).toHaveBeenCalledWith('/test?foo=bar');

      jest.clearAllMocks();

      await adapter.updateUrl('push', { foo: 'bar' }, '/test', '', false);
      expect(mockRouter.push).toHaveBeenCalledWith('/test?foo=bar');
    });
  });
});
