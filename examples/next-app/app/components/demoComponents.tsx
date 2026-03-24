import { useUrlParam, useUrlParamArray, useUrlParams, useUrlParamValue } from 'next-url-state';
import { FunctionComponent, useState } from 'react';

// ==========================
// Demo-Komponenten
// ==========================
export const SimpleParamExample: FunctionComponent = () => {
  const [search, setSearch] = useUrlParam('search');
  return (
    <div>
      <h2>Simple String Parameter</h2>
      <input
        type="text"
        value={search || ''}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Type to update URL..."
      />
      <p>Current value: <strong>{search || '(empty)'}</strong></p>
    </div>
  );
};

export  const NumberParamExample: FunctionComponent = () => {
  const [count, setCount] = useUrlParam<number>('count', {
    parse: (value) => (value ? parseInt(value, 10) : 0),
    serialize: (value) => (value > 0 ? value.toString() : undefined),
  });
  return (
    <div>
      <h2>Number Parameter</h2>
      <button onClick={() => setCount((count || 0) - 1)}>-</button>
      <span style={{ margin: '0 20px' }}><strong>{count || 0}</strong></span>
      <button onClick={() => setCount((count || 0) + 1)}>+</button>
    </div>
  );
};

export const BooleanParamExample: FunctionComponent = () => {
  const [enabled, setEnabled] = useUrlParam<boolean>('enabled', {
    parse: (value) => value === 'true',
    serialize: (value) => (value ? 'true' : undefined),
  });
  return (
    <div>
      <h2>Boolean Parameter</h2>
      <label>
        <input
          type="checkbox"
          checked={enabled || false}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        {' '}Enable feature
      </label>
      <p>Current value: <strong>{enabled ? 'true' : 'false'}</strong></p>
    </div>
  );
};

export const ArrayParamExample: FunctionComponent = () => {
  const [tags, setTags] = useUrlParamArray<string[]>('tags', {
    parse: (value) => (Array.isArray(value) ? value : value ? [value] : []),
  });
  const [newTag, setNewTag] = useState('');
  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };
  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  return (
    <div>
      <h2>Array Parameter</h2>
      <input
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && addTag()}
        placeholder="Add a tag..."
      />
      <button onClick={addTag}>Add</button>
      <div style={{ marginTop: '10px' }}>
        {tags.map((tag) => (
          <span key={tag} style={{ display: 'inline-block', margin: '4px', padding: '4px 8px', background: '#e0e0e0', borderRadius: '4px' }}>
            {tag} <button onClick={() => removeTag(tag)} style={{ marginLeft: '6px', fontSize: '10px' }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
};

export const MultipleParamsExample: FunctionComponent = () => {
  const [params, setParams] = useUrlParams(['filter', 'sort', 'view']);
  return (
    <div>
      <h2>Multiple Parameters</h2>
      <label>
        Filter:{' '}
        <select value={params.filter || ''} onChange={(e) => setParams({ ...params, filter: e.target.value || undefined })}>
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </label>
      <br />
      <label>
        Sort:{' '}
        <select value={params.sort || ''} onChange={(e) => setParams({ ...params, sort: e.target.value || undefined })}>
          <option value="">Default</option>
          <option value="date">Date</option>
          <option value="name">Name</option>
        </select>
      </label>
      <br />
      <label>
        View:{' '}
        <select value={params.view || ''} onChange={(e) => setParams({ ...params, view: e.target.value || undefined })}>
          <option value="">Auto</option>
          <option value="grid">Grid</option>
          <option value="list">List</option>
        </select>
      </label>
      <br />
      <button onClick={() => setParams({ filter: undefined, sort: undefined, view: undefined })}>
        Clear All
      </button>
    </div>
  );
};

export const ReadOnlyParamExample: FunctionComponent = () => {
  const userId = useUrlParamValue('userId');
  return (
    <div>
      <h2>Read-Only Parameter</h2>
      <p>User ID from URL: <strong>{userId || '(not set)'}</strong></p>
      <p><em>Add ?userId=123 to URL to test.</em></p>
    </div>
  );
};

export const PaginationExample: FunctionComponent = () => {
  const [page, setPage] = useUrlParam<number>('page', {
    parse: (value) => (value ? parseInt(value, 10) : 1),
    serialize: (value) => (value > 1 ? value.toString() : undefined),
  });
  const currentPage = page || 1;
  return (
    <div>
      <h2>Pagination Example</h2>
      <button onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1}>← Previous</button>
      <span style={{ margin: '0 20px' }}>Page <strong>{currentPage}</strong></span>
      <button onClick={() => setPage(currentPage + 1)}>Next →</button>
      <p><em>Page 1 is not shown in URL (default value)</em></p>
    </div>
  );
};
