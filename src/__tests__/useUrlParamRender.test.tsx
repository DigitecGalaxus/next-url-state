import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useCallback } from 'react';
import { useUrlParam } from '../useUrlParam';
import { UrlParamsProvider } from '../UrlParamsContext';

// Variables prefixed with 'mock' are accessible in jest.mock factories despite hoisting
const mockPush = jest.fn<() => Promise<boolean>>().mockResolvedValue(true);
const mockReplace = jest.fn<() => Promise<boolean>>().mockResolvedValue(true);
let mockAsPath = '/';

jest.mock('next/router', () => ({
  useRouter: () => ({
    isReady: true,
    asPath: mockAsPath,
    push: mockPush,
    replace: mockReplace,
  }),
}));

jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/'),
  useSearchParams: jest.fn().mockReturnValue(new URLSearchParams()),
  useRouter: jest.fn().mockReturnValue({}),
}));

const RenderCounter = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const renders = React.useRef(0);
  renders.current += 1;
  return (
    <div>
      <span data-testid={`renders-${id}`}>{renders.current}</span>
      {children}
    </div>
  );
};

const ParamComponent = ({ param }: { param: string }) => {
  const [value, setValue] = useUrlParam(param);
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => { setValue(e.target.value); },
    [setValue],
  );
  return (
    <RenderCounter id={`param-${param}`}>
      <input data-testid={`input-${param}`} value={value || ''} onChange={handleChange} />
    </RenderCounter>
  );
};

describe('useUrlParam rerender behavior', () => {
  beforeEach(() => {
    mockAsPath = '/';
    mockPush.mockClear();
    mockReplace.mockClear();
  });

  it('should only rerender components using the changed parameter', async () => {
    const user = userEvent.setup();
    render(
      <UrlParamsProvider>
        <RenderCounter id="parent">
          <ParamComponent param="param1" />
          <ParamComponent param="param2" />
        </RenderCounter>
      </UrlParamsProvider>,
    );

    expect(screen.getByTestId('renders-parent')).toHaveTextContent('1');
    expect(screen.getByTestId('renders-param-param1')).toHaveTextContent('1');
    expect(screen.getByTestId('renders-param-param2')).toHaveTextContent('1');

    await user.type(screen.getByTestId('input-param1'), 'A');

    expect(screen.getByTestId('renders-parent')).toHaveTextContent('1');
    expect(screen.getByTestId('renders-param-param1')).toHaveTextContent('2');
    expect(screen.getByTestId('renders-param-param2')).toHaveTextContent('1');

    await user.type(screen.getByTestId('input-param2'), 'B');

    expect(screen.getByTestId('renders-parent')).toHaveTextContent('1');
    expect(screen.getByTestId('renders-param-param1')).toHaveTextContent('2');
    expect(screen.getByTestId('renders-param-param2')).toHaveTextContent('2');
  });

  it('should rerender both components using the same parameter', async () => {
    const user = userEvent.setup();
    render(
      <UrlParamsProvider>
        <RenderCounter id="parent">
          <ParamComponent param="sharedParam" />
          <ParamComponent param="sharedParam" />
        </RenderCounter>
      </UrlParamsProvider>,
    );

    expect(screen.getByTestId('renders-parent')).toHaveTextContent('1');
    expect(screen.getAllByTestId('renders-param-sharedParam')[0]).toHaveTextContent('1');
    expect(screen.getAllByTestId('renders-param-sharedParam')[1]).toHaveTextContent('1');

    await user.type(screen.getAllByTestId('input-sharedParam')[0], 'A');

    expect(screen.getByTestId('renders-parent')).toHaveTextContent('1');
    expect(screen.getAllByTestId('renders-param-sharedParam')[0]).toHaveTextContent('2');
    expect(screen.getAllByTestId('renders-param-sharedParam')[1]).toHaveTextContent('2');
  });

  it('should render only once even if two params change simultaneously', async () => {
    const user = userEvent.setup();
    mockAsPath = '/?name=John&age=30';

    const FormWithReset = () => {
      const [name, setName] = useUrlParam('name', { parse: (p) => p || '' });
      const [age, setAge] = useUrlParam<number>('age', {
        parse: (p) => (p ? parseInt(p, 10) : 0),
        serialize: (v) => v.toString(),
      });
      return (
        <RenderCounter id="form">
          <button onClick={() => { setName(''); setAge(0); }}>Reset</button>
          <div data-testid="result">{JSON.stringify({ name, age })}</div>
        </RenderCounter>
      );
    };

    render(
      <UrlParamsProvider>
        <RenderCounter id="parent">
          <FormWithReset />
        </RenderCounter>
      </UrlParamsProvider>,
    );

    expect(screen.getByTestId('renders-parent')).toHaveTextContent('1');
    expect(screen.getByTestId('renders-form')).toHaveTextContent('1');

    await user.click(screen.getByText('Reset'));

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent(JSON.stringify({ name: '', age: 0 }));
    });

    expect(screen.getByTestId('renders-parent')).toHaveTextContent('1');
    // The form should only re-render once even though two params changed
    expect(screen.getByTestId('renders-form')).toHaveTextContent('2');
  });
});
