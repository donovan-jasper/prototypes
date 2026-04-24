import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, Modal, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { initDatabase, saveArtist, getArtists, getArtistWorks, saveTip } from '../../lib/database';
import { useStore } from '../../store/app-store';
import { Artist, ArtistWork } from '../../types';

export default function RegistryScreen() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [artistWorks, setArtistWorks] = useState<ArtistWork[]>([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [newArtist, setNewArtist] = useState<Partial<Artist>>({});
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const navigation = useNavigation();
  const { user, updateUser } = useStore();

  useEffect(() => {
    const initialize = async () => {
      await initDatabase();
      const fetchedArtists = await getArtists();
      setArtists(fetchedArtists);
    };
    initialize();
  }, []);

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    artist.style.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleArtistSelect = async (artist: Artist) => {
    setSelectedArtist(artist);
    const works = await getArtistWorks(artist.id);
    setArtistWorks(works);
  };

  const handleRegisterSubmit = async () => {
    if (newArtist.name && newArtist.style && newArtist.bio && newArtist.profileImage) {
      const artistId = await saveArtist(newArtist as Artist);
      const updatedArtists = await getArtists();
      setArtists(updatedArtists);
      setShowRegisterModal(false);
      setNewArtist({});
    }
  };

  const handleTipSubmit = async () => {
    if (selectedArtist && tipAmount) {
      const amount = parseFloat(tipAmount);
      if (!isNaN(amount) && amount > 0) {
        const fee = user.premiumStatus ? amount * 0.1 : amount * 0.15;
        const netAmount = amount - fee;

        await saveTip({
          artistId: selectedArtist.id,
          amount: netAmount,
          fee,
          timestamp: new Date().toISOString()
        });

        // Update user's balance (in a real app, this would be handled by a payment system)
        updateUser({ balance: (user.balance || 0) - amount });

        setShowTipModal(false);
        setTipAmount('');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Creator Credit Registry</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search artists or styles..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => setShowRegisterModal(true)}
      >
        <Text style={styles.registerButtonText}>Register as Artist</Text>
      </TouchableOpacity>

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
              <Text style={styles.artistFollowers}>{item.followers} followers</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Artist Profile Modal */}
      <Modal
        visible={!!selectedArtist}
        animationType="slide"
        onRequestClose={() => setSelectedArtist(null)}
      >
        <ScrollView style={styles.modalContainer}>
          {selectedArtist && (
            <>
              <Image
                source={{ uri: selectedArtist.profileImage }}
                style={styles.profileImage}
              />
              <Text style={styles.profileName}>{selectedArtist.name}</Text>
              <Text style={styles.profileStyle}>{selectedArtist.style}</Text>
              <Text style={styles.profileBio}>{selectedArtist.bio}</Text>

              <TouchableOpacity
                style={styles.tipButton}
                onPress={() => setShowTipModal(true)}
              >
                <Text style={styles.tipButtonText}>Tip Artist</Text>
              </TouchableOpacity>

              <Text style={styles.sectionTitle}>Portfolio</Text>
              <FlatList
                data={artistWorks}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.portfolioImage}
                  />
                )}
              />
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
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Register as Artist</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={newArtist.name || ''}
            onChangeText={(text) => setNewArtist({...newArtist, name: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Style"
            value={newArtist.style || ''}
            onChangeText={(text) => setNewArtist({...newArtist, style: text})}
          />

          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Bio"
            multiline
            value={newArtist.bio || ''}
            onChangeText={(text) => setNewArtist({...newArtist, bio: text})}
          />

          <TextInput
            style={styles.input}
            placeholder="Profile Image URL"
            value={newArtist.profileImage || ''}
            onChangeText={(text) => setNewArtist({...newArtist, profileImage: text})}
          />

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleRegisterSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Registration</Text>
          </TouchableOpacity>
        </View>
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
            <Text style={styles.tipModalArtist}>{selectedArtist?.name}</Text>

            <TextInput
              style={styles.tipInput}
              placeholder="Amount"
              keyboardType="numeric"
              value={tipAmount}
              onChangeText={setTipAmount}
            />

            <Text style={styles.tipFeeText}>
              {user.premiumStatus ? '10% fee' : '15% fee'}
            </Text>

            <View style={styles.tipButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowTipModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleTipSubmit}
              >
                <Text style={styles.confirmButtonText}>Confirm Tip</Text>
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
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  registerButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  artistCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
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
    fontWeight: 'bold',
    fontSize: 16,
  },
  artistStyle: {
    color: '#666',
    marginVertical: 4,
  },
  artistFollowers: {
    color: '#888',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  profileImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileStyle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  profileBio: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  tipButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  tipButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  portfolioImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tipModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  tipModalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  tipModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  tipModalArtist: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  tipInput: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 18,
  },
  tipFeeText: {
    textAlign: 'center',
    color: '#888',
    marginBottom: 20,
  },
  tipButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
