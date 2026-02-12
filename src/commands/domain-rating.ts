import { Command } from 'commander';
import { requireApiKey } from '../auth.js';
import { AhrefsClient, type TargetMode, type Protocol } from '../lib/api-client.js';
import { printOutput, printError, type OutputFormat } from '../lib/output.js';
import { HttpError } from '../lib/http.js';

export function registerDomainRatingCommands(program: Command): void {
  const domainRating = program
    .command('domain-rating')
    .description('Get domain rating metrics');

  domainRating
    .command('get')
    .description('Get domain rating and Ahrefs rank for a target')
    .requiredOption('--target <target>', 'Target domain (e.g., example.com)')
    .option('--api-key <key>', 'Ahrefs API key')
    .option('-o, --output <format>', 'Output format (json, table, csv)', 'json')
    .option('-q, --quiet', 'Suppress non-essential output')
    .option('-v, --verbose', 'Enable verbose/debug output')
    .option('--mode <mode>', 'Target mode (exact, domain, subdomains, prefix)', 'subdomains')
    .option('--protocol <protocol>', 'Protocol filter (http, https, both)', 'both')
    .option('--date <date>', 'Date for historical data (YYYY-MM-DD)')
    .action(async (opts) => {
      const format = opts.output as OutputFormat;
      try {
        const apiKey = requireApiKey(opts.apiKey);
        const client = new AhrefsClient(apiKey, opts.verbose);

        if (!opts.quiet) {
          console.error(`Fetching domain rating for ${opts.target}...`);
        }

        const result = await client.getDomainRating({
          target: opts.target,
          mode: opts.mode as TargetMode,
          protocol: opts.protocol as Protocol,
          date: opts.date,
        });

        printOutput(
          {
            target: opts.target,
            domain_rating: result.domain_rating,
            ahrefs_rank: result.ahrefs_rank,
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
