import { describe, it, expect } from '@jest/globals';
import { parseUrlWithImplicitDomain } from '../utils/urlParsing';

describe('parseUrlWithImplicitDomain', () => {
  it('should parse pathname and search params', () => {
    const result = parseUrlWithImplicitDomain('/page?name=John&age=25');
    expect(result.pathname).toBe('/page');
    expect(result.search).toBe('?name=John&age=25');
    expect(result.hash).toBe('');
  });

  it('should parse pathname without search params', () => {
    const result = parseUrlWithImplicitDomain('/page');
    expect(result.pathname).toBe('/page');
    expect(result.search).toBe('');
    expect(result.hash).toBe('');
  });

  it('should parse with hash', () => {
    const result = parseUrlWithImplicitDomain('/page?name=John#section');
    expect(result.pathname).toBe('/page');
    expect(result.search).toBe('?name=John');
    expect(result.hash).toBe('#section');
  });

  it('should parse hash without search params', () => {
    const result = parseUrlWithImplicitDomain('/page#section');
    expect(result.pathname).toBe('/page');
    expect(result.search).toBe('');
    expect(result.hash).toBe('#section');
  });

  it('should handle root path', () => {
    const result = parseUrlWithImplicitDomain('/');
    expect(result.pathname).toBe('/');
    expect(result.search).toBe('');
    expect(result.hash).toBe('');
  });

  it('should handle root path with query', () => {
    const result = parseUrlWithImplicitDomain('/?name=John');
    expect(result.pathname).toBe('/');
    expect(result.search).toBe('?name=John');
    expect(result.hash).toBe('');
  });

  it('should handle nested paths', () => {
    const result = parseUrlWithImplicitDomain('/products/123?view=details');
    expect(result.pathname).toBe('/products/123');
    expect(result.search).toBe('?view=details');
    expect(result.hash).toBe('');
  });

  it('should handle URL encoded characters in pathname', () => {
    const result = parseUrlWithImplicitDomain('/path%20with%20spaces?name=John');
    expect(result.pathname).toBe('/path%20with%20spaces');
    expect(result.search).toBe('?name=John');
  });

  it('should handle empty search params with question mark', () => {
    const result = parseUrlWithImplicitDomain('/page?');
    expect(result.pathname).toBe('/page');
    expect(result.search).toBe('');
    expect(result.hash).toBe('');
  });

  it('should handle complex query strings', () => {
    const result = parseUrlWithImplicitDomain('/page?a=1&b=2&c=3&d=4');
    expect(result.pathname).toBe('/page');
    expect(result.search).toBe('?a=1&b=2&c=3&d=4');
    expect(result.hash).toBe('');
  });

  it('should handle both query and hash', () => {
    const result = parseUrlWithImplicitDomain('/page?name=John&age=25#section-1');
    expect(result.pathname).toBe('/page');
    expect(result.search).toBe('?name=John&age=25');
    expect(result.hash).toBe('#section-1');
  });

  it('should handle hash with special characters', () => {
    const result = parseUrlWithImplicitDomain('/page#section-with-dashes');
    expect(result.pathname).toBe('/page');
    expect(result.search).toBe('');
    expect(result.hash).toBe('#section-with-dashes');
  });
});
