import { describe, it, expect } from 'vitest';
import nock from 'nock';
import { request, HttpError, withRetry } from '../lib/http.js';

describe('http', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('request', () => {
    it('makes GET request and returns JSON', async () => {
      nock('https://api.example.com')
        .get('/test')
        .reply(200, { data: 'hello' });

      const result = await request<{ data: string }>('https://api.example.com/test');
      expect(result.data).toBe('hello');
    });

    it('sends custom headers', async () => {
      nock('https://api.example.com')
        .get('/test')
        .matchHeader('Authorization', 'Bearer my-key')
        .reply(200, { ok: true });

      const result = await request<{ ok: boolean }>('https://api.example.com/test', {
        headers: { Authorization: 'Bearer my-key' },
      });
      expect(result.ok).toBe(true);
    });

    it('throws HttpError on 401', async () => {
      nock('https://api.example.com')
        .get('/test')
        .reply(401, { error: 'Unauthorized' });

      await expect(request('https://api.example.com/test')).rejects.toThrow(HttpError);

      try {
        await request('https://api.example.com/test');
      } catch {
        // nock already consumed
      }
    });

    it('throws HttpError on 429 with retry-after', async () => {
      nock('https://api.example.com')
        .get('/test')
        .reply(429, { error: 'Rate limited' }, { 'Retry-After': '60' });

      try {
        await request('https://api.example.com/test');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpError);
        expect((err as HttpError).code).toBe('RATE_LIMITED');
        expect((err as HttpError).retryAfter).toBe(60);
      }
    });

    it('throws HttpError on 500', async () => {
      nock('https://api.example.com')
        .get('/test')
        .reply(500, 'Internal Server Error');

      try {
        await request('https://api.example.com/test');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(HttpError);
        expect((err as HttpError).status).toBe(500);
      }
    });
  });

  describe('withRetry', () => {
    it('returns result on first success', async () => {
      const result = await withRetry(() => Promise.resolve('ok'));
      expect(result).toBe('ok');
    });

    it('retries on retryable error and eventually succeeds', async () => {
      let attempts = 0;
      const result = await withRetry(
        () => {
          attempts++;
          if (attempts < 3) throw new HttpError('Server error', 'API_ERROR', 500);
          return Promise.resolve('success');
        },
        3,
        10,
      );
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('throws immediately for non-retryable errors', async () => {
      let attempts = 0;
      await expect(
        withRetry(
          () => {
            attempts++;
            throw new Error('non-retryable');
          },
          2,
          10,
        ),
      ).rejects.toThrow('non-retryable');
      expect(attempts).toBe(1);
    });

    it('throws after max retries for retryable errors', async () => {
      await expect(
        withRetry(
          () => {
            throw new HttpError('Server error', 'API_ERROR', 502);
          },
          2,
          10,
        ),
      ).rejects.toThrow('Server error');
    });

    it('does not retry auth errors', async () => {
      let attempts = 0;
      try {
        await withRetry(
          () => {
            attempts++;
            throw new HttpError('Auth failed', 'AUTH_FAILED', 401);
          },
          3,
          10,
        );
      } catch {
        // expected
      }
      expect(attempts).toBe(1);
    });

    it('does not retry 404 errors', async () => {
      let attempts = 0;
      try {
        await withRetry(
          () => {
            attempts++;
            throw new HttpError('Not found', 'API_ERROR', 404);
          },
          3,
          10,
        );
      } catch {
        // expected
      }
      expect(attempts).toBe(1);
    });

    it('retries 429 errors', async () => {
      let attempts = 0;
      try {
        await withRetry(
          () => {
            attempts++;
            throw new HttpError('Rate limited', 'RATE_LIMITED', 429);
          },
          2,
          10,
        );
      } catch {
        // expected
      }
      expect(attempts).toBe(3); // 1 initial + 2 retries
    });

    it('retries 500 errors', async () => {
      let attempts = 0;
      try {
        await withRetry(
          () => {
            attempts++;
            throw new HttpError('Server error', 'API_ERROR', 500);
          },
          1,
          10,
        );
      } catch {
        // expected
      }
      expect(attempts).toBe(2); // 1 initial + 1 retry
    });
  });
});
