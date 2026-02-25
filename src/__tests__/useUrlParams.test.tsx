import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUrlParams, useUrlParamsArray } from '../useUrlParams';
import { UrlParamsProvider } from '../UrlParamsContext';
import React from 'react';

jest.mock('next/router', () => ({
  useRouter: () => ({
    isReady: true,
    asPath: '/?q=search&page=1&sort=date&tag=react&tag=nextjs',
    push: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
    replace: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
  }),
}));

jest.mock('next/navigation', () => {
  throw new Error('next/navigation not available');
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UrlParamsProvider>{children}</UrlParamsProvider>
);

describe('useUrlParams', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns all current URL params when no keys specified', () => {
    const { result } = renderHook(() => useUrlParams(), { wrapper });
    expect(result.current[0]).toMatchObject({
      q: 'search',
      page: '1',
      sort: 'date',
    });
  });

  it('returns only specified keys', () => {
    const { result } = renderHook(() => useUrlParams(['q', 'page']), { wrapper });
    expect(result.current[0]).toEqual({ q: 'search', page: '1' });
  });

  it('returns undefined for keys not in URL', () => {
    const { result } = renderHook(() => useUrlParams(['q', 'missing']), { wrapper });
    expect(result.current[0].missing).toBeUndefined();
  });

  it('flattens multi-value params to first value', () => {
    const { result } = renderHook(() => useUrlParams(['tag']), { wrapper });
    expect(result.current[0].tag).toBe('react');
  });

  it('updates a single param', async () => {
    const { result } = renderHook(() => useUrlParams(['q']), { wrapper });
    const setParams = result.current[1];

    act(() => {
      setParams({ q: 'nextjs' });
    });

    await waitFor(() => {
      expect(result.current[0].q).toBe('nextjs');
    });
  });

  it('updates multiple params at once', async () => {
    const { result } = renderHook(() => useUrlParams(['q', 'page']), { wrapper });
    const setParams = result.current[1];

    act(() => {
      setParams({ q: 'typescript', page: '2' });
    });

    await waitFor(() => {
      const params = result.current[0];
      expect(params.q).toBe('typescript');
      expect(params.page).toBe('2');
    });
  });

  it('removes a param by setting it to undefined', async () => {
    const { result } = renderHook(() => useUrlParams(['q']), { wrapper });
    const setParams = result.current[1];

    act(() => {
      setParams({ q: undefined });
    });

    await waitFor(() => {
      expect(result.current[0].q).toBeUndefined();
    });
  });

  it('preserves unmodified params when updating others', async () => {
    const { result } = renderHook(() => useUrlParams(['q', 'sort']), { wrapper });
    const setParams = result.current[1];

    expect(result.current[0].sort).toBe('date');

    act(() => {
      setParams({ q: 'updated' });
    });

    await waitFor(() => {
      const params = result.current[0];
      expect(params.q).toBe('updated');
      expect(params.sort).toBe('date');
    });
  });

  it('returns a setter function', () => {
    const { result } = renderHook(() => useUrlParams(), { wrapper });
    const setParams = result.current[1];
    expect(typeof setParams).toBe('function');
  });
});

describe('useUrlParamsArray', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns array values for multi-value params', () => {
    const { result } = renderHook(() => useUrlParamsArray(['tag']), { wrapper });
    expect(result.current[0].tag).toEqual(['react', 'nextjs']);
  });

  it('wraps single values in an array', () => {
    const { result } = renderHook(() => useUrlParamsArray(['q']), { wrapper });
    expect(result.current[0].q).toEqual(['search']);
  });

  it('returns empty array for missing params', () => {
    const { result } = renderHook(() => useUrlParamsArray(['missing']), { wrapper });
    expect(result.current[0].missing).toEqual([]);
  });

  it('returns arrays for all params when no keys specified', () => {
    const { result } = renderHook(() => useUrlParamsArray(), { wrapper });
    const params = result.current[0];
    expect(Array.isArray(params.q)).toBe(true);
    expect(Array.isArray(params.tag)).toBe(true);
  });

  it('updates array values', async () => {
    const { result } = renderHook(() => useUrlParamsArray(['tag']), { wrapper });
    const setParams = result.current[1];

    act(() => {
      setParams({ tag: ['vue', 'svelte'] });
    });

    await waitFor(() => {
      expect(result.current[0].tag).toEqual(['vue', 'svelte']);
    });
  });

  it('clears an array by setting empty array', async () => {
    const { result } = renderHook(() => useUrlParamsArray(['tag']), { wrapper });
    const setParams = result.current[1];

    act(() => {
      setParams({ tag: [] });
    });

    await waitFor(() => {
      expect(result.current[0].tag).toEqual([]);
    });
  });

  it('returns a setter function', () => {
    const { result } = renderHook(() => useUrlParamsArray(['tag']), { wrapper });
    const setParams = result.current[1];
    expect(typeof setParams).toBe('function');
  });
});
