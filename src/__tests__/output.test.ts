import { describe, it, expect } from 'vitest';
import { formatOutput } from '../lib/output.js';

describe('output', () => {
  const sampleData = [
    { domain: 'example.com', domain_rating: 75, backlinks: 1200 },
    { domain: 'test.org', domain_rating: 42, backlinks: 350 },
  ];

  describe('formatOutput', () => {
    it('formats as JSON', () => {
      const result = formatOutput(sampleData, 'json');
      const parsed = JSON.parse(result);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].domain).toBe('example.com');
      expect(parsed[1].domain_rating).toBe(42);
    });

    it('formats single object as JSON', () => {
      const result = formatOutput({ domain_rating: 75 }, 'json');
      const parsed = JSON.parse(result);
      expect(parsed.domain_rating).toBe(75);
    });

    it('formats as table', () => {
      const result = formatOutput(sampleData, 'table');
      expect(result).toContain('domain');
      expect(result).toContain('example.com');
      expect(result).toContain('75');
    });

    it('formats as CSV', () => {
      const result = formatOutput(sampleData, 'csv');
      expect(result).toContain('domain');
      expect(result).toContain('example.com');
      expect(result).toContain('75');
    });

    it('returns "No data" for empty table', () => {
      const result = formatOutput([], 'table');
      expect(result).toBe('No data');
    });

    it('returns empty string for empty CSV', () => {
      const result = formatOutput([], 'csv');
      expect(result).toBe('');
    });
  });
});
