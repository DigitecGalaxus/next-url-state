import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, renderHook, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/'),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
  useRouter: jest.fn().mockReturnValue({}),
}));

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

  it('should keep multiple components in sync', async () => {
    const user = userEvent.setup();
    const TestComponent = ({ id }: { id: string }) => {
      const [value, setValue] = useUrlParam('syncParam');
      return (
        <div>
          <p data-testid={`value-${id}`}>{value}</p>
          <input
            data-testid={`input-${id}`}
            value={value || ''}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      );
    };

    render(
      <UrlParamsProvider>
        <TestComponent id="1" />
        <TestComponent id="2" />
      </UrlParamsProvider>,
    );

    await user.type(screen.getByTestId('input-1'), 'synced');

    await waitFor(() => {
      expect(screen.getByTestId('value-1')).toHaveTextContent('synced');
    });
    expect(screen.getByTestId('value-2')).toHaveTextContent('synced');
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
