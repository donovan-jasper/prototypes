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

  const renderArtistWork = ({ item }: { item: ArtistWork }) => (
    <Card style={styles.workCard}>
      <Card.Cover source={{ uri: item.imageUrl }} />
      <Card.Content>
        <Paragraph>{item.description}</Paragraph>
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
          autoCapitalize="none"
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" style={styles.loading} />
      ) : selectedArtist ? (
        <ScrollView style={styles.artistDetailContainer}>
          <View style={styles.artistHeader}>
            <Avatar.Image
              size={100}
              source={{ uri: selectedArtist.profileImage }}
              style={styles.artistDetailAvatar}
            />
            <View style={styles.artistDetailInfo}>
              <Title>{selectedArtist.name}</Title>
              <Paragraph style={styles.artistDetailStyle}>{selectedArtist.style}</Paragraph>
              <Paragraph>{selectedArtist.followers} followers</Paragraph>
              <Paragraph style={styles.artistEarnings}>Earnings: ${artistEarnings.toFixed(2)}</Paragraph>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.bioContainer}>
            <Title>About</Title>
            <Paragraph>{selectedArtist.bio}</Paragraph>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.portfolioContainer}>
            <Title>Portfolio</Title>
            {artistWorks.length > 0 ? (
              <FlatList
                data={artistWorks}
                renderItem={renderArtistWork}
                keyExtractor={(item) => item.id.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.workList}
              />
            ) : (
              <Paragraph>No works in portfolio yet.</Paragraph>
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
        <View style={styles.artistListContainer}>
          <FlatList
            data={filteredArtists}
            renderItem={renderArtistItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text>No artists found. Be the first to register!</Text>
              </View>
            }
          />
          <Button
            mode="contained"
            onPress={() => setShowRegisterModal(true)}
            style={styles.registerButton}
            icon="add"
          >
            Register as Artist
          </Button>
        </View>
      )}

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
              placeholder="Name"
              value={newArtist.name}
              onChangeText={(text) => setNewArtist({...newArtist, name: text})}
            />

            <TextInput
              style={styles.input}
              placeholder="Style (e.g., 'Surrealism, Digital Art')"
              value={newArtist.style}
              onChangeText={(text) => setNewArtist({...newArtist, style: text})}
            />

            <TextInput
              style={[styles.input, styles.bioInput]}
              placeholder="Bio (describe your style and work)"
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

            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                onPress={handleRegisterSubmit}
                disabled={isLoading}
                loading={isLoading}
              >
                Register
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowRegisterModal(false)}
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
        onRequestClose={() => setShowTipModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Title style={styles.modalTitle}>Send Tip to {selectedArtist?.name}</Title>

            <TextInput
              style={styles.input}
              placeholder="Amount ($)"
              value={tipAmount}
              onChangeText={setTipAmount}
              keyboardType="numeric"
            />

            <Text style={styles.feeInfo}>
              {user.premiumStatus
                ? '10% fee (premium user)'
                : '15% fee (free user)'}
            </Text>

            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                onPress={handleTipSubmit}
                disabled={isLoading}
                loading={isLoading}
              >
                Send Tip
              </Button>
              <Button
                mode="outlined"
                onPress={() => setShowTipModal(false)}
              >
                Cancel
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
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
  },
  artistListContainer: {
    flex: 1,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    color: '#666',
    marginVertical: 4,
  },
  artistFollowers: {
    color: '#888',
    fontSize: 12,
  },
  emptyList: {
    padding: 16,
    alignItems: 'center',
  },
  registerButton: {
    margin: 16,
  },
  artistDetailContainer: {
    flex: 1,
    padding: 16,
  },
  artistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  artistDetailAvatar: {
    marginRight: 16,
  },
  artistDetailInfo: {
    flex: 1,
  },
  artistDetailStyle: {
    color: '#666',
    marginVertical: 4,
  },
  artistEarnings: {
    fontWeight: 'bold',
    marginTop: 8,
  },
  divider: {
    marginVertical: 16,
  },
  bioContainer: {
    marginBottom: 16,
  },
  portfolioContainer: {
    marginBottom: 16,
  },
  workList: {
    paddingVertical: 8,
  },
  workCard: {
    width: 200,
    marginRight: 12,
  },
  tipButton: {
    marginTop: 16,
  },
  backButton: {
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContent: {
    padding: 16,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  feeInfo: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
});
