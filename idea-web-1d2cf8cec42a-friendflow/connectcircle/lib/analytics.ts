import { Contact, Interaction } from '../types';
import { getInteractionsByContact } from './database';

export const calculateRelationshipScore = (contact: Contact, currentDate: Date): number => {
  const daysSinceLastContact = Math.floor(
    (currentDate.getTime() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Base score: 100% if on schedule, decreases as days pass
  let score = Math.max(0, 100 - (daysSinceLastContact / contact.frequency) * 100);

  // Bonus for frequent interactions
  const interactions = getInteractionsByContact(contact.id);
  const recentInteractions = interactions.filter(
    interaction => (currentDate.getTime() - interaction.date.getTime()) / (1000 * 60 * 60 * 24) <= 30
  );
  score += Math.min(20, recentInteractions.length * 2);

  return Math.round(score);
};

export const getOverdueContacts = (contacts: Contact[], currentDate: Date): Contact[] => {
  return contacts.filter(contact => {
    const daysSinceLastContact = Math.floor(
      (currentDate.getTime() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastContact > contact.frequency;
  });
};

export const getStreakDays = (contactId: string): number => {
  const interactions = getInteractionsByContact(contactId);
  if (interactions.length === 0) return 0;

  let streak = 1;
  let previousDate = interactions[0].date;

  for (let i = 1; i < interactions.length; i++) {
    const currentDate = interactions[i].date;
    const daysDiff = Math.floor(
      (previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      streak++;
      previousDate = currentDate;
    } else {
      break;
    }
  }

  return streak;
};

export const getMonthlyStats = (contacts: Contact[], interactions: Interaction[]): any => {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  const monthlyInteractions = interactions.filter(
    interaction => interaction.date >= firstDayOfMonth
  );

  const totalCheckIns = monthlyInteractions.length;
  const longestStreak = Math.max(...contacts.map(contact => getStreakDays(contact.id)));

  const contactsWithScore = contacts.map(contact => ({
    ...contact,
    score: calculateRelationshipScore(contact, currentDate),
  }));

  const averageScore = contactsWithScore.reduce((sum, contact) => sum + contact.score, 0) / contacts.length;

  return {
    totalCheckIns,
    longestStreak,
    averageScore: Math.round(averageScore),
    contactsWithScore,
  };
};
