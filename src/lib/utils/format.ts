/**
 * Utility functions for time/score formatting
 */

/**
 * Format time in milliseconds to readable format
 */
export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  
  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
  return `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;
}

/**
 * Format score with comma separators
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}
