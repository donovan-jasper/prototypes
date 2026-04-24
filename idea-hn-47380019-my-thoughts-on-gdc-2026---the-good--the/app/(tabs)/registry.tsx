import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, Modal, ScrollView, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { initDatabase, saveArtist, getArtists, getArtistWorks, saveTip, getArtistEarnings } from '../../lib/database';
import { useStore } from '../../store/app-store';
import { Artist, ArtistWork } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, Title, Paragraph, Avatar, Divider } from 'react-native-paper';

export default function RegistryScreen() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistWorks, setArtistWorks] = useState<ArtistWork[]>([]);
  const [artistEarnings, setArtistEarnings] = useState<number>(0);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newArtist, setNewArtist] = useState<Partial<Artist>>({
    name: '',
    style: '',
    bio: '',
    profileImage: '',
    followers: 0
  });
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { user, updateUser } = useStore();

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      try {
        await initDatabase();
        const fetchedArtists = await getArtists();
        setArtists(fetchedArtists);
      } catch (error) {
        console.error('Error initializing database:', error);
        Alert.alert('Error', 'Failed to load artists. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.style.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleArtistSelect = async (artist: Artist) => {
    setIsLoading(true);
    try {
      setSelectedArtist(artist);
      const works = await getArtistWorks(artist.id);
      const earnings = await getArtistEarnings(artist.id);
      setArtistWorks(works);
      setArtistEarnings(earnings);
    } catch (error) {
      console.error('Error loading artist details:', error);
      Alert.alert('Error', 'Failed to load artist details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!newArtist.name || !newArtist.style || !newArtist.bio || !newArtist.profileImage) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const artistId = await saveArtist({
        ...newArtist,
        id: 0,
        followers: newArtist.followers || 0,
        createdAt: new Date().toISOString()
      } as Artist);

      const updatedArtists = await getArtists();
      setArtists(updatedArtists);
      setShowRegisterModal(false);
      setNewArtist({
        name: '',
        style: '',
        bio: '',
        profileImage: '',
        followers: 0
      });
      Alert.alert('Success', 'Artist registered successfully!');
    } catch (error) {
      console.error('Error registering artist:', error);
      Alert.alert('Error', 'Failed to register artist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTipSubmit = async () => {
    if (!selectedArtist) return;

    const amount = parseFloat(tipAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid tip amount');
      return;
    }

    if (user.balance && user.balance < amount) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    setIsLoading(true);
    try {
      const fee = user.premiumStatus ? amount * 0.1 : amount * 0.15;
      const netAmount = amount - fee;

      await saveTip({
        artistId: selectedArtist.id,
        amount: netAmount,
        fee,
        timestamp: new Date().toISOString()
      });

      // Update user's balance
      updateUser({ balance: (user.balance || 0) - amount });

      // Update artist earnings
      const updatedEarnings = await getArtistEarnings(selectedArtist.id);
      setArtistEarnings(updatedEarnings);

      setShowTipModal(false);
      setTipAmount('');
      Alert.alert('Success', `Tip of $${amount.toFixed(2)} sent successfully!`);
    } catch (error) {
      console.error('Error sending tip:', error);
      Alert.alert('Error', 'Failed to send tip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderArtistItem = ({ item }: { item: Artist }) => (
    <TouchableOpacity onPress={() => handleArtistSelect(item)} style={styles.artistItem}>
      <Avatar.Image
        size={60}
        source={{ uri: item.profileImage }}
        style={styles.artistAvatar}
      />
      <View style={styles.artistInfo}>
        <Text style={styles.artistName}>{item.name}</Text>
        <Text style={styles.artistStyle}>{item.style}</Text>
        <Text style={styles.artistFollowers}>{item.followers} followers</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  const renderWorkItem = ({ item }: { item: ArtistWork }) => (
    <Card style={styles.workCard}>
      <Card.Cover source={{ uri: item.imageUrl }} />
      {item.description && (
        <Card.Content>
          <Paragraph>{item.description}</Paragraph>
        </Card.Content>
      )}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search artists or styles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loadingIndicator} />
      ) : selectedArtist ? (
        <ScrollView style={styles.artistDetailContainer}>
          <View style={styles.artistHeader}>
            <Avatar.Image
              size={80}
              source={{ uri: selectedArtist.profileImage }}
              style={styles.artistDetailAvatar}
            />
            <View style={styles.artistDetailInfo}>
              <Title>{selectedArtist.name}</Title>
              <Paragraph>{selectedArtist.style}</Paragraph>
              <Text style={styles.artistFollowers}>{selectedArtist.followers} followers</Text>
            </View>
          </View>

          <View style={styles.artistBioContainer}>
            <Title>About</Title>
            <Paragraph>{selectedArtist.bio}</Paragraph>
          </View>

          <View style={styles.earningsContainer}>
            <Title>Earnings</Title>
            <Text style={styles.earningsAmount}>${artistEarnings.toFixed(2)}</Text>
          </View>

          <View style={styles.worksContainer}>
            <Title>Portfolio</Title>
            {artistWorks.length > 0 ? (
              <FlatList
                data={artistWorks}
                renderItem={renderWorkItem}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.worksGrid}
              />
            ) : (
              <Text style={styles.noWorksText}>No works available yet</Text>
            )}
          </View>

          <Button
            mode="contained"
            onPress={() => setShowTipModal(true)}
            style={styles.tipButton}
            icon="cash"
          >
            Send Tip
          </Button>

          <Button
            mode="outlined"
            onPress={() => setSelectedArtist(null)}
            style={styles.backButton}
          >
            Back to Registry
          </Button>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredArtists}
          renderItem={renderArtistItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.artistList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people" size={60} color="#ccc" />
              <Text style={styles.emptyText}>No artists found</Text>
            </View>
          }
        />
      )}

      <Button
        mode="contained"
        onPress={() => setShowRegisterModal(true)}
        style={styles.registerButton}
        icon="add"
      >
        Register as Artist
      </Button>

      {/* Register Artist Modal */}
      <Modal
        visible={showRegisterModal}
        animationType="slide"
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Title style={styles.modalTitle}>Register as Artist</Title>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={newArtist.name}
              onChangeText={(text) => setNewArtist({...newArtist, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Artistic Style"
              value={newArtist.style}
              onChangeText={(text) => setNewArtist({...newArtist, style: text})}
            />

            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Bio (describe your work)"
              value={newArtist.bio}
              onChangeText={(text) => setNewArtist({...newArtist, bio: text})}
              multiline
              numberOfLines={4}
            />

            <TextInput
              style={styles.input}
              placeholder="Profile Image URL"
              value={newArtist.profileImage}
              onChangeText={(text) => setNewArtist({...newArtist, profileImage: text})}
            />

            <View style={styles.buttonGroup}>
              <Button
                mode="outlined"
                onPress={() => setShowRegisterModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                onPress={handleRegisterSubmit}
                loading={isLoading}
                disabled={isLoading}
              >
                Register
              </Button>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Tip Modal */}
      <Modal
        visible={showTipModal}
        animationType="slide"
        onRequestClose={() => setShowTipModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>Send Tip to {selectedArtist?.name}</Title>

            <TextInput
              style={styles.tipInput}
              placeholder="Amount ($)"
              value={tipAmount}
              onChangeText={setTipAmount}
              keyboardType="numeric"
            />

            <Text style={styles.tipInfo}>
              {user.premiumStatus
                ? 'Premium users pay 10% fee'
                : 'Standard users pay 15% fee'}
            </Text>

            <View style={styles.buttonGroup}>
              <Button
                mode="outlined"
                onPress={() => setShowTipModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>

              <Button
                mode="contained"
                onPress={handleTipSubmit}
                loading={isLoading}
                disabled={isLoading}
              >
                Send Tip
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  artistList: {
    padding: 16,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  artistAvatar: {
    marginRight: 12,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistStyle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  artistFollowers: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  registerButton: {
    margin: 16,
    paddingVertical: 8,
  },
  loadingIndicator: {
    marginTop: 32,
  },
  artistDetailContainer: {
    flex: 1,
    padding: 16,
  },
  artistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  artistDetailAvatar: {
    marginRight: 16,
  },
  artistDetailInfo: {
    flex: 1,
  },
  artistBioContainer: {
    marginBottom: 24,
  },
  earningsContainer: {
    marginBottom: 24,
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  worksContainer: {
    marginBottom: 24,
  },
  worksGrid: {
    justifyContent: 'space-between',
    marginTop: 8,
  },
  workCard: {
    width: '48%',
    marginBottom: 16,
  },
  noWorksText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
  },
  tipButton: {
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  cancelButton: {
    marginRight: 8,
  },
  tipInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  tipInfo: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
});
