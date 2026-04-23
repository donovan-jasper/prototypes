import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Avatar, Button, Chip, ProgressBar } from 'react-native-paper';
import { UserProfile } from '../lib/types';

interface CollaboratorCardProps {
  profile: UserProfile;
  onPress?: () => void;
  onMessage?: () => void;
}

const CollaboratorCard: React.FC<CollaboratorCardProps> = ({
  profile,
  onPress,
  onMessage
}) => {
  const { user, skills, sparkScore } = profile;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Avatar.Text
          size={48}
          label={user.username.substring(0, 2).toUpperCase()}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.location}>{user.location || 'Location not specified'}</Text>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {skills.slice(0, 3).map((skill, index) => (
          <Chip key={index} style={styles.skillChip}>
            {skill.skill_name}
          </Chip>
        ))}
        {skills.length > 3 && (
          <Text style={styles.moreSkills}>+{skills.length - 3} more</Text>
        )}
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Match Score:</Text>
        <ProgressBar
          progress={sparkScore / 100}
          color="#4CAF50"
          style={styles.progressBar}
        />
        <Text style={styles.scoreValue}>{Math.round(sparkScore)}%</Text>
      </View>

      {onMessage && (
        <Button
          mode="contained"
          onPress={onMessage}
          style={styles.messageButton}
          icon="message"
        >
          Message
        </Button>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  skillChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  moreSkills: {
    fontSize: 12,
    color: '#666',
    alignSelf: 'center',
    marginBottom: 8,
  },
  scoreContainer: {
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  messageButton: {
    marginTop: 8,
  },
});

export default CollaboratorCard;
