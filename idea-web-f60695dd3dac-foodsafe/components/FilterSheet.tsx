import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Switch } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    minScore: number;
    maxScore: number;
    recentInspection: boolean;
    noViolations: boolean;
    allergyFriendly: boolean;
  };
  onFilterChange: (filters: FilterSheetProps['filters']) => void;
  isPremium: boolean;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  onClose,
  filters,
  onFilterChange,
  isPremium,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      minScore: 0,
      maxScore: 100,
      recentInspection: false,
      noViolations: false,
      allergyFriendly: false,
    });
  };

  const handleScoreChange = (min: number, max: number) => {
    setLocalFilters(prev => ({
      ...prev,
      minScore: min,
      maxScore: max,
    }));
  };

  const handleToggle = (filter: keyof typeof localFilters) => {
    if (filter === 'allergyFriendly' && !isPremium) {
      // Show premium prompt for allergyFriendly filter
      return;
    }

    setLocalFilters(prev => ({
      ...prev,
      [filter]: !prev[filter],
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Safety Score Range</Text>
              <View style={styles.scoreRangeContainer}>
                <Text style={styles.scoreRangeText}>Min: {localFilters.minScore}</Text>
                <Text style={styles.scoreRangeText}>Max: {localFilters.maxScore}</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={5}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.primary}
                value={localFilters.minScore}
                onValueChange={(value) => handleScoreChange(value, localFilters.maxScore)}
              />
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={5}
                minimumTrackTintColor={Colors.primary}
                maximumTrackTintColor={Colors.border}
                thumbTintColor={Colors.primary}
                value={localFilters.maxScore}
                onValueChange={(value) => handleScoreChange(localFilters.minScore, value)}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inspection Filters</Text>

              <View style={styles.filterOption}>
                <View style={styles.filterOptionContent}>
                  <Text style={styles.filterOptionText}>Recent Inspection (last 30 days)</Text>
                  <Switch
                    value={localFilters.recentInspection}
                    onValueChange={() => handleToggle('recentInspection')}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </View>

              <View style={styles.filterOption}>
                <View style={styles.filterOptionContent}>
                  <Text style={styles.filterOptionText}>No Violations</Text>
                  <Switch
                    value={localFilters.noViolations}
                    onValueChange={() => handleToggle('noViolations')}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                </View>
              </View>

              <View style={styles.filterOption}>
                <View style={styles.filterOptionContent}>
                  <Text style={styles.filterOptionText}>Allergy-Friendly</Text>
                  {!isPremium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumBadgeText}>Pro</Text>
                    </View>
                  )}
                  <Switch
                    value={localFilters.allergyFriendly}
                    onValueChange={() => handleToggle('allergyFriendly')}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor={Colors.white}
                    disabled={!isPremium}
                  />
                </View>
                {!isPremium && (
                  <Text style={styles.premiumHint}>
                    Upgrade to SafeBite Pro to use this filter
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  scoreRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreRangeText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  slider: {
    marginVertical: 8,
  },
  filterOption: {
    marginBottom: 16,
  },
  filterOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterOptionText: {
    fontSize: 16,
    color: Colors.text,
  },
  premiumBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  premiumBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  premiumHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetButtonText: {
    color: Colors.text,
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  applyButtonText: {
    color: Colors.white,
    fontSize: 16,
  },
});
