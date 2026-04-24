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
      <Text style={styles.title}>Creator Credit Registry</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search artists or styles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => setShowRegisterModal(true)}
      >
        <Text style={styles.registerButtonText}>Register as Artist</Text>
      </TouchableOpacity>

      {filteredArtists.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people" size={48} color="#999" />
          <Text style={styles.emptyText}>No artists found</Text>
        </View>
      ) : (
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
                onError={() => console.log('Image load error')}
              />
              <View style={styles.artistInfo}>
                <Text style={styles.artistName}>{item.name}</Text>
                <Text style={styles.artistStyle}>{item.style}</Text>
                <View style={styles.followersContainer}>
                  <Ionicons name="people" size={16} color="#666" />
                  <Text style={styles.artistFollowers}>{item.followers} followers</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Artist Profile Modal */}
      <Modal
        visible={!!selectedArtist}
        animationType="slide"
        onRequestClose={() => setSelectedArtist(null)}
      >
        <ScrollView style={styles.modalContainer}>
          {selectedArtist && (
            <>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedArtist(null)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>

              <Image
                source={{ uri: selectedArtist.profileImage }}
                style={styles.profileImage}
                onError={() => console.log('Profile image load error')}
              />
              <Text style={styles.profileName}>{selectedArtist.name}</Text>
              <Text style={styles.profileStyle}>{selectedArtist.style}</Text>

              <View style={styles.earningsContainer}>
                <Text style={styles.earningsLabel}>Earnings:</Text>
                <Text style={styles.earningsAmount}>${artistEarnings.toFixed(2)}</Text>
              </View>

              <Text style={styles.profileBio}>{selectedArtist.bio}</Text>

              <TouchableOpacity
                style={styles.tipButton}
                onPress={() => setShowTipModal(true)}
              >
                <Text style={styles.tipButtonText}>Tip Artist</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Portfolio</Text>

              {artistWorks.length > 0 ? (
                <FlatList
                  data={artistWorks}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.workItem}>
                      <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.workImage}
                        onError={() => console.log('Work image load error')}
                      />
                      {item.description && (
                        <Text style={styles.workDescription}>{item.description}</Text>
                      )}
                    </View>
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.worksList}
                />
              ) : (
                <View style={styles.emptyWorks}>
                  <Ionicons name="image" size={24} color="#999" />
                  <Text style={styles.emptyWorksText}>No works in portfolio</Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </Modal>

      {/* Register Artist Modal */}
      <Modal
        visible={showRegisterModal}
        animationType="slide"
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <ScrollView style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowRegisterModal(false)}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Register as Artist</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={newArtist.name}
              onChangeText={(text) => setNewArtist({...newArtist, name: text})}
              placeholder="Your name or artist name"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Style</Text>
            <TextInput
              style={styles.input}
              value={newArtist.style}
              onChangeText={(text) => setNewArtist({...newArtist, style: text})}
              placeholder="Describe your artistic style"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newArtist.bio}
              onChangeText={(text) => setNewArtist({...newArtist, bio: text})}
              placeholder="Tell us about yourself and your work"
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Profile Image URL</Text>
            <TextInput
              style={styles.input}
              value={newArtist.profileImage}
              onChangeText={(text) => setNewArtist({...newArtist, profileImage: text})}
              placeholder="https://example.com/your-image.jpg"
            />
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleRegisterSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Registration</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
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
            <Text style={styles.tipModalTitle}>Send Tip</Text>

            <Text style={styles.tipModalArtistName}>
              {selectedArtist?.name}
            </Text>

            <View style={styles.tipAmountContainer}>
              <Text style={styles.tipAmountLabel}>Amount ($):</Text>
              <TextInput
                style={styles.tipAmountInput}
                value={tipAmount}
                onChangeText={setTipAmount}
                keyboardType="numeric"
                placeholder="0.00"
              />
            </View>

            <Text style={styles.tipFeeText}>
              Fee: {user.premiumStatus ? '10%' : '15%'}
            </Text>

            <View style={styles.tipModalButtons}>
              <TouchableOpacity
                style={[styles.tipModalButton, styles.cancelButton]}
                onPress={() => setShowTipModal(false)}
              >
                <Text style={styles.tipModalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tipModalButton, styles.confirmButton]}
                onPress={handleTipSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.tipModalButtonText}>Send Tip</Text>
                )}
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
    backgroundColor: '#fff',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 16,
  },
  artistCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  artistImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  artistInfo: {
    flex: 1,
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
  artistFollowers: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  profileStyle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  earningsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  profileBio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  tipButton: {
    backgroundColor: '#6200ee',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  tipButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  worksList: {
    paddingVertical: 8,
  },
  workItem: {
    width: 150,
    marginRight: 12,
  },
  workImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  workDescription: {
    fontSize: 12,
    color: '#666',
  },
  emptyWorks: {
    alignItems: 'center',
    padding: 20,
  },
  emptyWorksText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  tipModalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
  },
  tipModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  tipModalArtistName: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  tipAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipAmountLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  tipAmountInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    fontSize: 16,
    textAlign: 'right',
  },
  tipFeeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  tipModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tipModalButton: {
    padding: 12,
    borderRadius: 4,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  confirmButton: {
    backgroundColor: '#6200ee',
  },
  tipModalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
