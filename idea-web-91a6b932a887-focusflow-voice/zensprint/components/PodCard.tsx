import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Pod {
  id: string;
  name: string;
  members: string[];
  activeMembers: string[];
}

interface PodCardProps {
  pod: Pod;
}

const PodCard: React.FC<PodCardProps> = ({ pod }) => {
  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{pod.name}</Text>
        <View style={styles.membersContainer}>
          {pod.members.map((member, index) => (
            <View
              key={index}
              style={[
                styles.member,
                pod.activeMembers.includes(member) && styles.activeMember,
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.memberCount}>{pod.members.length} members</Text>
        <Ionicons name="chevron-forward" size={20} color="#b2bec3" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  membersContainer: {
    flexDirection: 'row',
  },
  member: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#dfe6e9',
    marginLeft: -5,
    borderWidth: 2,
    borderColor: 'white',
  },
  activeMember: {
    backgroundColor: '#6c5ce7',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberCount: {
    fontSize: 12,
    color: '#636e72',
  },
});

export default PodCard;
