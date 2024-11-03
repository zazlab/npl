import * as nodeEmoji from 'node-emoji';

export const emoji = {
  CONSTRUCTION: nodeEmoji.get('construction'),
  ERROR: `${nodeEmoji.get('exclamation')}`,
  FATAL: nodeEmoji.get('skull'),
  GHOST: nodeEmoji.get('ghost'),
  HEART: nodeEmoji.get('heart'),
  INFO: nodeEmoji.get('information_source'),
  SUCCESS: `${nodeEmoji.get('white_check_mark')}\u0020`,
  WARNING: nodeEmoji.get('warning'),
} as const;
