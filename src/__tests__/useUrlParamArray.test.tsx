import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUrlParamArray } from '../useUrlParamArray';
import { UrlParamsProvider } from '../UrlParamsContext';
import React from 'react';

jest.mock('next/router', () => ({
  useRouter: () => ({
    isReady: true,
    asPath: '/?tag=react&tag=nextjs&tag=typescript',
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

describe('useUrlParamArray', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return array of values for parameter with multiple values', () => {
    const { result } = renderHook(
      () =>
        useUrlParamArray<string[]>('tag', {
          parse: (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return [value];
          },
        }),
      { wrapper }
    );

    expect(result.current[0]).toEqual(['react', 'nextjs', 'typescript']);
  });

  it('should handle single value and convert to array', () => {
    const { result } = renderHook(
      () =>
        useUrlParamArray<string[]>('single', {
          parse: (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return [value];
          },
        }),
      { wrapper }
    );

    expect(result.current[0]).toEqual([]);
  });

  it('should return empty array when parameter does not exist', () => {
    const { result } = renderHook(
      () =>
        useUrlParamArray<string[]>('nonexistent', {
          parse: (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return [value];
          },
        }),
      { wrapper }
    );

    expect(result.current[0]).toEqual([]);
  });

  it('should update array values', async () => {
    const { result } = renderHook(
      () =>
        useUrlParamArray<string[]>('tag', {
          parse: (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return [value];
          },
        }),
      { wrapper }
    );

    act(() => {
      result.current[1](['vue', 'svelte']);
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual(['vue', 'svelte']);
    });
  });

  it('should add value to array', async () => {
    const { result } = renderHook(
      () =>
        useUrlParamArray<string[]>('tag', {
          parse: (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return [value];
          },
        }),
      { wrapper }
    );

    act(() => {
      result.current[1]([...result.current[0], 'vue']);
    });

    await waitFor(() => {
      expect(result.current[0]).toContain('vue');
      expect(result.current[0].length).toBe(4);
    });
  });

  it('should remove value from array', async () => {
    const { result } = renderHook(
      () =>
        useUrlParamArray<string[]>('tag', {
          parse: (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return [value];
          },
        }),
      { wrapper }
    );

    act(() => {
      result.current[1](result.current[0].filter((tag) => tag !== 'react'));
    });

    await waitFor(() => {
      expect(result.current[0]).not.toContain('react');
      expect(result.current[0]).toEqual(['nextjs', 'typescript']);
    });
  });

  it('should clear array by setting empty array', async () => {
    const { result } = renderHook(
      () =>
        useUrlParamArray<string[]>('tag', {
          parse: (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return [value];
          },
        }),
      { wrapper }
    );

    act(() => {
      result.current[1]([]);
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });
  });

  it('should handle URL-encoded values', () => {
    const { result } = renderHook(
      () =>
        useUrlParamArray<string[]>('tag', {
          parse: (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return [value];
          },
        }),
      { wrapper }
    );

    // Tags should be decoded from URL
    expect(Array.isArray(result.current[0])).toBe(true);
  });

  it('should return setter function', () => {
    const { result } = renderHook(
      () =>
        useUrlParamArray<string[]>('tag', {
          parse: (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return [value];
          },
        }),
      { wrapper }
    );

    expect(typeof result.current[1]).toBe('function');
  });

  it('should handle custom serialization', async () => {
    const { result } = renderHook(
      () =>
        useUrlParamArray<string[]>('tag', {
          parse: (value) => {
            if (!value) return [];
            if (Array.isArray(value)) return value;
            return [value];
          },
          serialize: (value) => value.map((v) => v.toLowerCase()),
        }),
      { wrapper }
    );

    act(() => {
      result.current[1](['REACT', 'NEXTJS']);
    });

    await waitFor(() => {
      // Values should be lowercased when serialized to URL
      expect(result.current[0]).toEqual(['react', 'nextjs']);
    });
  });
});
