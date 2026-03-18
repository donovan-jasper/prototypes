export function calculateConnectionScore(lastContactDate: string | null): number {
  if (!lastContactDate) {
    return 0;
  }

  const now = new Date();
  const lastContact = new Date(lastContactDate);
  const daysSince = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince <= 7) return 100;
  if (daysSince <= 14) return 80;
  if (daysSince <= 30) return 60;
  if (daysSince <= 60) return 40;
  if (daysSince <= 90) return 20;
  return 0;
}

export function getConnectionStatus(score: number): 'thriving' | 'maintaining' | 'neglecting' {
  if (score >= 70) return 'thriving';
  if (score >= 40) return 'maintaining';
  return 'neglecting';
}

export function getConnectionColor(score: number): string {
  if (score >= 70) return '#4CAF50';
  if (score >= 40) return '#FFC107';
  return '#F44336';
}

export function getDaysSinceLastContact(lastContactDate: string | null): number {
  if (!lastContactDate) return 999;
  
  const now = new Date();
  const lastContact = new Date(lastContactDate);
  return Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24));
}
