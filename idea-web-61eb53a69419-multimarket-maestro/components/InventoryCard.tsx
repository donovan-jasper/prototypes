import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card, Text, IconButton, Menu } from 'react-native-paper';
import { Listing } from '../types';
import PlatformBadge from './PlatformBadge';

interface InventoryCardProps {
  listing: Listing;
  onEdit: (listing: Listing) => void;
  onDelete: (id: string) => void;
}

export default function InventoryCard({ listing, onEdit, onDelete }: InventoryCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleEdit = () => {
    closeMenu();
    onEdit(listing);
  };

  const handleDelete = () => {
    closeMenu();
    onDelete(listing.id);
  };

  const getSyncStatusColor = () => {
    switch (listing.syncStatus) {
      case 'synced':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getSyncStatusIcon = () => {
    switch (listing.syncStatus) {
      case 'synced':
        return 'check-circle';
      case 'pending':
        return 'clock-outline';
      case 'error':
        return 'alert-circle';
      default:
        return 'help-circle';
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <Image
          source={{ uri: listing.images[0] || 'https://picsum.photos/100/100' }}
          style={styles.thumbnail}
        />
        <View style={styles.details}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
              {listing.title}
            </Text>
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={openMenu}
                  style={styles.menuButton}
                />
              }
            >
              <Menu.Item onPress={handleEdit} leadingIcon="pencil" title="Edit" />
              <Menu.Item onPress={handleDelete} leadingIcon="delete" title="Delete" />
            </Menu>
          </View>
          <Text style={styles.price}>${listing.price.toFixed(2)}</Text>
          <Text style={styles.quantity}>Qty: {listing.quantity}</Text>
          <View style={styles.platformsContainer}>
            {listing.platforms.map((platform) => (
              <PlatformBadge key={platform} platform={platform} size="small" />
            ))}
          </View>
          <View style={styles.syncStatus}>
            <IconButton
              icon={getSyncStatusIcon()}
              size={16}
              iconColor={getSyncStatusColor()}
              style={styles.syncIcon}
            />
            <Text style={[styles.syncText, { color: getSyncStatusColor() }]}>
              {listing.syncStatus.charAt(0).toUpperCase() + listing.syncStatus.slice(1)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  menuButton: {
    margin: 0,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 4,
  },
  quantity: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  platformsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  syncIcon: {
    margin: 0,
    padding: 0,
  },
  syncText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: -4,
  },
});
