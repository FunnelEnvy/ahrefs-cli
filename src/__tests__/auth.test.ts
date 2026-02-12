import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveApiKey, requireApiKey, getAuthHeaders } from '../auth.js';

describe('auth', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env['AHREFS_API_KEY'];
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('resolveApiKey', () => {
    it('returns flag value when provided', () => {
      expect(resolveApiKey('flag-key')).toBe('flag-key');
    });

    it('returns env var when flag not provided', () => {
      process.env['AHREFS_API_KEY'] = 'env-key';
      expect(resolveApiKey()).toBe('env-key');
    });

    it('prefers flag over env', () => {
      process.env['AHREFS_API_KEY'] = 'env-key';
      expect(resolveApiKey('flag-key')).toBe('flag-key');
    });

    it('returns undefined when no key found', () => {
      expect(resolveApiKey()).toBeUndefined();
    });
  });

  describe('requireApiKey', () => {
    it('returns key when present', () => {
      expect(requireApiKey('test-key')).toBe('test-key');
    });

    it('exits when no key found', () => {
      const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit');
      });
      const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => requireApiKey()).toThrow('process.exit');
      expect(mockExit).toHaveBeenCalledWith(1);
      expect(mockError).toHaveBeenCalled();

      mockExit.mockRestore();
      mockError.mockRestore();
    });
  });

  describe('getAuthHeaders', () => {
    it('returns Bearer token header', () => {
      const headers = getAuthHeaders('my-key');
      expect(headers.Authorization).toBe('Bearer my-key');
    });
  });
});
