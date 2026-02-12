import { Command } from 'commander';
import { createInterface } from 'node:readline/promises';
import { ConfigManager } from '../lib/config.js';
import { resolveApiKey } from '../auth.js';

const config = new ConfigManager('ahrefs');

export function registerAuthCommands(program: Command): void {
  const auth = program.command('auth').description('Manage Ahrefs API authentication');

  auth
    .command('login')
    .description('Save your Ahrefs API key to local config')
    .argument('[api-key]', 'API key (omit to enter interactively)')
    .action(async (apiKeyArg?: string) => {
      let apiKey = apiKeyArg;

      if (!apiKey) {
        const rl = createInterface({ input: process.stdin, output: process.stdout });
        try {
          apiKey = await rl.question('Enter your Ahrefs API key: ');
        } finally {
          rl.close();
        }
      }

      if (!apiKey || apiKey.trim().length === 0) {
        console.error('Error: API key cannot be empty.');
        process.exit(1);
      }

      config.set('auth', { api_key: apiKey.trim() });
      console.log(`API key saved to ${config.getConfigPath()}`);
    });

  auth
    .command('status')
    .description('Show current authentication status')
    .action(() => {
      const key = resolveApiKey();
      if (key) {
        const masked = key.slice(0, 8) + '...' + key.slice(-4);
        console.log(`Authenticated: ${masked}`);
        console.log(`Config file: ${config.getConfigPath()}`);
      } else {
        console.log('Not authenticated.');
        console.log('Run: ahrefs auth login');
      }
    });

  auth
    .command('logout')
    .description('Remove saved API key')
    .action(() => {
      config.set('auth', {});
      console.log('API key removed.');
    });
}
