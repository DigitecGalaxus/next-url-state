'use client';

import React, { FunctionComponent, useState } from 'react';
import { SimpleParamExample, NumberParamExample, BooleanParamExample, ArrayParamExample, MultipleParamsExample, ReadOnlyParamExample, PaginationExample } from './components/demoComponents';

const demos: { label: string; component: FunctionComponent }[] = [
  { label: 'Simple', component: SimpleParamExample },
  { label: 'Number', component: NumberParamExample },
  { label: 'Boolean', component: BooleanParamExample },
  { label: 'Array', component: ArrayParamExample },
  { label: 'Multiple', component: MultipleParamsExample },
  { label: 'Read-Only', component: ReadOnlyParamExample },
  { label: 'Pagination', component: PaginationExample },
];

export default function HomePage() {
   const [activeTab, setActiveTab] = useState<number>(0);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const ActiveDemo = demos[activeTab].component;

  return (
    <div className="container">

      <h1>Examples</h1>

      <div className="url-display">
        <strong>Current URL:</strong> {currentUrl}
      </div>

      <div className="tabs">
        {demos.map((demo, index) => (
          <button
            key={demo.label}
            onClick={() => setActiveTab(index)}
            className={`${activeTab === index ? 'active' : ''}`}
          >
            {demo.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        <ActiveDemo />
      </div>

      <style jsx>{`
        .tabs {
          display: flex;
          flex-wrap: wrap;
          margin: 20px 0;
        }
        .tab-button:hover {
          background: #e0e0e0;
        }
        .tab-button.active {
          background: #0070f3;
          color: white;
          border-bottom: 2px solid #0070f3;
        }
        .tab-content {
          border: 1px solid #ddd;
          border-radius: 0 8px 8px 8px;
          padding: 20px;
        }
      `}</style>
    </div>
    )
}



