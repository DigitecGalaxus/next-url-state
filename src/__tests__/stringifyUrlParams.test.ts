import { describe, it, expect } from '@jest/globals';
import { stringifyUrlParams } from '../utils/stringifyUrlParams';

describe('stringifyUrlParams', () => {
  it('should convert single parameter to query string', () => {
    const result = stringifyUrlParams({ name: 'John' });
    expect(result).toBe('name=John');
  });

  it('should convert multiple parameters to query string', () => {
    const result = stringifyUrlParams({
      name: 'John',
      age: '25',
      city: 'NYC',
    });
    expect(result).toBe('name=John&age=25&city=NYC');
  });

  it('should handle array parameters', () => {
    const result = stringifyUrlParams({
      tags: ['react', 'nextjs', 'typescript'],
    });
    expect(result).toBe('tags=react&tags=nextjs&tags=typescript');
  });

  it('should handle mixed single and array parameters', () => {
    const result = stringifyUrlParams({
      name: 'John',
      tags: ['react', 'nextjs'],
    });
    expect(result).toBe('name=John&tags=react&tags=nextjs');
  });

  it('should skip undefined values', () => {
    const result = stringifyUrlParams({
      name: 'John',
      age: undefined,
      city: 'NYC',
    });
    expect(result).toBe('name=John&city=NYC');
  });

  it('should handle empty strings', () => {
    const result = stringifyUrlParams({
      name: '',
      age: '25',
    });
    expect(result).toBe('name=&age=25');
  });

  it('should URL encode special characters', () => {
    const result = stringifyUrlParams({
      name: 'John Doe',
      email: 'test@example.com',
    });
    expect(result).toBe('name=John+Doe&email=test%40example.com');
  });

  it('should handle empty object', () => {
    const result = stringifyUrlParams({});
    expect(result).toBe('');
  });

  it('should handle empty array', () => {
    const result = stringifyUrlParams({
      tags: [],
    });
    expect(result).toBe('');
  });

  it('should encode equals signs in values', () => {
    const result = stringifyUrlParams({
      data: 'key=value',
    });
    expect(result).toBe('data=key%3Dvalue');
  });

  it('should encode ampersands in values', () => {
    const result = stringifyUrlParams({
      query: 'a&b',
    });
    expect(result).toBe('query=a%26b');
  });

  it('should handle numbers as strings', () => {
    const result = stringifyUrlParams({
      count: '42',
      page: '1',
    });
    expect(result).toBe('count=42&page=1');
  });

  it('should preserve order of parameters', () => {
    const params = {
      z: 'last',
      a: 'first',
      m: 'middle',
    };
    const result = stringifyUrlParams(params);
    // URLSearchParams preserves insertion order
    expect(result).toBe('z=last&a=first&m=middle');
  });
});
