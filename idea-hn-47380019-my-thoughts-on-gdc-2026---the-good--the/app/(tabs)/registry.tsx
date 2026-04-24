import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { initDatabase, saveArtist, getArtists, getArtistWorks, saveTip, getArtistEarnings } from '../../lib/database';
import { useStore } from '../../store/app-store';
import { Artist, ArtistWork } from '../../types';
import { Ionicons } from '@expo/vector-icons';

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search artists by name or style"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {!selectedArtist ? (
        <>
          <FlatList
            data={filteredArtists}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.artistCard}
                onPress={() => handleArtistSelect(item)}
              >
                <Image
                  source={{ uri: item.profileImage }}
                  style={styles.artistImage}
                />
                <View style={styles.artistInfo}>
                  <Text style={styles.artistName}>{item.name}</Text>
                  <Text style={styles.artistStyle}>{item.style}</Text>
                  <View style={styles.followersContainer}>
                    <Ionicons name="people" size={16} color="#666" />
                    <Text style={styles.followersText}>{item.followers} followers</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No artists found</Text>
              </View>
            }
          />

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => setShowRegisterModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.registerButtonText}>Register as Artist</Text>
          </TouchableOpacity>
        </>
      ) : (
        <ScrollView style={styles.artistDetailContainer}>
          <View style={styles.artistHeader}>
            <Image
              source={{ uri: selectedArtist.profileImage }}
              style={styles.artistDetailImage}
            />
            <View style={styles.artistDetailInfo}>
              <Text style={styles.artistDetailName}>{selectedArtist.name}</Text>
              <Text style={styles.artistDetailStyle}>{selectedArtist.style}</Text>
              <View style={styles.followersContainer}>
                <Ionicons name="people" size={16} color="#666" />
                <Text style={styles.followersText}>{selectedArtist.followers} followers</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{selectedArtist.bio}</Text>

          <View style={styles.earningsContainer}>
            <Text style={styles.earningsLabel}>Total Earnings:</Text>
            <Text style={styles.earningsAmount}>${artistEarnings.toFixed(2)}</Text>
          </View>

          <Text style={styles.sectionTitle}>Registered Works</Text>
          {artistWorks.length > 0 ? (
            <FlatList
              data={artistWorks}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.workImage}
                />
              )}
            />
          ) : (
            <Text style={styles.emptyWorksText}>No registered works yet</Text>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.tipButton}
              onPress={() => setShowTipModal(true)}
            >
              <Ionicons name="cash" size={20} color="white" />
              <Text style={styles.tipButtonText}>Send Tip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setSelectedArtist(null)}
            >
              <Text style={styles.backButtonText}>Back to Artists</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Register Artist Modal */}
      <Modal
        visible={showRegisterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Register as Artist</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={newArtist.name}
              onChangeText={(text) => setNewArtist({...newArtist, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Style"
              value={newArtist.style}
              onChangeText={(text) => setNewArtist({...newArtist, style: text})}
            />

            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Bio"
              value={newArtist.bio}
              onChangeText={(text) => setNewArtist({...newArtist, bio: text})}
              multiline
            />

            <TextInput
              style={styles.input}
              placeholder="Profile Image URL"
              value={newArtist.profileImage}
              onChangeText={(text) => setNewArtist({...newArtist, profileImage: text})}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowRegisterModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleRegisterSubmit}
              >
                <Text style={styles.modalButtonText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Tip Modal */}
      <Modal
        visible={showTipModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTipModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Send Tip to {selectedArtist?.name}</Text>

            <TextInput
              style={styles.input}
              placeholder="Amount ($)"
              value={tipAmount}
              onChangeText={setTipAmount}
              keyboardType="numeric"
            />

            <Text style={styles.feeText}>
              {user.premiumStatus
                ? '10% service fee (premium)'
                : '15% service fee (free)'}
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTipModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleTipSubmit}
              >
                <Text style={styles.modalButtonText}>Send Tip</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  artistCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  artistInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  artistName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artistStyle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  followersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followersText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  artistDetailContainer: {
    flex: 1,
  },
  artistHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  artistDetailImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  artistDetailInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  artistDetailName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artistDetailStyle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 20,
  },
  earningsContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  earningsLabel: {
    fontSize: 16,
    color: '#4caf50',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  workImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  emptyWorksText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  tipButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    backgroundColor: '#6200ee',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  feeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
