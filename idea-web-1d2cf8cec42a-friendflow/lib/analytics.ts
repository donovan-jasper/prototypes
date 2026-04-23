import { Contact, Interaction } from '../types';
import { differenceInDays, isWithinInterval, subDays, subMonths } from 'date-fns';

export const calculateRelationshipScore = (contact: Contact, interactions: Interaction[], currentDate: Date): number => {
  // 1. Adherence to check-in frequency (80% weight)
  const daysSinceLastContact = differenceInDays(currentDate, contact.lastContact);
  const adherenceScore = Math.max(0, 100 - (daysSinceLastContact / contact.frequency) * 100) * 0.8;

  // 2. Consistency of interactions (20% weight)
  if (interactions.length < 2) {
    return Math.min(100, adherenceScore + 20); // Give some bonus for having interactions
  }

  const intervals = interactions.slice(1).map((interaction, i) =>
    differenceInDays(interaction.date, interactions[i].date)
  );

  const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  const consistencyScore = Math.max(0, 100 - Math.abs(avgInterval - contact.frequency) / contact.frequency * 100) * 0.2;

  // 3. Recent activity bonus (up to 10 points)
  const recentInteractions = interactions.filter(interaction =>
    isWithinInterval(interaction.date, {
      start: subDays(currentDate, 7),
      end: currentDate
    })
  );

  const recentBonus = Math.min(10, recentInteractions.length * 2);

  return Math.min(100, adherenceScore + consistencyScore + recentBonus);
};

export const getTopContactsByScore = (contacts: Contact[], interactionsMap: Record<string, Interaction[]>, currentDate: Date): Contact[] => {
  return contacts
    .map(contact => ({
      ...contact,
      score: calculateRelationshipScore(contact, interactionsMap[contact.id] || [], currentDate)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
};

export const getMonthlyCheckIns = (interactions: Interaction[], currentDate: Date): Record<string, number> => {
  const result: Record<string, number> = {};
  const months = 6; // Show last 6 months

  for (let i = 0; i < months; i++) {
    const monthStart = subMonths(currentDate, i);
    const monthKey = `${monthStart.getFullYear()}-${monthStart.getMonth() + 1}`;

    const monthInteractions = interactions.filter(interaction =>
      isWithinInterval(interaction.date, {
        start: new Date(monthStart.getFullYear(), monthStart.getMonth(), 1),
        end: new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
      })
    );

    result[monthKey] = monthInteractions.length;
  }

  return result;
};

export const getImprovementScore = (interactions: Interaction[], currentDate: Date): number => {
  const last30Days = interactions.filter(interaction =>
    isWithinInterval(interaction.date, {
      start: subDays(currentDate, 30),
      end: currentDate
    })
  );

  const previous30Days = interactions.filter(interaction =>
    isWithinInterval(interaction.date, {
      start: subDays(currentDate, 60),
      end: subDays(currentDate, 30)
    })
  );

  if (previous30Days.length === 0) return 100; // No data to compare, assume 100%

  const improvement = (last30Days.length - previous30Days.length) / previous30Days.length * 100;
  return Math.max(0, Math.min(100, 50 + improvement)); // Base 50% + improvement percentage
};
