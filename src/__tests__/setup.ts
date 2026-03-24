import '@testing-library/jest-dom';

// Simulate Pages Router environment for all hook tests
(window as unknown as Record<string, unknown>).__NEXT_DATA__ = {};
