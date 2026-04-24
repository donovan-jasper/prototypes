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
      <Avatar.Image size={60} source={{ uri: item.profileImage }} />
      <View style={styles.artistInfo}>
        <Text style={styles.artistName}>{item.name}</Text>
        <Text style={styles.artistStyle}>{item.style}</Text>
        <Text style={styles.artistFollowers}>{item.followers} followers</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#6200ee" />
    </TouchableOpacity>
  );

  const renderWorkItem = ({ item }: { item: ArtistWork }) => (
    <Card style={styles.workCard}>
      <Card.Cover source={{ uri: item.imageUrl }} />
      <Card.Content>
        <Paragraph>{item.description || 'No description available'}</Paragraph>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (selectedArtist) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedArtist(null)}>
            <Ionicons name="arrow-back" size={24} color="#6200ee" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Artist Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.profileContainer}>
          <View style={styles.profileHeader}>
            <Avatar.Image size={100} source={{ uri: selectedArtist.profileImage }} />
            <View style={styles.profileInfo}>
              <Title>{selectedArtist.name}</Title>
              <Paragraph>{selectedArtist.style}</Paragraph>
              <Text style={styles.followersText}>{selectedArtist.followers} followers</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.bioSection}>
            <Title>About</Title>
            <Paragraph>{selectedArtist.bio}</Paragraph>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.earningsSection}>
            <Title>Earnings</Title>
            <Text style={styles.earningsAmount}>${artistEarnings.toFixed(2)}</Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.worksSection}>
            <Title>Credited Works</Title>
            {artistWorks.length > 0 ? (
              <FlatList
                data={artistWorks}
                renderItem={renderWorkItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.worksList}
              />
            ) : (
              <Text style={styles.noWorksText}>No credited works yet</Text>
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
        </ScrollView>

        <Modal
          visible={showTipModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowTipModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Title>Send Tip to {selectedArtist?.name}</Title>
              <TextInput
                style={styles.tipInput}
                placeholder="Amount ($)"
                keyboardType="numeric"
                value={tipAmount}
                onChangeText={setTipAmount}
              />
              <View style={styles.tipInfo}>
                <Text>Your balance: ${user.balance?.toFixed(2) || '0.00'}</Text>
                <Text>Fee: {user.premiumStatus ? '10%' : '15%'}</Text>
              </View>
              <View style={styles.modalButtons}>
                <Button onPress={() => setShowTipModal(false)}>Cancel</Button>
                <Button mode="contained" onPress={handleTipSubmit}>Send Tip</Button>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Creator Registry</Text>
        <TouchableOpacity onPress={() => setShowRegisterModal(true)}>
          <Ionicons name="add-circle-outline" size={24} color="#6200ee" />
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search artists or styles..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredArtists.length > 0 ? (
        <FlatList
          data={filteredArtists}
          renderItem={renderArtistItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.artistList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No artists found</Text>
          <Button
            mode="outlined"
            onPress={() => setShowRegisterModal(true)}
            style={styles.registerButton}
          >
            Register as Artist
          </Button>
        </View>
      )}

      <Modal
        visible={showRegisterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Title>Register as Artist</Title>
            <ScrollView>
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
                multiline
                numberOfLines={4}
                value={newArtist.bio}
                onChangeText={(text) => setNewArtist({...newArtist, bio: text})}
              />
              <TextInput
                style={styles.input}
                placeholder="Profile Image URL"
                value={newArtist.profileImage}
                onChangeText={(text) => setNewArtist({...newArtist, profileImage: text})}
              />
              <View style={styles.modalButtons}>
                <Button onPress={() => setShowRegisterModal(false)}>Cancel</Button>
                <Button mode="contained" onPress={handleRegisterSubmit}>Register</Button>
              </View>
            </ScrollView>
          </View>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchInput: {
    padding: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  artistList: {
    padding: 16,
  },
  artistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  artistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  artistName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artistStyle: {
    fontSize: 14,
    color: '#666',
  },
  artistFollowers: {
    fontSize: 12,
    color: '#999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  registerButton: {
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
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
  profileContainer: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  followersText: {
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  bioSection: {
    marginBottom: 16,
  },
  earningsSection: {
    marginBottom: 16,
  },
  earningsAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginTop: 8,
  },
  worksSection: {
    marginBottom: 16,
  },
  worksList: {
    paddingBottom: 16,
  },
  workCard: {
    marginBottom: 12,
  },
  noWorksText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  tipButton: {
    marginTop: 16,
  },
  tipInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
  },
  tipInfo: {
    marginBottom: 16,
  },
});
