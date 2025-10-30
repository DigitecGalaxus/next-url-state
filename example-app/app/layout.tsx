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
              border: none;
              position: relative;
              display: inline-flex;
              align-items: center;
              font: 400 14px/20px Galactica,Arial,sans-serif;
              letter-spacing: .005em;
              cursor: pointer;
              color: #0009;
              background-color: transparent;
              height: 40px;
              min-width: 40px;
            }
            button.active {
              color: #000;

              &:after {
                content: "";
                position: absolute;
                bottom: 0px;
                left: 0px;
                right: 0px;
                border-bottom: 3px solid transparent;
                border-bottom-color: #eeb524;
              }
            }
            button.secondary {
              color: #000;
              background-color: #eee;
            }
            button:hover:after {
              content: "";
              position: absolute;
              bottom: 0px;
              left: 0px;
              right: 0px;
              border-bottom: 3px solid transparent;
              border-bottom-color: #ddd;
            }
            button:disabled {
              background: #ccc;
              cursor: not-allowed;
            }
            
          `}</style>
          {children}
        </UrlParamsProvider>
      </body>
    </html>
  );
}
