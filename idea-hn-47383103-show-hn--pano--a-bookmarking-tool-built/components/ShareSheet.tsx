import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { shareShelf, getShelfViewCount } from '../lib/utils/share';

interface ShareSheetProps {
  shelfId: number;
  shelfName: string;
  bottomSheetRef: React.RefObject<BottomSheetModal>;
}

export default function ShareSheet({ shelfId, shelfName, bottomSheetRef }: ShareSheetProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [viewCount, setViewCount] = useState<number | null>(null);

  const handleShare = async () => {
    try {
      setLoading(true);
      await shareShelf(shelfId, shelfName);
      bottomSheetRef.current?.dismiss();
    } catch (error) {
      console.error('Error sharing shelf:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCount = async () => {
    try {
      setLoading(true);
      const count = await getShelfViewCount(shelfId);
      setViewCount(count);
    } catch (error) {
      console.error('Error getting view count:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.onBackground }]}>Share Shelf</Text>

      <TouchableOpacity
        style={[styles.option, { backgroundColor: theme.colors.surface }]}
        onPress={handleShare}
        disabled={loading}
      >
        <MaterialIcons name="share" size={24} color={theme.colors.primary} />
        <Text style={[styles.optionText, { color: theme.colors.onSurface }]}>Share via Email</Text>
        {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, { backgroundColor: theme.colors.surface }]}
        onPress={handleViewCount}
        disabled={loading}
      >
        <MaterialIcons name="visibility" size={24} color={theme.colors.primary} />
        <Text style={[styles.optionText, { color: theme.colors.onSurface }]}>
          {viewCount !== null ? `View Count: ${viewCount}` : 'View Count'}
        </Text>
        {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
      </TouchableOpacity>

      <Text style={[styles.shareLink, { color: theme.colors.onBackground }]}>
        Share link: https://shelflife.app/share/{shelfId}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionText: {
    marginLeft: 12,
    fontSize: 16,
    flex: 1,
  },
  shareLink: {
    marginTop: 16,
    fontSize: 14,
    textAlign: 'center',
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
});
