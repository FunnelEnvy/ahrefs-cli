import { Command } from 'commander';
import { registerAuthCommands } from './commands/auth.js';
import { registerBacklinksCommands } from './commands/backlinks.js';
import { registerKeywordsCommands } from './commands/keywords.js';
import { registerDomainsCommands } from './commands/domains.js';
import { registerSiteExplorerCommands } from './commands/site-explorer.js';
import { registerDomainRatingCommands } from './commands/domain-rating.js';

const program = new Command();

program
  .name('ahrefs')
  .description('Command-line interface for the Ahrefs SEO API')
  .version('0.1.0');

registerAuthCommands(program);
registerBacklinksCommands(program);
registerKeywordsCommands(program);
registerDomainsCommands(program);
registerSiteExplorerCommands(program);
registerDomainRatingCommands(program);

program.parse();
