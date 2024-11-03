import type { NplScriptKey } from './NplScriptKey.js';

export type LocalConfig = {
  scripts: {
    [key in NplScriptKey]?: string;
  };
  links: Record<string, string>;
};
