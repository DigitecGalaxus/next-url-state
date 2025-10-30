import { FunctionComponent, useState } from 'react';
import { ArrayParamExample, BooleanParamExample, MultipleParamsExample, NumberParamExample, PaginationExample, ReadOnlyParamExample, SimpleParamExample } from '../components/demoComponents';

const demos: { label: string; component: FunctionComponent }[] = [
  { label: 'Simple Param', component: SimpleParamExample },
  { label: 'Number Param', component: NumberParamExample },
  { label: 'Boolean Param', component: BooleanParamExample },
  { label: 'Array Param', component: ArrayParamExample },
  { label: 'Multiple Params', component: MultipleParamsExample },
  { label: 'Read-Only Param', component: ReadOnlyParamExample },
  { label: 'Pagination', component: PaginationExample },
];

const Home: FunctionComponent = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const ActiveDemo = demos[activeTab].component;

  return (
    <div className="container">

      <h1>🧪 next-url-state Test Page</h1>

      <div className="url-display">
        <strong>Current URL:</strong> {currentUrl}
      </div>

      <div className="tabs">
        {demos.map((demo, index) => (
          <button
            key={demo.label}
            onClick={() => setActiveTab(index)}
            className={`tab-button ${activeTab === index ? 'active' : ''}`}
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
        .tab-button {
          padding: 8px 16px;
          margin-right: 8px;
          margin-bottom: 8px;
          border: 1px solid #ddd;
          border-radius: 8px 8px 0 0;
          background: #f5f5f5;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          font-weight: 500;
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
  );
};

export default Home;
