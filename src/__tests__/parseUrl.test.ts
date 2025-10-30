import { describe, it, expect } from '@jest/globals';
import { getUrlParams } from '../utils/parseUrl';

describe('getUrlParams', () => {
  it('should parse single parameter', () => {
    const result = getUrlParams('/page?name=John');
    expect(result).toEqual({ name: 'John' });
  });

  it('should parse multiple different parameters', () => {
    const result = getUrlParams('/page?name=John&age=25&city=NYC');
    expect(result).toEqual({
      name: 'John',
      age: '25',
      city: 'NYC',
    });
  });

  it('should parse array parameters (multiple same key)', () => {
    const result = getUrlParams('/page?tag=react&tag=nextjs&tag=typescript');
    expect(result).toEqual({
      tag: ['react', 'nextjs', 'typescript'],
    });
  });

  it('should handle empty parameter values', () => {
    const result = getUrlParams('/page?name=&age=25');
    expect(result).toEqual({
      name: '',
      age: '25',
    });
  });

  it('should handle paths without parameters', () => {
    const result = getUrlParams('/page');
    expect(result).toEqual({});
  });

  it('should handle paths with hash', () => {
    const result = getUrlParams('/page?name=John#section');
    expect(result).toEqual({ name: 'John' });
  });

  it('should handle URL encoded values', () => {
    const result = getUrlParams('/page?name=John%20Doe&email=test%40example.com');
    expect(result).toEqual({
      name: 'John Doe',
      email: 'test@example.com',
    });
  });

  it('should handle mixed single and array parameters', () => {
    const result = getUrlParams('/page?name=John&tag=react&tag=nextjs&age=25');
    expect(result).toEqual({
      name: 'John',
      tag: ['react', 'nextjs'],
      age: '25',
    });
  });

  it('should handle special characters', () => {
    const result = getUrlParams('/page?search=hello+world&filter=a%3Db');
    expect(result).toEqual({
      search: 'hello world',
      filter: 'a=b',
    });
  });

  it('should handle empty query string', () => {
    const result = getUrlParams('/page?');
    expect(result).toEqual({});
  });

  it('should convert duplicate parameters to array', () => {
    const result = getUrlParams('/page?id=1&id=2');
    expect(result).toEqual({
      id: ['1', '2'],
    });
  });

  it('should handle parameters with multiple equals signs', () => {
    const result = getUrlParams('/page?data=key%3Dvalue');
    expect(result).toEqual({
      data: 'key=value',
    });
  });
});
