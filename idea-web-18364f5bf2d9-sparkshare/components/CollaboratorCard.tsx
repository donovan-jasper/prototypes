import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, Chip, Button } from 'react-native-paper';
import { UserProfile } from '../lib/types';
import { useRouter } from 'expo-router';

interface CollaboratorCardProps {
  profile: UserProfile;
  onMessage?: () => void;
}

const CollaboratorCard = ({ profile, onMessage }: CollaboratorCardProps) => {
  const router = useRouter();

  const handleViewProfile = () => {
    router.push(`/profile/${profile.user.id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={40} label={profile.user.username.substring(0, 2).toUpperCase()} />
        <View style={styles.userInfo}>
          <Text variant="titleMedium">{profile.user.username}</Text>
          <Text variant="bodySmall">Spark Score: {profile.sparkScore}</Text>
          {profile.matchScore !== undefined && (
            <Text variant="bodySmall">Match Score: {profile.matchScore}</Text>
          )}
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {profile.skills.slice(0, 3).map(skill => (
          <Chip key={skill.id} style={styles.skillChip}>
            {skill.skill_name}
          </Chip>
        ))}
        {profile.skills.length > 3 && (
          <Text variant="bodySmall" style={styles.moreSkills}>
            +{profile.skills.length - 3} more
          </Text>
        )}
      </View>

      <View style={styles.actionsContainer}>
        <Button mode="outlined" onPress={handleViewProfile} style={styles.actionButton}>
          View Profile
        </Button>
        {onMessage && (
          <Button mode="contained" onPress={onMessage} style={styles.actionButton}>
            Message
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillChip: {
    marginBottom: 4,
  },
  moreSkills: {
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});

export default CollaboratorCard;
