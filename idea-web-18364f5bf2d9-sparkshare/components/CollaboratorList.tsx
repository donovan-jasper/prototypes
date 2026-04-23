import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Button, Searchbar, Chip, Menu, Divider } from 'react-native-paper';
import CollaboratorCard from './CollaboratorCard';
import { findPotentialMatches } from '../lib/matching';
import { UserProfile } from '../lib/types';

interface CollaboratorListProps {
  currentUserId: number;
  ideaId?: number;
  onSelectCollaborator?: (profile: UserProfile) => void;
  onMessageCollaborator?: (profile: UserProfile) => void;
}

const CollaboratorList: React.FC<CollaboratorListProps> = ({
  currentUserId,
  ideaId,
  onSelectCollaborator,
  onMessageCollaborator
}) => {
  const [collaborators, setCollaborators] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    skills: [] as string[],
    location: '',
    minMatchScore: 0
  });
  const [sortBy, setSortBy] = useState<'score' | 'newest'>('score');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadCollaborators();
  }, [filters, sortBy]);

  const loadCollaborators = async () => {
    setLoading(true);
    try {
      const matches = await findPotentialMatches(currentUserId, ideaId, {
        skills: filters.skills,
        location: filters.location,
        minMatchScore: filters.minMatchScore
      });

      // Apply search filter
      const filteredMatches = matches.filter(profile =>
        profile.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.skills.some(skill =>
          skill.skill_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

      // Apply sorting
      if (sortBy === 'score') {
        filteredMatches.sort((a, b) => b.sparkScore - a.sparkScore);
      } else {
        filteredMatches.sort((a, b) =>
          new Date(b.user.created_at).getTime() - new Date(a.user.created_at).getTime()
        );
      }

      setCollaborators(filteredMatches);
    } catch (error) {
      console.error('Error loading collaborators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Debounce the search to avoid too many API calls
    const timer = setTimeout(() => {
      loadCollaborators();
    }, 500);
    return () => clearTimeout(timer);
  };

  const toggleSkillFilter = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const clearFilters = () => {
    setFilters({
      skills: [],
      location: '',
      minMatchScore: 0
    });
  };

  const renderItem = ({ item }: { item: UserProfile }) => (
    <CollaboratorCard
      profile={item}
      onPress={() => onSelectCollaborator?.(item)}
      onMessage={() => onMessageCollaborator?.(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No collaborators found matching your criteria</Text>
      <Button mode="outlined" onPress={clearFilters}>
        Clear Filters
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search collaborators..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={styles.searchBar}
      />

      <View style={styles.filterContainer}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setMenuVisible(true)}
              icon="filter"
            >
              Filters
            </Button>
          }
        >
          <Menu.Item
            title="Location"
            onPress={() => {
              // In a real app, you'd show a location picker here
              setFilters(prev => ({ ...prev, location: 'Remote' }));
              setMenuVisible(false);
            }}
          />
          <Divider />
          <Menu.Item
            title="Minimum Match Score"
            onPress={() => {
              setFilters(prev => ({ ...prev, minMatchScore: 70 }));
              setMenuVisible(false);
            }}
          />
        </Menu>

        <Button
          mode="outlined"
          onPress={() => setSortBy(sortBy === 'score' ? 'newest' : 'score')}
          icon={sortBy === 'score' ? 'sort-descending' : 'sort-clock-ascending'}
        >
          {sortBy === 'score' ? 'Sort by Score' : 'Sort by Newest'}
        </Button>
      </View>

      <View style={styles.activeFilters}>
        {filters.skills.map(skill => (
          <Chip
            key={skill}
            onClose={() => toggleSkillFilter(skill)}
            style={styles.filterChip}
          >
            {skill}
          </Chip>
        ))}
        {filters.location && (
          <Chip
            onClose={() => setFilters(prev => ({ ...prev, location: '' }))}
            style={styles.filterChip}
          >
            {filters.location}
          </Chip>
        )}
        {filters.minMatchScore > 0 && (
          <Chip
            onClose={() => setFilters(prev => ({ ...prev, minMatchScore: 0 }))}
            style={styles.filterChip}
          >
            Min Score: {filters.minMatchScore}%
          </Chip>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : (
        <FlatList
          data={collaborators}
          renderItem={renderItem}
          keyExtractor={item => item.user.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 16,
  },
  loading: {
    marginTop: 32,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default CollaboratorList;
