import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/lib/store/useStore';
import { AgeProfileCard } from '@/components/AgeProfileCard';

export default function DashboardScreen() {
  const { profiles, selectProfile } = useStore();

  const blocksToday = 12;
  const pendingRequests = 2;

  const handleProfilePress = (profileId: string) => {
    selectProfile(profileId);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Keep your family safe online</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="shield-checkmark" size={24} color="#34C759" />
          </View>
          <Text style={styles.statValue}>{blocksToday}</Text>
          <Text style={styles.statLabel}>Blocks Today</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="time" size={24} color="#FF9500" />
          </View>
          <Text style={styles.statValue}>{pendingRequests}</Text>
          <Text style={styles.statLabel}>Pending Requests</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Child Profiles</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {profiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="#C7C7CC" />
            <Text style={styles.emptyStateText}>No profiles yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap + to add your first child profile</Text>
          </View>
        ) : (
          <View style={styles.profilesGrid}>
            {profiles.map((profile) => (
              <AgeProfileCard
                key={profile.id}
                name={profile.name}
                age={profile.age}
                profileType={profile.profileType}
                onPress={() => handleProfilePress(profile.id)}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weekly Digest</Text>
        <TouchableOpacity style={styles.digestCard}>
          <View style={styles.digestHeader}>
            <Ionicons name="bar-chart" size={32} color="#007AFF" />
            <View style={styles.digestHeaderText}>
              <Text style={styles.digestTitle}>This Week's Activity</Text>
              <Text style={styles.digestSubtitle}>Mar 11 - Mar 18</Text>
            </View>
          </View>

          <View style={styles.digestStats}>
            <View style={styles.digestStatRow}>
              <Text style={styles.digestStatLabel}>Total blocks</Text>
              <Text style={styles.digestStatValue}>47</Text>
            </View>
            <View style={styles.digestStatRow}>
              <Text style={styles.digestStatLabel}>Bypass requests</Text>
              <Text style={styles.digestStatValue}>8</Text>
            </View>
            <View style={styles.digestStatRow}>
              <Text style={styles.digestStatLabel}>Approved requests</Text>
              <Text style={styles.digestStatValue}>5</Text>
            </View>
          </View>

          <View style={styles.digestFooter}>
            <Text style={styles.digestFooterText}>View full report</Text>
            <Ionicons name="chevron-forward" size={16} color="#007AFF" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  contentContainer: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 17,
    color: '#8E8E93',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
  },
  addButton: {
    padding: 4,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },
  profilesGrid: {
    gap: 12,
  },
  digestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  digestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  digestHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  digestTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  digestSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
  },
  digestStats: {
    gap: 12,
    marginBottom: 16,
  },
  digestStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  digestStatLabel: {
    fontSize: 15,
    color: '#000000',
  },
  digestStatValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  digestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  digestFooterText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '500',
    marginRight: 4,
  },
});
