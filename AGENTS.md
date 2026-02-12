# Ahrefs CLI — Agent Reference

## Command Inventory

### Authentication

| Command | Required Args | Optional Flags | Description |
|---------|--------------|----------------|-------------|
| `ahrefs auth login [api-key]` | — | — | Save API key (interactive if no arg) |
| `ahrefs auth status` | — | — | Show current auth status |
| `ahrefs auth logout` | — | — | Remove saved API key |

### Backlinks

| Command | Required Args | Optional Flags | Description |
|---------|--------------|----------------|-------------|
| `ahrefs backlinks list` | `--target` | `--limit`, `--offset`, `--mode`, `--protocol`, `--date`, `-o`, `-q`, `-v`, `--api-key` | List backlinks for a target |

### Keywords

| Command | Required Args | Optional Flags | Description |
|---------|--------------|----------------|-------------|
| `ahrefs keywords organic` | `--target` | `--country`, `--limit`, `--offset`, `--mode`, `--protocol`, `--date`, `-o`, `-q`, `-v`, `--api-key` | List organic keywords |

### Referring Domains

| Command | Required Args | Optional Flags | Description |
|---------|--------------|----------------|-------------|
| `ahrefs domains referring` | `--target` | `--limit`, `--offset`, `--mode`, `--protocol`, `--date`, `-o`, `-q`, `-v`, `--api-key` | List referring domains |

### Domain Rating

| Command | Required Args | Optional Flags | Description |
|---------|--------------|----------------|-------------|
| `ahrefs domain-rating get` | `--target` | `--mode`, `--protocol`, `--date`, `-o`, `-q`, `-v`, `--api-key` | Get domain rating |

### Site Explorer

| Command | Required Args | Optional Flags | Description |
|---------|--------------|----------------|-------------|
| `ahrefs site-explorer overview` | `--target` | `--country`, `--mode`, `--protocol`, `--date`, `-o`, `-q`, `-v`, `--api-key` | Get site overview metrics |

## Auth Setup Sequence

1. Obtain an Ahrefs API key from the Ahrefs dashboard (Enterprise plan required)
2. Run `ahrefs auth login YOUR_API_KEY` or set `AHREFS_API_KEY` env var
3. Verify with `ahrefs auth status`

Auth priority: `--api-key` flag > `AHREFS_API_KEY` env var > config file

## Common Workflows

### Check a competitor's backlink profile

```bash
ahrefs domain-rating get --target competitor.com -o json
ahrefs backlinks list --target competitor.com --limit 100 -o csv > backlinks.csv
ahrefs domains referring --target competitor.com --limit 50 -o table
```

### Keyword research for a domain

```bash
ahrefs keywords organic --target example.com --country us --limit 100 -o json
ahrefs keywords organic --target example.com --country gb --limit 50 -o csv
```

### Full site audit overview

```bash
ahrefs site-explorer overview --target example.com -o json
ahrefs domain-rating get --target example.com -o json
ahrefs backlinks list --target example.com --limit 50 -o json
ahrefs domains referring --target example.com --limit 50 -o json
```

## Output Format Notes

### JSON output (default)

- Arrays for list commands: `[{ field1: value1, ... }, ...]`
- Objects for single-value commands: `{ field1: value1, ... }`
- Errors: `{ "error": { "code": "ERROR_CODE", "message": "..." } }`

### Table output (`-o table`)

- Human-readable aligned columns with headers
- Suitable for terminal display

### CSV output (`-o csv`)

- Comma-separated with headers
- Suitable for piping to files or spreadsheet tools

## Error Codes

| Code | Meaning | Suggested Action |
|------|---------|------------------|
| `AUTH_MISSING` | No API key configured | Run `ahrefs auth login` |
| `AUTH_FAILED` | API key is invalid or expired | Check key and run `ahrefs auth login` |
| `RATE_LIMITED` | Too many requests | Wait for `retry_after` seconds |
| `API_ERROR` | Generic API error | Check the error message for details |
| `UNKNOWN` | Unexpected error | Check verbose output with `-v` |

## Rate Limits

- Ahrefs API uses a unit-based rate limiting system
- Minimum cost per request: 50 units
- Cost scales with number of rows and fields requested
- CLI auto-retries on 429 with exponential backoff (up to 3 retries)
- Use `--limit` to reduce response size and unit consumption

## Parameter Reference

### Target Modes (`--mode`)

| Mode | Description |
|------|-------------|
| `exact` | Exact URL match |
| `domain` | Root domain only |
| `subdomains` | Domain and all subdomains (default) |
| `prefix` | URL prefix match |

### Protocol (`--protocol`)

| Value | Description |
|-------|-------------|
| `http` | HTTP only |
| `https` | HTTPS only |
| `both` | Both protocols (default) |
