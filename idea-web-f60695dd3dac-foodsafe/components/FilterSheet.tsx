import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import Slider from '@react-native-community/slider';

interface FilterSheetProps {
  visible: boolean;
  filters: {
    minScore: number;
    maxScore: number;
    allergyFriendly: boolean;
    recentInspections: boolean;
    zeroCriticalViolations: boolean;
  };
  onApply: (filters: FilterSheetProps['filters']) => void;
  onClose: () => void;
}

export default function FilterSheet({ visible, filters, onApply, onClose }: FilterSheetProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      minScore: 0,
      maxScore: 100,
      allergyFriendly: false,
      recentInspections: false,
      zeroCriticalViolations: false,
    });
  };

  const showPremiumPrompt = (featureName: string) => {
    Alert.alert(
      'Premium Feature',
      `${featureName} is available with SafeBite Pro. Upgrade to unlock advanced filters and more.`,
      [
        { text: 'Maybe Later', style: 'cancel' },
        { text: 'Upgrade to Pro', onPress: () => console.log('Navigate to upgrade') },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Safety Score Range</Text>
              <View style={styles.scoreRange}>
                <Text style={styles.scoreLabel}>{localFilters.minScore}</Text>
                <Text style={styles.scoreSeparator}>to</Text>
                <Text style={styles.scoreLabel}>{localFilters.maxScore}</Text>
              </View>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Min Score</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={5}
                  value={localFilters.minScore}
                  onValueChange={(value) =>
                    setLocalFilters({ ...localFilters, minScore: value })
                  }
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.border}
                  thumbTintColor={Colors.primary}
                />
              </View>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Max Score</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={5}
                  value={localFilters.maxScore}
                  onValueChange={(value) =>
                    setLocalFilters({ ...localFilters, maxScore: value })
                  }
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.border}
                  thumbTintColor={Colors.primary}
                />
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Premium Filters</Text>
              
              <TouchableOpacity
                style={styles.premiumOption}
                onPress={() => showPremiumPrompt('Allergy-Friendly Filter')}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>Allergy-Friendly Certified</Text>
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.optionDescription}>
                  Restaurants with verified allergy protocols
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.premiumOption}
                onPress={() => showPremiumPrompt('Recent Inspections Filter')}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>Recent Inspections Only</Text>
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.optionDescription}>
                  Inspected within the last 30 days
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.premiumOption}
                onPress={() => showPremiumPrompt('Zero Critical Violations Filter')}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionLabel}>Zero Critical Violations</Text>
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>PRO</Text>
                  </View>
                </View>
                <Text style={styles.optionDescription}>
                  No critical health violations found
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.7}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  scoreRange: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  scoreSeparator: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginHorizontal: 12,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  premiumOption: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  premiumBadge: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.background,
  },
  optionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  applyButton: {
    flex: 2,
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
});
