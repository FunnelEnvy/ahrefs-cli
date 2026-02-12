import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import nock from 'nock';
import { AhrefsClient } from '../lib/api-client.js';

const BASE_URL = 'https://api.ahrefs.com';
const API_KEY = 'test-api-key-12345';

describe('AhrefsClient', () => {
  let client: AhrefsClient;

  beforeEach(() => {
    client = new AhrefsClient(API_KEY);
    nock.cleanAll();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('getBacklinks', () => {
    it('fetches backlinks for a target', async () => {
      const mockResponse = {
        backlinks: [
          {
            url_from: 'https://blog.example.com/post',
            url_to: 'https://ahrefs.com',
            ahrefs_rank: 12500,
            domain_rating: 85,
            anchor: 'SEO tools',
            encoding: 'utf-8',
            first_seen: '2024-01-15',
            last_seen: '2024-06-01',
            is_dofollow: true,
            is_content: true,
            page_title: 'Best SEO Tools for 2024',
            language: 'en',
            traffic: 500,
            linked_domains: 45,
          },
          {
            url_from: 'https://news.example.org/article',
            url_to: 'https://ahrefs.com/blog',
            ahrefs_rank: 8900,
            domain_rating: 72,
            anchor: 'backlink checker',
            encoding: 'utf-8',
            first_seen: '2024-03-10',
            last_seen: '2024-06-01',
            is_dofollow: false,
            is_content: true,
            page_title: 'How to Check Backlinks',
            language: 'en',
            traffic: 120,
            linked_domains: 22,
          },
        ],
      };

      nock(BASE_URL)
        .get('/v3/site-explorer/all-backlinks')
        .query({
          target: 'ahrefs.com',
          mode: 'subdomains',
          protocol: 'both',
          limit: '50',
          offset: '0',
        })
        .matchHeader('Authorization', `Bearer ${API_KEY}`)
        .reply(200, mockResponse);

      const result = await client.getBacklinks({ target: 'ahrefs.com' });
      expect(result.backlinks).toHaveLength(2);
      expect(result.backlinks[0].url_from).toBe('https://blog.example.com/post');
      expect(result.backlinks[0].anchor).toBe('SEO tools');
      expect(result.backlinks[1].is_dofollow).toBe(false);
    });

    it('passes pagination parameters', async () => {
      nock(BASE_URL)
        .get('/v3/site-explorer/all-backlinks')
        .query({
          target: 'example.com',
          mode: 'domain',
          protocol: 'https',
          limit: '10',
          offset: '20',
        })
        .reply(200, { backlinks: [] });

      const result = await client.getBacklinks({
        target: 'example.com',
        limit: 10,
        offset: 20,
        mode: 'domain',
        protocol: 'https',
      });
      expect(result.backlinks).toHaveLength(0);
    });
  });

  describe('getOrganicKeywords', () => {
    it('fetches organic keywords for a target', async () => {
      const mockResponse = {
        keywords: [
          {
            keyword: 'seo tools',
            volume: 33100,
            position: 3,
            url: 'https://ahrefs.com/seo',
            traffic: 8200,
            cpc: 12.5,
            difficulty: 78,
            serp_features: ['featured_snippet', 'people_also_ask'],
            last_updated: '2024-06-01',
            country: 'us',
          },
          {
            keyword: 'backlink checker',
            volume: 22200,
            position: 1,
            url: 'https://ahrefs.com/backlink-checker',
            traffic: 15400,
            cpc: 8.3,
            difficulty: 65,
            serp_features: ['sitelinks'],
            last_updated: '2024-06-01',
            country: 'us',
          },
        ],
      };

      nock(BASE_URL)
        .get('/v3/site-explorer/organic-keywords')
        .query({
          target: 'ahrefs.com',
          mode: 'subdomains',
          protocol: 'both',
          country: 'us',
          limit: '50',
          offset: '0',
        })
        .reply(200, mockResponse);

      const result = await client.getOrganicKeywords({ target: 'ahrefs.com' });
      expect(result.keywords).toHaveLength(2);
      expect(result.keywords[0].keyword).toBe('seo tools');
      expect(result.keywords[0].volume).toBe(33100);
      expect(result.keywords[1].position).toBe(1);
    });

    it('supports country filter', async () => {
      nock(BASE_URL)
        .get('/v3/site-explorer/organic-keywords')
        .query({
          target: 'example.com',
          mode: 'subdomains',
          protocol: 'both',
          country: 'gb',
          limit: '50',
          offset: '0',
        })
        .reply(200, { keywords: [] });

      const result = await client.getOrganicKeywords({
        target: 'example.com',
        country: 'gb',
      });
      expect(result.keywords).toHaveLength(0);
    });
  });

  describe('getRefDomains', () => {
    it('fetches referring domains', async () => {
      const mockResponse = {
        refdomains: [
          {
            domain: 'blog.example.com',
            domain_rating: 85,
            backlinks: 12,
            first_seen: '2023-06-01',
            last_seen: '2024-06-01',
            is_dofollow: true,
            traffic: 5200,
            linked_domains: 340,
          },
          {
            domain: 'news.example.org',
            domain_rating: 72,
            backlinks: 3,
            first_seen: '2024-01-15',
            last_seen: '2024-06-01',
            is_dofollow: true,
            traffic: 1800,
            linked_domains: 120,
          },
        ],
      };

      nock(BASE_URL)
        .get('/v3/site-explorer/refdomains')
        .query({
          target: 'ahrefs.com',
          mode: 'subdomains',
          protocol: 'both',
          limit: '50',
          offset: '0',
        })
        .reply(200, mockResponse);

      const result = await client.getRefDomains({ target: 'ahrefs.com' });
      expect(result.refdomains).toHaveLength(2);
      expect(result.refdomains[0].domain).toBe('blog.example.com');
      expect(result.refdomains[0].domain_rating).toBe(85);
    });
  });

  describe('getDomainRating', () => {
    it('fetches domain rating', async () => {
      const mockResponse = {
        domain_rating: 91,
        ahrefs_rank: 97,
      };

      nock(BASE_URL)
        .get('/v3/site-explorer/domain-rating')
        .query({
          target: 'ahrefs.com',
          mode: 'subdomains',
          protocol: 'both',
        })
        .reply(200, mockResponse);

      const result = await client.getDomainRating({ target: 'ahrefs.com' });
      expect(result.domain_rating).toBe(91);
      expect(result.ahrefs_rank).toBe(97);
    });
  });

  describe('getOverview', () => {
    it('fetches site overview metrics', async () => {
      const mockResponse = {
        org_keywords: 125000,
        org_keywords_1_3: 8500,
        org_traffic: 2400000,
        org_cost: 3500000,
        paid_keywords: 250,
        paid_traffic: 12000,
        paid_cost: 45000,
      };

      nock(BASE_URL)
        .get('/v3/site-explorer/metrics')
        .query({
          target: 'ahrefs.com',
          mode: 'subdomains',
          protocol: 'both',
          country: 'us',
        })
        .reply(200, mockResponse);

      const result = await client.getOverview({ target: 'ahrefs.com' });
      expect(result.org_keywords).toBe(125000);
      expect(result.org_traffic).toBe(2400000);
    });
  });

  describe('getBacklinksStats', () => {
    it('fetches backlinks stats', async () => {
      const mockResponse = {
        live: 45000,
        all_time: 120000,
        live_refdomains: 8500,
        all_time_refdomains: 15000,
      };

      nock(BASE_URL)
        .get('/v3/site-explorer/backlinks-stats')
        .query({
          target: 'ahrefs.com',
          mode: 'subdomains',
          protocol: 'both',
        })
        .reply(200, mockResponse);

      const result = await client.getBacklinksStats({ target: 'ahrefs.com' });
      expect(result.live).toBe(45000);
      expect(result.live_refdomains).toBe(8500);
    });
  });

  describe('error handling', () => {
    it('throws on 401 auth error', async () => {
      nock(BASE_URL)
        .get('/v3/site-explorer/domain-rating')
        .query(true)
        .reply(401, { error: 'Invalid API key' });

      await expect(
        client.getDomainRating({ target: 'example.com' }),
      ).rejects.toThrow('Authentication failed');
    });

    it('throws on 429 rate limit', async () => {
      // Rate limit is retryable, so nock needs enough replies for all retries
      // The client uses withRetry with default 3 retries, 1s initial delay
      // We mock 4 responses (1 initial + 3 retries)
      nock(BASE_URL)
        .get('/v3/site-explorer/domain-rating')
        .query(true)
        .times(4)
        .reply(429, { error: 'Rate limit exceeded' }, { 'Retry-After': '30' });

      await expect(
        client.getDomainRating({ target: 'example.com' }),
      ).rejects.toThrow('Rate limit exceeded');
    }, 30_000);

    it('throws on 404 error without retrying', async () => {
      nock(BASE_URL)
        .get('/v3/site-explorer/domain-rating')
        .query(true)
        .reply(404, { error: { message: 'Not found' } });

      await expect(
        client.getDomainRating({ target: 'nonexistent.invalid' }),
      ).rejects.toThrow('Not found');
    });
  });
});
