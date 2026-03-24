import { UrlParamsProvider } from 'next-url-state';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UrlParamsProvider>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
        }
        .example-section {
          padding: 35px 0;
          border-bottom: 1px solid #bbb;
        }
        h1 {
          color: #333;
        }
        h2 {
          color: #666;
          font-size: 20px;
        }
        input, button {
          padding: 8px 12px;
          margin: 5px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        button {
          border: none;
          position: relative;
          display: inline-flex;
          align-items: center;
          font: 400 14px/20px Arial, sans-serif;
          cursor: pointer;
          color: #0009;
          background-color: transparent;
          height: 40px;
          min-width: 40px;
        }
        button.active {
          color: #000;
        }
        button.secondary {
          color: #000;
          background-color: #eee;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
      <Component {...pageProps} />
    </UrlParamsProvider>
  );
}
