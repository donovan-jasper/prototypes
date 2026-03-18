import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { insertDeepLink, getAllDeepLinks, deleteDeepLink } from '../services/DeepLinkService';

const DeepLinkManager = () => {
  const [url, setUrl] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [deepLinks, setDeepLinks] = useState([]);

  useEffect(() => {
    loadDeepLinks();
  }, []);

  const loadDeepLinks = async () => {
    try {
      const links = await getAllDeepLinks();
      setDeepLinks(links);
    } catch (error) {
      console.error('Error loading deep links:', error);
    }
  };

  const createDeepLink = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    try {
      await insertDeepLink(url.trim(), campaignName.trim() || null);
      setUrl('');
      setCampaignName('');
      await loadDeepLinks();
    } catch (error) {
      console.error('Error creating deep link:', error);
      Alert.alert('Error', 'Failed to create deep link');
    }
  };

  const copyToClipboard = async (linkUrl) => {
    try {
      await Clipboard.setStringAsync(linkUrl);
      Alert.alert('Success', 'Link copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Deep Link',
      'Are you sure you want to delete this deep link?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDeepLink(id);
              await loadDeepLinks();
            } catch (error) {
              console.error('Error deleting deep link:', error);
              Alert.alert('Error', 'Failed to delete deep link');
            }
          },
        },
      ]
    );
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Deep Link Manager</Text>

      <View style={styles.createSection}>
        <Text style={styles.sectionTitle}>Create New Deep Link</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Enter URL (e.g., https://example.com/page)"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Campaign Name (optional)"
          value={campaignName}
          onChangeText={setCampaignName}
        />

        <TouchableOpacity style={styles.createButton} onPress={createDeepLink}>
          <Text style={styles.createButtonText}>Create Deep Link</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>Your Deep Links ({deepLinks.length})</Text>
        
        {deepLinks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No deep links yet</Text>
            <Text style={styles.emptySubtext}>Create your first deep link above</Text>
          </View>
        ) : (
          deepLinks.map((link) => (
            <View key={link.id} style={styles.linkCard}>
              <View style={styles.linkHeader}>
                {link.campaign_name && (
                  <Text style={styles.campaignName}>{link.campaign_name}</Text>
                )}
                <Text style={styles.linkDate}>{formatDate(link.created_at)}</Text>
              </View>

              <Text style={styles.linkUrl} numberOfLines={2}>
                {link.url}
              </Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Clicks</Text>
                  <Text style={styles.statValue}>{link.clicks}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(link.url)}
                >
                  <Text style={styles.copyButtonText}>Copy Link</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(link.id)}
                
