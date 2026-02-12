# ahrefs-cli

[![npm version](https://img.shields.io/npm/v/@marketing-clis/ahrefs-cli.svg)](https://www.npmjs.com/package/@marketing-clis/ahrefs-cli)
[![CI](https://github.com/marketing-clis/ahrefs-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/marketing-clis/ahrefs-cli/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Command-line interface for the Ahrefs SEO API — query backlinks, organic keywords, referring domains, domain ratings, and site metrics from your terminal.

## Install

```bash
npm install -g @marketing-clis/ahrefs-cli
```

## Quick Start

```bash
# Save your API key
ahrefs auth login

# Get domain rating for a site
ahrefs domain-rating get --target example.com -o table

# List backlinks
ahrefs backlinks list --target example.com --limit 20 -o table

# Find organic keywords
ahrefs keywords organic --target example.com --country us -o csv

# Get referring domains
ahrefs domains referring --target example.com --limit 10

# Full site overview
ahrefs site-explorer overview --target example.com -o table
```

## Authentication

Ahrefs CLI supports three authentication methods (in priority order):

### 1. Command-line flag

```bash
ahrefs domain-rating get --target example.com --api-key YOUR_KEY
```

### 2. Environment variable

```bash
export AHREFS_API_KEY=your_api_key_here
ahrefs domain-rating get --target example.com
```

### 3. Config file (recommended)

```bash
ahrefs auth login
# Enter your API key when prompted, saved to ~/.config/ahrefs-cli/config.json
```

Check auth status:

```bash
ahrefs auth status
```

## Command Reference

### `auth` — Manage authentication

```bash
ahrefs auth login [api-key]     # Save API key (interactive or inline)
ahrefs auth status              # Show current auth status
ahrefs auth logout              # Remove saved API key
```

### `backlinks` — Analyze backlinks

```bash
ahrefs backlinks list --target <domain> [options]

Options:
  --target <target>       Target domain or URL (required)
  --limit <n>             Number of results (default: 50)
  --offset <n>            Pagination offset (default: 0)
  --mode <mode>           exact, domain, subdomains, prefix (default: subdomains)
  --protocol <protocol>   http, https, both (default: both)
  --date <date>           Historical date (YYYY-MM-DD)
  -o, --output <format>   json, table, csv (default: json)
  -q, --quiet             Suppress status messages
  -v, --verbose           Debug logging
```

### `keywords` — Organic keyword analysis

```bash
ahrefs keywords organic --target <domain> [options]

Options:
  --target <target>       Target domain or URL (required)
  --country <code>        Country code (default: us)
  --limit <n>             Number of results (default: 50)
  --offset <n>            Pagination offset (default: 0)
  --mode <mode>           exact, domain, subdomains, prefix (default: subdomains)
  -o, --output <format>   json, table, csv (default: json)
```

### `domains` — Referring domain analysis

```bash
ahrefs domains referring --target <domain> [options]

Options:
  --target <target>       Target domain or URL (required)
  --limit <n>             Number of results (default: 50)
  --offset <n>            Pagination offset (default: 0)
  --mode <mode>           exact, domain, subdomains, prefix (default: subdomains)
  -o, --output <format>   json, table, csv (default: json)
```

### `domain-rating` — Domain rating metrics

```bash
ahrefs domain-rating get --target <domain> [options]

Options:
  --target <target>       Target domain (required)
  --mode <mode>           exact, domain, subdomains, prefix (default: subdomains)
  --date <date>           Historical date (YYYY-MM-DD)
  -o, --output <format>   json, table, csv (default: json)
```

### `site-explorer` — Site overview

```bash
ahrefs site-explorer overview --target <domain> [options]

Options:
  --target <target>       Target domain or URL (required)
  --country <code>        Country code (default: us)
  --mode <mode>           exact, domain, subdomains, prefix (default: subdomains)
  --date <date>           Historical date (YYYY-MM-DD)
  -o, --output <format>   json, table, csv (default: json)
```

## Output Formats

All data commands support `--output json|table|csv`:

- **json** (default) — machine-readable, pipe-friendly
- **table** — human-readable aligned columns
- **csv** — for spreadsheets and data pipelines

## Configuration

Config file location: `~/.config/ahrefs-cli/config.json`

```json
{
  "auth": {
    "api_key": "your_api_key_here"
  },
  "defaults": {
    "output": "table"
  }
}
```

## Development

```bash
git clone https://github.com/marketing-clis/ahrefs-cli.git
cd ahrefs-cli
pnpm install
pnpm run build
pnpm run test
pnpm run typecheck
```

## Part of Marketing CLIs

This tool is part of [Marketing CLIs](https://github.com/marketing-clis/marketing-clis) — open source CLIs for marketing tools that have APIs but lack command-line interfaces.

## License

MIT
