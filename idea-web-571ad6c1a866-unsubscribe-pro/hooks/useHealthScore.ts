import { useEmailStore } from '../store/email-store';

export const useHealthScore = () => {
  const { emails } = useEmailStore();

  const calculateScore = (): number => {
    if (emails.length === 0) return 100;

    // Calculate the percentage of non-promotional emails
    const nonPromotionalCount = emails.filter(email =>
      email.classification === 'important' ||
      email.classification === 'subscription'
    ).length;

    const score = Math.round((nonPromotionalCount / emails.length) * 100);

    // Ensure score is between 0 and 100
    return Math.min(100, Math.max(0, score));
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return "Excellent! Your inbox is clean and organized.";
    if (score >= 70) return "Good job! Keep up the good work.";
    if (score >= 50) return "You're making progress. Keep unsubscribing!";
    if (score >= 30) return "Your inbox could use some cleanup.";
    return "Your inbox is cluttered. Let's get started!";
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#4CAF50'; // Green
    if (score >= 70) return '#8BC34A'; // Light green
    if (score >= 50) return '#FFC107'; // Amber
    if (score >= 30) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getTimeSaved = (): string => {
    // Calculate time saved based on number of emails processed
    const hoursSaved = Math.round(emails.length * 0.05); // 30 seconds per email
    if (hoursSaved >= 24) {
      const days = Math.floor(hoursSaved / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    }
    return `${hoursSaved} hour${hoursSaved !== 1 ? 's' : ''}`;
  };

  return {
    calculateScore,
    getScoreMessage,
    getScoreColor,
    getTimeSaved,
  };
};
