import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useUpdateSearchParams } from '../useUpdateSearchParams';
import { useRouterAdapter } from '../routerAdapters';
import type { RouterAdapter } from '../routerAdapters';

jest.mock('../routerAdapters', () => ({
  useRouterAdapter: jest.fn(),
}));

const mockUseRouterAdapter = useRouterAdapter as jest.MockedFunction<typeof useRouterAdapter>;

const createAdapter = (isReady: boolean): RouterAdapter => ({
  isReady,
  type: 'pages',
  getCurrentPath: jest.fn(() => '/'),
  updateUrl: jest.fn<RouterAdapter['updateUrl']>().mockResolvedValue(true),
});

describe('useUpdateSearchParams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when router is ready', () => {
    it('calls adapter.updateUrl with push method', async () => {
      const adapter = createAdapter(true);
      mockUseRouterAdapter.mockReturnValue(adapter);

      const { result } = renderHook(() => useUpdateSearchParams());
      const pathRef = { current: '/search?q=old' };

      await act(async () => {
        await result.current('push', { q: 'new' }, pathRef);
      });

      expect(adapter.updateUrl).toHaveBeenCalledWith('push', { q: 'new' }, '/search', '', true);
    });

    it('calls adapter.updateUrl with replace method', async () => {
      const adapter = createAdapter(true);
      mockUseRouterAdapter.mockReturnValue(adapter);

      const { result } = renderHook(() => useUpdateSearchParams());
      const pathRef = { current: '/page' };

      await act(async () => {
        await result.current('replace', { page: '2' }, pathRef);
      });

      expect(adapter.updateUrl).toHaveBeenCalledWith('replace', { page: '2' }, '/page', '', true);
    });

    it('defaults to shallow: true when option is omitted', async () => {
      const adapter = createAdapter(true);
      mockUseRouterAdapter.mockReturnValue(adapter);

      const { result } = renderHook(() => useUpdateSearchParams());
      const pathRef = { current: '/' };

      await act(async () => {
        await result.current('replace', { q: 'test' }, pathRef);
      });

      const [, , , , shallow] = (adapter.updateUrl as jest.MockedFunction<RouterAdapter['updateUrl']>).mock.calls[0];
      expect(shallow).toBe(true);
    });

    it('passes shallow: false when explicitly set', async () => {
      const adapter = createAdapter(true);
      mockUseRouterAdapter.mockReturnValue(adapter);

      const { result } = renderHook(() => useUpdateSearchParams());
      const pathRef = { current: '/page' };

      await act(async () => {
        await result.current('replace', { q: 'test' }, pathRef, { shallow: false });
      });

      expect(adapter.updateUrl).toHaveBeenCalledWith('replace', { q: 'test' }, '/page', '', false);
    });

    it('parses pathname and hash from the path ref', async () => {
      const adapter = createAdapter(true);
      mockUseRouterAdapter.mockReturnValue(adapter);

      const { result } = renderHook(() => useUpdateSearchParams());
      const pathRef = { current: '/products?cat=web#section1' };

      await act(async () => {
        await result.current('replace', { cat: 'mobile' }, pathRef);
      });

      expect(adapter.updateUrl).toHaveBeenCalledWith(
        'replace',
        { cat: 'mobile' },
        '/products',
        '#section1',
        true
      );
    });

    it('returns true on success', async () => {
      const adapter = createAdapter(true);
      mockUseRouterAdapter.mockReturnValue(adapter);

      const { result } = renderHook(() => useUpdateSearchParams());

      let returnValue: boolean | undefined;
      await act(async () => {
        returnValue = await result.current('push', { q: 'test' }, { current: '/' });
      });

      expect(returnValue).toBe(true);
    });
  });

  describe('when router is not ready (History API fallback)', () => {
    let replaceStateSpy: ReturnType<typeof jest.spyOn>;
    let pushStateSpy: ReturnType<typeof jest.spyOn>;

    beforeEach(() => {
      replaceStateSpy = jest.spyOn(window.history, 'replaceState').mockImplementation(() => {});
      pushStateSpy = jest.spyOn(window.history, 'pushState').mockImplementation(() => {});
    });

    afterEach(() => {
      replaceStateSpy.mockRestore();
      pushStateSpy.mockRestore();
    });

    it('sets routerAdapterRef to null when isReady is false', async () => {
      const adapter = createAdapter(false);
      mockUseRouterAdapter.mockReturnValue(adapter);

      const { result } = renderHook(() => useUpdateSearchParams());

      // With isReady: false the ref stays null — fallback path is taken
      await act(async () => {
        await result.current('push', { q: 'test' }, { current: '/search' });
      });

      expect(adapter.updateUrl).not.toHaveBeenCalled();
      expect(replaceStateSpy).toHaveBeenCalled();
    });

    it('uses replaceState when shallow is true (default)', async () => {
      mockUseRouterAdapter.mockReturnValue(createAdapter(false));

      const { result } = renderHook(() => useUpdateSearchParams());

      await act(async () => {
        await result.current('push', { q: 'hello' }, { current: '/search' });
      });

      expect(replaceStateSpy).toHaveBeenCalledWith({}, '', '/search?q=hello');
      expect(pushStateSpy).not.toHaveBeenCalled();
    });

    it('uses pushState when shallow is false', async () => {
      mockUseRouterAdapter.mockReturnValue(createAdapter(false));

      const { result } = renderHook(() => useUpdateSearchParams());

      await act(async () => {
        await result.current('push', { q: 'hello' }, { current: '/search' }, { shallow: false });
      });

      expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/search?q=hello');
      expect(replaceStateSpy).not.toHaveBeenCalled();
    });

    it('builds the correct URL with query string in fallback mode', async () => {
      mockUseRouterAdapter.mockReturnValue(createAdapter(false));

      const { result } = renderHook(() => useUpdateSearchParams());

      await act(async () => {
        await result.current('replace', { page: '3', sort: 'asc' }, { current: '/items' });
      });

      const calledUrl = (replaceStateSpy.mock.calls[0] as unknown[])[2] as string;
      expect(calledUrl).toContain('/items');
      expect(calledUrl).toContain('page=3');
      expect(calledUrl).toContain('sort=asc');
    });

    it('returns true in fallback mode', async () => {
      mockUseRouterAdapter.mockReturnValue(createAdapter(false));

      const { result } = renderHook(() => useUpdateSearchParams());

      let returnValue: boolean | undefined;
      await act(async () => {
        returnValue = await result.current('push', { q: 'x' }, { current: '/' });
      });

      expect(returnValue).toBe(true);
    });

    it('clears routerAdapterRef when adapter transitions from ready to not ready', async () => {
      const readyAdapter = createAdapter(true);
      mockUseRouterAdapter.mockReturnValue(readyAdapter);

      const { result, rerender } = renderHook(() => useUpdateSearchParams());

      // Confirm adapter is used when ready
      await act(async () => {
        await result.current('push', { q: 'a' }, { current: '/' });
      });
      expect(readyAdapter.updateUrl).toHaveBeenCalledTimes(1);

      // Transition to not-ready — ref should be cleared
      const notReadyAdapter = createAdapter(false);
      mockUseRouterAdapter.mockReturnValue(notReadyAdapter);
      rerender();

      await act(async () => {
        await result.current('push', { q: 'b' }, { current: '/' });
      });

      // Now the fallback path should be taken, not the adapter
      expect(notReadyAdapter.updateUrl).not.toHaveBeenCalled();
      expect(replaceStateSpy).toHaveBeenCalled();
    });
  });
});
