/**
 * @jest-environment jsdom
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { createFallbackAdapter } from '../routerAdapters';

describe('createFallbackAdapter', () => {
  let mockPushState: jest.Mock;
  let mockReplaceState: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPushState = jest.fn();
    mockReplaceState = jest.fn();

    // Mock history methods
    jest.spyOn(window.history, 'pushState').mockImplementation(mockPushState);
    jest.spyOn(window.history, 'replaceState').mockImplementation(mockReplaceState);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return type "fallback"', () => {
    const adapter = createFallbackAdapter();
    expect(adapter.type).toBe('fallback');
  });

  describe('isReady', () => {
    it('should be true when window exists', () => {
      const adapter = createFallbackAdapter();
      expect(adapter.isReady).toBe(true);
    });
  });

  describe('getCurrentPath', () => {
    it('should return a string', () => {
      const adapter = createFallbackAdapter();
      const path = adapter.getCurrentPath();
      expect(typeof path).toBe('string');
    });

    it('should concatenate pathname, search, and hash from window.location', () => {
      // getCurrentPath reads from window.location which is "/" in jsdom by default
      const adapter = createFallbackAdapter();
      const path = adapter.getCurrentPath();
      // Default jsdom location is "/" with empty search and hash
      expect(path).toBe('/');
    });
  });

  describe('updateUrl', () => {
    it('should call history.pushState for push method', async () => {
      const adapter = createFallbackAdapter();
      const result = await adapter.updateUrl('push', { foo: 'bar' }, '/test', '', false);

      expect(mockPushState).toHaveBeenCalledWith({}, '', '/test?foo=bar');
      expect(mockReplaceState).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should call history.replaceState for replace method', async () => {
      const adapter = createFallbackAdapter();
      const result = await adapter.updateUrl('replace', { foo: 'bar' }, '/test', '', false);

      expect(mockReplaceState).toHaveBeenCalledWith({}, '', '/test?foo=bar');
      expect(mockPushState).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should include hash in the URL', async () => {
      const adapter = createFallbackAdapter();
      await adapter.updateUrl('push', { foo: 'bar' }, '/test', '#section', false);

      expect(mockPushState).toHaveBeenCalledWith({}, '', '/test?foo=bar#section');
    });

    it('should handle empty params', async () => {
      const adapter = createFallbackAdapter();
      await adapter.updateUrl('push', {}, '/page', '', false);

      expect(mockPushState).toHaveBeenCalledWith({}, '', '/page');
    });

    it('should handle multiple params', async () => {
      const adapter = createFallbackAdapter();
      await adapter.updateUrl('push', { a: '1', b: '2', c: '3' }, '/multi', '', false);

      expect(mockPushState).toHaveBeenCalledWith({}, '', '/multi?a=1&b=2&c=3');
    });

    it('should handle array params', async () => {
      const adapter = createFallbackAdapter();
      await adapter.updateUrl('push', { tags: ['react', 'nextjs'] }, '/posts', '', false);

      expect(mockPushState).toHaveBeenCalledWith({}, '', '/posts?tags=react&tags=nextjs');
    });

    it('should ignore shallow parameter', async () => {
      const adapter = createFallbackAdapter();

      await adapter.updateUrl('push', { foo: 'bar' }, '/test', '', true);
      expect(mockPushState).toHaveBeenCalledWith({}, '', '/test?foo=bar');

      jest.clearAllMocks();

      await adapter.updateUrl('push', { foo: 'bar' }, '/test', '', false);
      expect(mockPushState).toHaveBeenCalledWith({}, '', '/test?foo=bar');
    });

    it('should handle hash only (no params)', async () => {
      const adapter = createFallbackAdapter();
      await adapter.updateUrl('push', {}, '/page', '#anchor', false);

      expect(mockPushState).toHaveBeenCalledWith({}, '', '/page#anchor');
    });

    it('should handle special characters in params', async () => {
      const adapter = createFallbackAdapter();
      await adapter.updateUrl('push', { q: 'hello world', tag: 'a&b' }, '/search', '', false);

      expect(mockPushState).toHaveBeenCalledWith({}, '', '/search?q=hello+world&tag=a%26b');
    });
  });
});
