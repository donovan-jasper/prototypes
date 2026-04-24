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
        source={{ uri: item.profileImage || 'https://via.placeholder.com/150' }}
        style={styles.artistAvatar}
      />
      <View style={styles.artistInfo}>
        <Text style={styles.artistName}>{item.name}</Text>
        <Text style={styles.artistStyle}>{item.style}</Text>
        <View style={styles.artistStats}>
          <Text style={styles.statText}>{item.followers} followers</Text>
          <Text style={styles.statText}>${artistEarnings.toFixed(2)} earned</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  const renderWorkItem = ({ item }: { item: ArtistWork }) => (
    <Card style={styles.workCard}>
      <Card.Cover source={{ uri: item.imageUrl }} style={styles.workImage} />
      <Card.Content>
        <Title style={styles.workTitle}>{item.title}</Title>
        <Paragraph style={styles.workDescription}>{item.description}</Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Creator Credit Registry</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search artists or styles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
          <Text style={styles.loadingText}>Loading artists...</Text>
        </View>
      ) : (
        <>
          {selectedArtist ? (
            <ScrollView style={styles.artistDetailContainer}>
              <View style={styles.artistHeader}>
                <Avatar.Image
                  size={100}
                  source={{ uri: selectedArtist.profileImage || 'https://via.placeholder.com/150' }}
                  style={styles.artistDetailAvatar}
                />
                <View style={styles.artistDetailInfo}>
                  <Text style={styles.artistDetailName}>{selectedArtist.name}</Text>
                  <Text style={styles.artistDetailStyle}>{selectedArtist.style}</Text>
                  <View style={styles.artistDetailStats}>
                    <Text style={styles.statText}>{selectedArtist.followers} followers</Text>
                    <Text style={styles.statText}>${artistEarnings.toFixed(2)} earned</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.artistBio}>{selectedArtist.bio}</Text>

              <Divider style={styles.divider} />

              <Text style={styles.sectionTitle}>Works</Text>
              {artistWorks.length > 0 ? (
                <FlatList
                  data={artistWorks}
                  renderItem={renderWorkItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.worksList}
                />
              ) : (
                <Text style={styles.noWorksText}>No works available</Text>
              )}

              <Divider style={styles.divider} />

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
              contentContainerStyle={styles.artistsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No artists found</Text>
                  <Button
                    mode="contained"
                    onPress={() => setShowRegisterModal(true)}
                    style={styles.registerButton}
                  >
                    Register as Artist
                  </Button>
                </View>
              }
            />
          )}
        </>
      )}

      {/* Register Artist Modal */}
      <Modal
        visible={showRegisterModal}
        animationType="slide"
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>Register as Artist</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newArtist.name}
              onChangeText={(text) => setNewArtist({...newArtist, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Style (e.g., 'Surrealism', 'Digital Art')"
              value={newArtist.style}
              onChangeText={(text) => setNewArtist({...newArtist, style: text})}
            />

            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Bio (Tell us about your work)"
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
                mode="contained"
                onPress={handleRegisterSubmit}
                style={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Register'}
              </Button>

              <Button
                mode="outlined"
                onPress={() => setShowRegisterModal(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Tip Modal */}
      <Modal
        visible={showTipModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTipModal(false)}
      >
        <View style={styles.tipModalContainer}>
          <View style={styles.tipModalContent}>
            <Text style={styles.tipModalTitle}>Send Tip to {selectedArtist?.name}</Text>

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

            <View style={styles.tipButtonGroup}>
              <Button
                mode="contained"
                onPress={handleTipSubmit}
                style={styles.tipSubmitButton}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send Tip'}
              </Button>

              <Button
                mode="outlined"
                onPress={() => setShowTipModal(false)}
                style={styles.tipCancelButton}
              >
                Cancel
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#6200ee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  artistsList: {
    padding: 16,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
  },
  artistAvatar: {
    marginRight: 16,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  artistStyle: {
    fontSize: 14,
    color: '#666',
    marginVertical: 4,
  },
  artistStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  registerButton: {
    marginTop: 16,
    paddingHorizontal: 24,
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
  artistDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  artistDetailStyle: {
    fontSize: 16,
    color: '#666',
    marginVertical: 4,
  },
  artistDetailStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  artistBio: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  divider: {
    marginVertical: 24,
  },
  worksList: {
    paddingVertical: 12,
  },
  workCard: {
    width: 200,
    marginRight: 16,
    elevation: 2,
  },
  workImage: {
    height: 150,
  },
  workTitle: {
    fontSize: 16,
    marginTop: 8,
  },
  workDescription: {
    fontSize: 14,
    color: '#666',
  },
  noWorksText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginVertical: 24,
  },
  tipButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  bioInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    marginTop: 24,
  },
  submitButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  cancelButton: {
    paddingVertical: 8,
  },
  tipModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  tipModalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    width: '80%',
  },
  tipModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  tipInput: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  tipInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  tipButtonGroup: {
    marginTop: 16,
  },
  tipSubmitButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  tipCancelButton: {
    paddingVertical: 8,
  },
});
