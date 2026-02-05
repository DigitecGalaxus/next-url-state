import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import type { NextRouter } from 'next/router';
import { createPagesRouterAdapter } from '../routerAdapters';

type MockRouter = Pick<NextRouter, 'isReady' | 'asPath' | 'push' | 'replace'>;

describe('createPagesRouterAdapter', () => {
  const createMockRouter = (overrides: Partial<MockRouter> = {}): MockRouter => ({
    isReady: true,
    asPath: '/current?existing=param',
    push: jest.fn<NextRouter['push']>().mockResolvedValue(true),
    replace: jest.fn<NextRouter['replace']>().mockResolvedValue(true),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return type "pages"', () => {
    const mockRouter = createMockRouter();
    const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
    expect(adapter.type).toBe('pages');
  });

  describe('isReady', () => {
    it('should be true when router.isReady is true', () => {
      const mockRouter = createMockRouter({ isReady: true });
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      expect(adapter.isReady).toBe(true);
    });

    it('should be false when router.isReady is false', () => {
      const mockRouter = createMockRouter({ isReady: false });
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      expect(adapter.isReady).toBe(false);
    });

    it('should be false when router.isReady is undefined', () => {
      const mockRouter = createMockRouter({ isReady: undefined });
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      expect(adapter.isReady).toBe(false);
    });
  });

  describe('getCurrentPath', () => {
    it('should return router.asPath', () => {
      const mockRouter = createMockRouter({ asPath: '/products?category=electronics' });
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      expect(adapter.getCurrentPath()).toBe('/products?category=electronics');
    });

    it('should return "/" when asPath is empty', () => {
      const mockRouter = createMockRouter({ asPath: '' });
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      expect(adapter.getCurrentPath()).toBe('/');
    });

    it('should return "/" when asPath is undefined', () => {
      const mockRouter = createMockRouter({ asPath: undefined });
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      expect(adapter.getCurrentPath()).toBe('/');
    });

    it('should handle asPath with hash', () => {
      const mockRouter = createMockRouter({ asPath: '/page#section' });
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      expect(adapter.getCurrentPath()).toBe('/page#section');
    });
  });

  describe('updateUrl', () => {
    it('should call router.push for push method', async () => {
      const mockRouter = createMockRouter();
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      const result = await adapter.updateUrl('push', { foo: 'bar' }, '/test', '', false);

      expect(mockRouter.push).toHaveBeenCalledWith('/test?foo=bar', undefined, { shallow: false });
      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should call router.replace for replace method', async () => {
      const mockRouter = createMockRouter();
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      const result = await adapter.updateUrl('replace', { foo: 'bar' }, '/test', '', false);

      expect(mockRouter.replace).toHaveBeenCalledWith('/test?foo=bar', undefined, { shallow: false });
      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should pass shallow: true option', async () => {
      const mockRouter = createMockRouter();
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      await adapter.updateUrl('push', { foo: 'bar' }, '/test', '', true);

      expect(mockRouter.push).toHaveBeenCalledWith('/test?foo=bar', undefined, { shallow: true });
    });

    it('should pass shallow: false option', async () => {
      const mockRouter = createMockRouter();
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      await adapter.updateUrl('push', { foo: 'bar' }, '/test', '', false);

      expect(mockRouter.push).toHaveBeenCalledWith('/test?foo=bar', undefined, { shallow: false });
    });

    it('should include hash in the URL', async () => {
      const mockRouter = createMockRouter();
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      await adapter.updateUrl('push', { foo: 'bar' }, '/test', '#section', false);

      expect(mockRouter.push).toHaveBeenCalledWith('/test?foo=bar#section', undefined, { shallow: false });
    });

    it('should handle empty params', async () => {
      const mockRouter = createMockRouter();
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      await adapter.updateUrl('push', {}, '/page', '', false);

      expect(mockRouter.push).toHaveBeenCalledWith('/page', undefined, { shallow: false });
    });

    it('should handle multiple params', async () => {
      const mockRouter = createMockRouter();
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      await adapter.updateUrl('push', { a: '1', b: '2', c: '3' }, '/multi', '', true);

      expect(mockRouter.push).toHaveBeenCalledWith('/multi?a=1&b=2&c=3', undefined, { shallow: true });
    });

    it('should handle array params', async () => {
      const mockRouter = createMockRouter();
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      await adapter.updateUrl('push', { tags: ['react', 'nextjs'] }, '/posts', '', false);

      expect(mockRouter.push).toHaveBeenCalledWith('/posts?tags=react&tags=nextjs', undefined, { shallow: false });
    });

    it('should return the promise from router.push', async () => {
      const mockRouter = createMockRouter({
        push: jest.fn<NextRouter['push']>().mockResolvedValue(true),
      });
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      const result = await adapter.updateUrl('push', {}, '/test', '', false);

      expect(result).toBe(true);
    });

    it('should return the promise from router.replace', async () => {
      const mockRouter = createMockRouter({
        replace: jest.fn<NextRouter['replace']>().mockResolvedValue(false),
      });
      const adapter = createPagesRouterAdapter(mockRouter as NextRouter);
      const result = await adapter.updateUrl('replace', {}, '/test', '', false);

      expect(result).toBe(false);
    });
  });
});
