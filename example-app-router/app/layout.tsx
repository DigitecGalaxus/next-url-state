'use client';

import { UrlParamsProvider } from 'next-url-state';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>next-url-state - App Router Example</title>
      </head>
      <body>
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
              background: #0070f3;
              color: white;
              border: none;
              cursor: pointer;
              color: #fff;
              background-color: #444;
              border-radius: 4px;
            }
            button.secondary {
              color: #000;
              background-color: #eee;
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
              width: 60%;
            }
            .tag {
              display: inline-block;
              padding: 4px 8px;
              margin: 4px;
              background: #e0e0e0;
              border-radius: 4px;
              font-size: 12px;
            }
            .router-badge {
              display: inline-block;
              padding: 6px 12px;
              background: #10b981;
              color: white;
              border-radius: 4px;
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 20px;
            }
          `}</style>
          {children}
        </UrlParamsProvider>
      </body>
    </html>
  );
}
