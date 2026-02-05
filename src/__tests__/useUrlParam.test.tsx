import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUrlParam } from '../useUrlParam';
import { UrlParamsProvider } from '../UrlParamsContext';
import React from 'react';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    isReady: true,
    asPath: '/?name=John&age=25',
    push: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
    replace: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
  }),
}));

// Mock next/navigation (should fail to load, triggering Pages Router)
jest.mock('next/navigation', () => {
  throw new Error('next/navigation not available');
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UrlParamsProvider>{children}</UrlParamsProvider>
);

describe('useUrlParam', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return undefined for non-existent parameter', () => {
    const { result } = renderHook(() => useUrlParam('nonexistent'), { wrapper });
    expect(result.current[0]).toBeUndefined();
  });

  it('should return parameter value from URL', () => {
    const { result } = renderHook(() => useUrlParam('name'), { wrapper });
    expect(result.current[0]).toBe('John');
  });

  it('should parse number parameter', () => {
    const { result } = renderHook(
      () =>
        useUrlParam<number | undefined>('age', {
          parse: (value) => (value ? parseInt(value, 10) : undefined),
          serialize: (value) => value?.toString(),
        }),
      { wrapper }
    );
    expect(result.current[0]).toBe(25);
  });

  it('should parse boolean parameter', () => {
    const { result } = renderHook(
      () =>
        useUrlParam<boolean>('enabled', {
          parse: (value) => value === 'true',
          serialize: (value) => (value ? 'true' : undefined),
        }),
      { wrapper }
    );
    expect(result.current[0]).toBe(false); // Not in URL, defaults to false
  });

  it('should update parameter value', async () => {
    const { result } = renderHook(() => useUrlParam('name'), { wrapper });

    act(() => {
      result.current[1]('Jane');
    });

    await waitFor(() => {
      expect(result.current[0]).toBe('Jane');
    });
  });

  it('should handle undefined value (removes parameter)', async () => {
    const { result } = renderHook(() => useUrlParam('name'), { wrapper });

    act(() => {
      result.current[1](undefined);
    });

    await waitFor(() => {
      expect(result.current[0]).toBeUndefined();
    });
  });

  it('should use custom serializer', async () => {
    const { result } = renderHook(
      () =>
        useUrlParam<number>('count', {
          parse: (value) => (value ? parseInt(value, 10) : 0),
          serialize: (value) => (value === 0 ? undefined : value.toString()),
        }),
      { wrapper }
    );

    act(() => {
      result.current[1](42);
    });

    await waitFor(() => {
      expect(result.current[0]).toBe(42);
    });
  });

  it('should handle empty string values', () => {
    const { result } = renderHook(() => useUrlParam('empty'), { wrapper });
    expect(result.current[0]).toBeUndefined();
  });

  it('should return setter function', () => {
    const { result } = renderHook(() => useUrlParam('name'), { wrapper });
    expect(typeof result.current[1]).toBe('function');
  });

  it('should preserve other parameters when updating', async () => {
    const { result: nameResult } = renderHook(() => useUrlParam('name'), { wrapper });
    const { result: ageResult } = renderHook(() => useUrlParam('age'), { wrapper });

    expect(nameResult.current[0]).toBe('John');
    expect(ageResult.current[0]).toBe('25');

    act(() => {
      nameResult.current[1]('Jane');
    });

    await waitFor(() => {
      expect(nameResult.current[0]).toBe('Jane');
      // Age should still be there
      expect(ageResult.current[0]).toBe('25');
    });
  });
});
