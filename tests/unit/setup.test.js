import { describe, it, expect } from 'vitest';

describe('Test Setup', () => {
  it('should have vitest configured correctly', () => {
    expect(true).toBe(true);
  });

  it('should have localStorage mock available', () => {
    expect(global.localStorage).toBeDefined();
    expect(typeof global.localStorage.getItem).toBe('function');
  });

  it('should have matchMedia mock available', () => {
    expect(window.matchMedia).toBeDefined();
    expect(typeof window.matchMedia).toBe('function');
  });
});
