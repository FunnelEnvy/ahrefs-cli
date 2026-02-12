import { request, withRetry } from './http.js';
import { getAuthHeaders } from '../auth.js';

const BASE_URL = 'https://api.ahrefs.com/v3';

export type TargetMode = 'exact' | 'domain' | 'subdomains' | 'prefix';
export type Protocol = 'http' | 'https' | 'both';

export interface BaseParams {
  target: string;
  mode?: TargetMode;
  protocol?: Protocol;
  date?: string;
}

export interface ListParams extends BaseParams {
  limit?: number;
  offset?: number;
  select?: string;
}

export interface BacklinksParams extends ListParams {
  order_by?: string;
}

export interface OrganicKeywordsParams extends ListParams {
  country?: string;
  order_by?: string;
}

export interface RefDomainsParams extends ListParams {
  order_by?: string;
}

export interface MetricsParams extends BaseParams {
  country?: string;
}

// Response types
export interface Backlink {
  url_from: string;
  url_to: string;
  ahrefs_rank: number;
  domain_rating: number;
  anchor: string;
  encoding: string;
  first_seen: string;
  last_seen: string;
  is_dofollow: boolean;
  is_content: boolean;
  page_title: string;
  language: string;
  traffic: number;
  linked_domains: number;
}

export interface OrganicKeyword {
  keyword: string;
  volume: number;
  position: number;
  url: string;
  traffic: number;
  cpc: number;
  difficulty: number;
  serp_features: string[];
  last_updated: string;
  country: string;
}

export interface RefDomain {
  domain: string;
  domain_rating: number;
  backlinks: number;
  first_seen: string;
  last_seen: string;
  is_dofollow: boolean;
  traffic: number;
  linked_domains: number;
}

export interface DomainRating {
  domain_rating: number;
  ahrefs_rank: number;
}

export interface SiteOverview {
  org_keywords: number;
  org_keywords_1_3: number;
  org_traffic: number;
  org_cost: number;
  paid_keywords: number;
  paid_traffic: number;
  paid_cost: number;
}

export interface BacklinksStatsResponse {
  live: number;
  all_time: number;
  live_refdomains: number;
  all_time_refdomains: number;
}

export interface BacklinksListResponse {
  backlinks: Backlink[];
}

export interface OrganicKeywordsResponse {
  keywords: OrganicKeyword[];
}

export interface RefDomainsResponse {
  refdomains: RefDomain[];
}

function buildUrl(path: string, params: Record<string, unknown>): string {
  const url = new URL(`${BASE_URL}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

export class AhrefsClient {
  private apiKey: string;
  private verbose: boolean;

  constructor(apiKey: string, verbose = false) {
    this.apiKey = apiKey;
    this.verbose = verbose;
  }

  private async get<T>(path: string, params: Record<string, unknown>): Promise<T> {
    const url = buildUrl(path, params);
    if (this.verbose) {
      console.error(`[DEBUG] GET ${url}`);
    }
    return withRetry(() =>
      request<T>(url, {
        headers: getAuthHeaders(this.apiKey),
      }),
    );
  }

  async getBacklinks(params: BacklinksParams): Promise<BacklinksListResponse> {
    return this.get<BacklinksListResponse>('site-explorer/all-backlinks', {
      target: params.target,
      mode: params.mode ?? 'subdomains',
      protocol: params.protocol ?? 'both',
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
      select: params.select,
      order_by: params.order_by,
      date: params.date,
    });
  }

  async getOrganicKeywords(params: OrganicKeywordsParams): Promise<OrganicKeywordsResponse> {
    return this.get<OrganicKeywordsResponse>('site-explorer/organic-keywords', {
      target: params.target,
      mode: params.mode ?? 'subdomains',
      protocol: params.protocol ?? 'both',
      country: params.country ?? 'us',
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
      select: params.select,
      order_by: params.order_by,
      date: params.date,
    });
  }

  async getRefDomains(params: RefDomainsParams): Promise<RefDomainsResponse> {
    return this.get<RefDomainsResponse>('site-explorer/refdomains', {
      target: params.target,
      mode: params.mode ?? 'subdomains',
      protocol: params.protocol ?? 'both',
      limit: params.limit ?? 50,
      offset: params.offset ?? 0,
      select: params.select,
      order_by: params.order_by,
      date: params.date,
    });
  }

  async getDomainRating(params: BaseParams): Promise<DomainRating> {
    return this.get<DomainRating>('site-explorer/domain-rating', {
      target: params.target,
      mode: params.mode ?? 'subdomains',
      protocol: params.protocol ?? 'both',
      date: params.date,
    });
  }

  async getOverview(params: MetricsParams): Promise<SiteOverview> {
    return this.get<SiteOverview>('site-explorer/metrics', {
      target: params.target,
      mode: params.mode ?? 'subdomains',
      protocol: params.protocol ?? 'both',
      country: params.country ?? 'us',
      date: params.date,
    });
  }

  async getBacklinksStats(params: BaseParams): Promise<BacklinksStatsResponse> {
    return this.get<BacklinksStatsResponse>('site-explorer/backlinks-stats', {
      target: params.target,
      mode: params.mode ?? 'subdomains',
      protocol: params.protocol ?? 'both',
      date: params.date,
    });
  }
}
