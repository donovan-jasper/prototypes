import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import HealthPassport from '../../components/HealthPassport';
import { FamilyMember } from '../../types';
import { getFamilyMembers } from '../../lib/database';

export default function HealthPassportScreen() {
  const navigation = useNavigation();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const data = await getFamilyMembers();
    setMembers(data);
    if (data.length > 0) {
      setSelectedMemberId(data[0].id);
    }
  };

  const renderMemberTab = ({ item }: { item: FamilyMember }) => (
    <TouchableOpacity
      style={[
        styles.memberTab,
        selectedMemberId === item.id && styles.selectedMemberTab
      ]}
      onPress={() => setSelectedMemberId(item.id)}
    >
      <Text style={[
        styles.memberTabText,
        selectedMemberId === item.id && styles.selectedMemberTabText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Passport</Text>
      </View>

      {members.length > 0 ? (
        <>
          <FlatList
            data={members}
            renderItem={renderMemberTab}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberTabs}
          />

          {selectedMemberId && (
            <HealthPassport memberId={selectedMemberId} />
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No family members found. Please add members first.</Text>
          <TouchableOpacity
            style={styles.addMemberButton}
            onPress={() => navigation.navigate('member/add')}
          >
            <Text style={styles.addMemberButtonText}>Add Family Member</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  memberTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedMemberTab: {
    backgroundColor: '#4CAF50',
  },
  memberTabText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedMemberTabText: {
    color: 'white',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  addMemberButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addMemberButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
