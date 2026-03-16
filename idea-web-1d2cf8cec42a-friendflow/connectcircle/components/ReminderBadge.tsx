import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Contact } from '../types';

interface ReminderBadgeProps {
  contact: Contact;
}

export default function ReminderBadge({ contact }: ReminderBadgeProps) {
  const theme = useTheme();
  const daysSinceLastContact = Math.floor(
    (new Date().getTime() - contact.lastContact.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysUntilNextContact = contact.frequency - daysSinceLastContact;

  const getBadgeStyle = () => {
    if (daysUntilNextContact <= 0) {
      return {
        backgroundColor: theme.colors.error,
        color: theme.colors.onError,
      };
    } else if (daysUntilNextContact <= 3) {
      return {
        backgroundColor: theme.colors.warning,
        color: theme.colors.onWarning,
      };
    } else {
      return {
        backgroundColor: theme.colors.success,
        color: theme.colors.onSuccess,
      };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <View style={[styles.container, { backgroundColor: badgeStyle.backgroundColor }]}>
      <Text style={[styles.text, { color: badgeStyle.color }]}>
        {daysUntilNextContact <= 0
          ? `Overdue ${Math.abs(daysUntilNextContact)} days`
          : `Due in ${daysUntilNextContact} days`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
