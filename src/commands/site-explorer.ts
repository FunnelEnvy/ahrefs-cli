import { Command } from 'commander';
import { requireApiKey } from '../auth.js';
import { AhrefsClient, type TargetMode, type Protocol } from '../lib/api-client.js';
import { printOutput, printError, type OutputFormat } from '../lib/output.js';
import { HttpError } from '../lib/http.js';

export function registerSiteExplorerCommands(program: Command): void {
  const siteExplorer = program
    .command('site-explorer')
    .description('Get site overview metrics and stats');

  siteExplorer
    .command('overview')
    .description('Get site overview metrics (organic traffic, keywords, costs)')
    .requiredOption('--target <target>', 'Target domain or URL (e.g., example.com)')
    .option('--api-key <key>', 'Ahrefs API key')
    .option('-o, --output <format>', 'Output format (json, table, csv)', 'json')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('-v, --verbose', 'Enable verbose/debug output')
    .option('--mode <mode>', 'Target mode (exact, domain, subdomains, prefix)', 'subdomains')
    .option('--protocol <protocol>', 'Protocol filter (http, https, both)', 'both')
    .option('--country <country>', 'Country code for metrics (e.g., us, gb, de)', 'us')
    .option('--date <date>', 'Date for historical data (YYYY-MM-DD)')
    .action(async (opts) => {
      const format = opts.output as OutputFormat;
      try {
        const apiKey = requireApiKey(opts.apiKey);
        const client = new AhrefsClient(apiKey, opts.verbose);

        if (!opts.quiet) {
          console.error(`Fetching overview for ${opts.target}...`);
        }

        const [metrics, stats] = await Promise.all([
          client.getOverview({
            target: opts.target,
            mode: opts.mode as TargetMode,
            protocol: opts.protocol as Protocol,
            country: opts.country,
            date: opts.date,
          }),
          client.getBacklinksStats({
            target: opts.target,
            mode: opts.mode as TargetMode,
            protocol: opts.protocol as Protocol,
            date: opts.date,
          }),
        ]);

        printOutput(
          {
            target: opts.target,
            ...metrics,
            backlinks_live: stats.live,
            backlinks_all_time: stats.all_time,
            refdomains_live: stats.live_refdomains,
            refdomains_all_time: stats.all_time_refdomains,
          },
          format,
        );
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
