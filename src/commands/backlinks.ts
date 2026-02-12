import { Command } from 'commander';
import { requireApiKey } from '../auth.js';
import { AhrefsClient, type TargetMode, type Protocol } from '../lib/api-client.js';
import { printOutput, printError, type OutputFormat } from '../lib/output.js';
import { HttpError } from '../lib/http.js';

export function registerBacklinksCommands(program: Command): void {
  const backlinks = program.command('backlinks').description('Analyze backlinks for a target');

  backlinks
    .command('list')
    .description('List all backlinks for a target domain or URL')
    .requiredOption('--target <target>', 'Target domain or URL (e.g., example.com)')
    .option('--api-key <key>', 'Ahrefs API key')
    .option('-o, --output <format>', 'Output format (json, table, csv)', 'json')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('-v, --verbose', 'Enable verbose/debug output')
    .option('--limit <n>', 'Number of results to return', '50')
    .option('--offset <n>', 'Pagination offset', '0')
    .option('--mode <mode>', 'Target mode (exact, domain, subdomains, prefix)', 'subdomains')
    .option('--protocol <protocol>', 'Protocol filter (http, https, both)', 'both')
    .option('--date <date>', 'Date for historical data (YYYY-MM-DD)')
    .action(async (opts) => {
      const format = opts.output as OutputFormat;
      try {
        const apiKey = requireApiKey(opts.apiKey);
        const client = new AhrefsClient(apiKey, opts.verbose);

        if (!opts.quiet) {
          console.error(`Fetching backlinks for ${opts.target}...`);
        }

        const result = await client.getBacklinks({
          target: opts.target,
          limit: parseInt(opts.limit),
          offset: parseInt(opts.offset),
          mode: opts.mode as TargetMode,
          protocol: opts.protocol as Protocol,
          date: opts.date,
        });

        printOutput(result.backlinks, format);
      } catch (error) {
        if (error instanceof HttpError) {
          printError({ code: error.code, message: error.message, retry_after: error.retryAfter }, format);
        } else {
          printError({ code: 'UNKNOWN', message: String(error) }, format);
        }
        process.exit(1);
      }
    });
}
