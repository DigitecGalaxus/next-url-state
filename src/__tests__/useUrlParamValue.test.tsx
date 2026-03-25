import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { useUrlParamValue } from '../useUrlParamValue';
import { UrlParamsProvider } from '../UrlParamsContext';
import React from 'react';

jest.mock('next/router', () => ({
  useRouter: () => ({
    isReady: true,
    asPath: '/?name=Alice&page=42&active=true',
    push: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
    replace: jest.fn<() => Promise<boolean>>().mockResolvedValue(true),
  }),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/'),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
  useRouter: jest.fn().mockReturnValue({}),
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UrlParamsProvider>{children}</UrlParamsProvider>
);

describe('useUrlParamValue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns string value from URL', () => {
    const { result } = renderHook(() => useUrlParamValue('name'), { wrapper });
    expect(result.current).toBe('Alice');
  });

  it('returns undefined for non-existent param', () => {
    const { result } = renderHook(() => useUrlParamValue('missing'), { wrapper });
    expect(result.current).toBeUndefined();
  });

  it('returns the value directly (not a tuple)', () => {
    const { result } = renderHook(() => useUrlParamValue('name'), { wrapper });
    expect(typeof result.current).toBe('string');
    expect(Array.isArray(result.current)).toBe(false);
  });

  it('parses number with custom parse function', () => {
    const { result } = renderHook(
      () => useUrlParamValue<number>('page', {
        parse: (v) => (v ? parseInt(v, 10) : 0),
      }),
      { wrapper }
    );
    expect(result.current).toBe(42);
  });

  it('parses boolean with custom parse function', () => {
    const { result } = renderHook(
      () => useUrlParamValue<boolean>('active', {
        parse: (v) => v === 'true',
      }),
      { wrapper }
    );
    expect(result.current).toBe(true);
  });

  it('returns default from parse when param is absent', () => {
    const { result } = renderHook(
      () => useUrlParamValue<number>('missing', {
        parse: (v) => (v ? parseInt(v, 10) : 1),
      }),
      { wrapper }
    );
    expect(result.current).toBe(1);
  });

  it('returns false from boolean parse when param is absent', () => {
    const { result } = renderHook(
      () => useUrlParamValue<boolean>('missing', {
        parse: (v) => v === 'true',
      }),
      { wrapper }
    );
    expect(result.current).toBe(false);
  });
});
