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
          margin: 40px 0;
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 8px;
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
          background: #0070f3;
          color: white;
          border: none;
          cursor: pointer;
        }
        button:hover {
          background: #0051cc;
        }
        button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        .url-display {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          margin: 10px 0;
          word-break: break-all;
        }
        .tag {
          display: inline-block;
          padding: 4px 8px;
          margin: 4px;
          background: #e0e0e0;
          border-radius: 4px;
          font-size: 12px;
        }
      `}</style>
      <Component {...pageProps} />
    </UrlParamsProvider>
  );
}
