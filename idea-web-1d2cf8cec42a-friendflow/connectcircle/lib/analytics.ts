import { Contact, Interaction } from '../types';
import { getInteractionsByContact } from './database';

export const calculateRelationshipScore = async (contact: Contact, currentDate: Date): Promise<number> => {
  const daysSinceLastContact = Math.floor(
    (currentDate.getTime() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Base score: 100% if on schedule, decreases as days pass
  let score = Math.max(0, 100 - (daysSinceLastContact / contact.frequency) * 100);

  // Bonus for frequent interactions
  const interactions = await getInteractionsByContact(contact.id);
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

export const calculateStreakDays = async (contactId: string): Promise<number> => {
  const interactions = await getInteractionsByContact(contactId);
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

export const getStreakDays = async (contactId: string): Promise<number> => {
  return calculateStreakDays(contactId);
};

export const getMonthlyStats = async (contacts: Contact[], interactions: Interaction[]): Promise<any> => {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  const monthlyInteractions = interactions.filter(
    interaction => interaction.date >= firstDayOfMonth
  );

  const totalCheckIns = monthlyInteractions.length;
  
  const streakPromises = contacts.map(contact => getStreakDays(contact.id));
  const streaks = await Promise.all(streakPromises);
  const longestStreak = Math.max(...streaks, 0);

  const scorePromises = contacts.map(contact => calculateRelationshipScore(contact, currentDate));
  const scores = await Promise.all(scorePromises);
  
  const contactsWithScore = contacts.map((contact, index) => ({
    ...contact,
    score: scores[index],
  }));

  const averageScore = contacts.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / contacts.length 
    : 0;

  return {
    totalCheckIns,
    longestStreak,
    averageScore: Math.round(averageScore),
    contactsWithScore,
  };
};
