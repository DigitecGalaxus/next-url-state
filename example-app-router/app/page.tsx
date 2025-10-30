'use client';

import { useUrlParam, useUrlParamArray, useUrlParams } from 'next-url-state';

export default function HomePage() {
  return (
    <div className="container">
      <h1>next-url-state - App Router Demo</h1>
      <p>This example demonstrates the library working with Next.js App Router (next/navigation)</p>

      <SearchExample />
      <ArrayExample />
      <MultiParamExample />
      <PaginationExample />
    </div>
  );
}

function SearchExample() {
  const [search, setSearch] = useUrlParam('search');

  return (
    <div className="example-section">
      <h2>Search Parameter</h2>
      <p>Single string parameter with debounced updates</p>

      <input
        type="text"
        value={search || ''}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Type to search..."
      />

      <div className="url-display">
        Current value: {search || '(empty)'}
      </div>

      <button onClick={() => setSearch(undefined)}>Clear</button>
    </div>
  );
}

function ArrayExample() {
  const [tags, setTags] = useUrlParamArray<string[]>('tag', {
    parse: (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      return [value];
    },
  });
  const [inputValue, setInputValue] = React.useState('');

  const addTag = () => {
    const trimmedValue = inputValue.trim();

    // Optional: Validate tag doesn't contain special URL characters
    if (trimmedValue) {
      // Remove any characters that would look weird in URLs (optional)
      // const sanitized = trimmedValue.replace(/[=&?#]/g, '-');

      setTags([...tags, trimmedValue]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="example-section">
      <h2>Array Parameters (Tags)</h2>
      <p>Multiple values for the same parameter: ?tag=react&tag=nextjs</p>

      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTag()}
          placeholder="Add a tag..."
        />
        <button onClick={addTag}>Add Tag</button>
      </div>

      <div style={{ marginTop: '10px' }}>
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            <button
              onClick={() => removeTag(tag)}
              style={{ marginLeft: '8px', background: 'transparent', color: '#666', border: 'none', cursor: 'pointer' }}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <div className="url-display">
        Tags: {JSON.stringify(tags)}
      </div>
    </div>
  );
}

function MultiParamExample() {
  const [params, setParams] = useUrlParams(['filter', 'sort', 'view']);

  return (
    <div className="example-section">
      <h2>Multiple Parameters</h2>
      <p>Managing multiple URL parameters at once</p>

      <div>
        <label>
          Filter:
          <select
            value={params.filter || 'all'}
            onChange={(e) => setParams({ ...params, filter: e.target.value === 'all' ? undefined : e.target.value })}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <label style={{ marginLeft: '10px' }}>
          Sort:
          <select
            value={params.sort || 'date'}
            onChange={(e) => setParams({ ...params, sort: e.target.value === 'date' ? undefined : e.target.value })}
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="priority">Priority</option>
          </select>
        </label>

        <label style={{ marginLeft: '10px' }}>
          View:
          <select
            value={params.view || 'grid'}
            onChange={(e) => setParams({ ...params, view: e.target.value === 'grid' ? undefined : e.target.value })}
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </label>
      </div>

      <div className="url-display">
        Params: {JSON.stringify(params, null, 2)}
      </div>

      <button onClick={() => setParams({ filter: undefined, sort: undefined, view: undefined })}>
        Reset All
      </button>
    </div>
  );
}

function PaginationExample() {
  const [page, setPage] = useUrlParam<number>('page', {
    parse: (value) => value ? parseInt(value, 10) : 1,
    serialize: (value) => value && value !== 1 ? value.toString() : undefined,
  });

  const currentPage = page || 1;

  return (
    <div className="example-section">
      <h2>Pagination</h2>
      <p>Number parameter with custom parsing and serialization</p>

      <div>
        <button
          className="secondary"
          onClick={() => setPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
        >
          ← Previous
        </button>

        <span style={{ margin: '0 20px', fontWeight: 'bold' }}>
          Page {currentPage}
        </span>

        <button onClick={() => setPage(currentPage + 1)}>
          Next →
        </button>
      </div>

      <div className="url-display">
        Current page: {currentPage}
      </div>

      <button onClick={() => setPage(1)}>Reset to Page 1</button>
    </div>
  );
}

// Add React import for useState
import React from 'react';
