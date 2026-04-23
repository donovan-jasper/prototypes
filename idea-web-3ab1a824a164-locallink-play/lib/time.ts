/**
 * Formats the time left until expiration
 * @param expiresAt ISO string of expiration time
 * @returns Formatted string like "1h 30m left" or "Expired"
 */
export function formatTimeLeft(expiresAt: string): string {
  const now = new Date();
  const expiration = new Date(expiresAt);

  if (expiration < now) {
    return 'Expired';
  }

  const diffMs = expiration.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours > 0) {
    const remainingMinutes = diffMinutes % 60;
    return `${diffHours}h ${remainingMinutes}m left`;
  } else {
    return `${diffMinutes}m left`;
  }
}
