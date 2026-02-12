# Ahrefs API v3 — Inventory

## Base URL

`https://api.ahrefs.com/v3`

## Authentication

Bearer token in Authorization header:
```
Authorization: Bearer {api_key}
```

API key is obtained from the Ahrefs dashboard. Enterprise plan required for API access.

## Rate Limits

- Unit-based system: each request consumes API units
- Minimum cost per request: 50 units
- Cost depends on number of rows returned and fields requested
- HTTP 429 response when rate limited, with Retry-After header

## Endpoints Implemented

### GET /site-explorer/all-backlinks

List all backlinks for a target.

**Parameters:**
- `target` (required) — domain or URL
- `mode` — exact, domain, subdomains, prefix (default: subdomains)
- `protocol` — http, https, both (default: both)
- `limit` — max results (default: 50)
- `offset` — pagination offset (default: 0)
- `select` — comma-separated fields
- `order_by` — sort field
- `date` — historical date (YYYY-MM-DD)

**Response:** `{ backlinks: [{ url_from, url_to, ahrefs_rank, domain_rating, anchor, first_seen, last_seen, is_dofollow, is_content, page_title, language, traffic, linked_domains }] }`

### GET /site-explorer/organic-keywords

List organic keywords a target ranks for.

**Parameters:**
- `target` (required) — domain or URL
- `mode`, `protocol`, `limit`, `offset`, `select`, `order_by`, `date` (as above)
- `country` — two-letter country code (default: us)

**Response:** `{ keywords: [{ keyword, volume, position, url, traffic, cpc, difficulty, serp_features, last_updated, country }] }`

### GET /site-explorer/refdomains

List referring domains linking to a target.

**Parameters:** Same as all-backlinks.

**Response:** `{ refdomains: [{ domain, domain_rating, backlinks, first_seen, last_seen, is_dofollow, traffic, linked_domains }] }`

### GET /site-explorer/domain-rating

Get domain rating for a target.

**Parameters:**
- `target` (required) — domain
- `mode`, `protocol`, `date`

**Response:** `{ domain_rating: number, ahrefs_rank: number }`

### GET /site-explorer/metrics

Get site overview metrics.

**Parameters:**
- `target` (required) — domain
- `mode`, `protocol`, `date`
- `country` — two-letter country code

**Response:** `{ org_keywords, org_keywords_1_3, org_traffic, org_cost, paid_keywords, paid_traffic, paid_cost }`

### GET /site-explorer/backlinks-stats

Get backlinks summary statistics.

**Parameters:**
- `target` (required) — domain
- `mode`, `protocol`, `date`

**Response:** `{ live, all_time, live_refdomains, all_time_refdomains }`
