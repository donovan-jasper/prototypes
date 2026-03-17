import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Button, FlatList, TouchableOpacity, Text, ScrollView, Switch } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useModes } from '../hooks/useModes';
import { useApps } from '../hooks/useApps';
import { useStore } from '../store/appStore';
import DateTimePicker from '@react-native-community/datetimepicker';

const PRESET_COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39'
];

const MODE_ICONS = [
  { name: 'work', icon: 'work' },
  { name: 'home', icon: 'home' },
  { name: 'fitness', icon: 'fitness-center' },
  { name: 'travel', icon: 'flight' },
  { name: 'focus', icon: 'center-focus-strong' },
  { name: 'school', icon: 'school' },
  { name: 'shopping', icon: 'shopping-cart' },
  { name: 'music', icon: 'music-note' },
  { name: 'camera', icon: 'camera-alt' },
  { name: 'restaurant', icon: 'restaurant' },
  { name: 'local-cafe', icon: 'local-cafe' },
  { name: 'directions-car', icon: 'directions-car' },
  { name: 'beach', icon: 'beach-access' },
  { name: 'nightlife', icon: 'local-bar' },
  { name: 'pets', icon: 'pets' },
  { name: 'sports', icon: 'sports-basketball' },
  { name: 'gaming', icon: 'sports-esports' },
  { name: 'book', icon: 'menu-book' },
  { name: 'medical', icon: 'local-hospital' },
  { name: 'star', icon: 'star' }
];

const ModeEditorModal = ({ navigation, route }) => {
  const existingMode = route?.params?.mode;
  const [name, setName] = useState(existingMode?.name || '');
  const [selectedColor, setSelectedColor] = useState(existingMode?.color || PRESET_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(existingMode?.icon || 'work');
  const [selectedApps, setSelectedApps] = useState(existingMode?.appIds || []);
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(existingMode?.triggers?.time?.enabled || false);
  const [startTime, setStartTime] = useState(
    existingMode?.triggers?.time?.start 
      ? new Date(`2000-01-01T${existingMode.triggers.time.start}:00`)
      : new Date(2000, 0, 1, 9, 0)
  );
  const [endTime, setEndTime] = useState(
    existingMode?.triggers?.time?.end
      ? new Date(`2000-01-01T${existingMode.triggers.time.end}:00`)
      : new Date(2000, 0, 1, 17, 0)
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [autoSwitchExpanded, setAutoSwitchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { addMode } = useModes();
  const { apps } = useApps();
  const { isPremium, modes } = useStore();

  const canSave = name.trim().length > 0 && selectedApps.length > 0;

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    const newMode = {
      id: existingMode?.id || Date.now().toString(),
      name: name.trim(),
      appIds: selectedApps,
      color: selectedColor,
      icon: selectedIcon,
      triggers: autoSwitchEnabled ? {
        time: {
          enabled: true,
          start: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`,
          end: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
        }
      } : {}
    };
    
    addMode(newMode);
    navigation.goBack();
  };

  const toggleAppSelection = (packageName) => {
    if (selectedApps.includes(packageName)) {
      setSelectedApps(selectedApps.filter(p => p !== packageName));
    } else {
      setSelectedApps([...selectedApps, packageName]);
    }
  };

  const filteredApps = apps.filter(app => 
    app.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Mode Preview Card */}
      <View style={[styles.previewCard, { backgroundColor: selectedColor }]}>
        <MaterialIcons name={selectedIcon} size={48} color="white" />
        <Text style={styles.previewName}>{name || 'Mode Name'}</Text>
        <Text style={styles.previewAppCount}>{selectedApps.length} apps</Text>
      </View>

      {/* Mode Name Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Work, Focus, Gym"
          value={name}
          onChangeText={setName}
          maxLength={30}
        />
      </View>

      {/* Color Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Color</Text>
        <View style={styles.colorGrid}>
          {PRESET_COLORS.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorOption,
                { backgroundColor: color },
                selectedColor === color && styles.selectedColor
              ]}
              onPress={() => setSelectedColor(color)}
            >
              {selectedColor === color && (
                <MaterialIcons name="check" size={24} color="white" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Icon Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Icon</Text>
        <View style={styles.iconGrid}>
          {MODE_ICONS.map(({ name: iconName, icon }) => (
            <TouchableOpacity
              key={iconName}
              style={[
                styles.iconOption,
                selectedIcon === icon && styles.selectedIcon
              ]}
              onPress={() => setSelectedIcon(icon)}
            >
              <MaterialIcons 
                name={icon} 
                size={32} 
                color={selectedIcon === icon ? selectedColor : '#666'} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Auto-Switch Section */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => setAutoSwitchExpanded(!autoSwitchExpanded)}
        >
          <View style={styles.sectionHeaderLeft}>
            <Text style={styles.sectionTitle}>Auto-Switch</Text>
            {!isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            )}
          </View>
          <MaterialIcons 
            name={autoSwitchExpanded ? 'expand-less' : 'expand-more'} 
            size={24} 
            color="#666" 
          />
        </TouchableOpacity>

        {autoSwitchExpanded && (
          <View style={styles.autoSwitchContent}>
            {!isPremium ? (
              <View style={styles.premiumUpsell}>
                <MaterialIcons name="lock" size={32} color="#666" />
                <Text style={styles.premiumUpsellText}>
                  Upgrade to Premium to enable time-based auto-switching
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Enable time-based switching</Text>
                  <Switch
                    value={autoSwitchEnabled}
                    onValueChange={setAutoSwitchEnabled}
                  />
                </View>

                {autoSwitchEnabled && (
                  <>
                    <View style={styles.timePickerRow}>
                      <Text style={styles.timeLabel}>Start Time</Text>
                      <TouchableOpacity 
                        style={styles.timeButton}
                        onPress={() => setShowStartPicker(true)}
                      >
                        <Text style={styles.timeButtonText}>{formatTime(startTime)}</Text>
                        <MaterialIcons name="access-time" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>

                    {showStartPicker && (
                      <DateTimePicker
                        value={startTime}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowStartPicker(false);
                          if (selectedDate) {
                            setStartTime(selectedDate);
                          }
                        }}
                      />
                    )}

                    <View style={styles.timePickerRow}>
                      <Text style={styles.timeLabel}>End Time</Text>
                      <TouchableOpacity 
                        style={styles.timeButton}
                        onPress={() => setShowEndPicker(true)}
                      >
                        <Text style={styles.timeButtonText}>{formatTime(endTime)}</Text>
                        <MaterialIcons name="access-time" size={20} color="#666" />
                      </TouchableOpacity>
                    </View>

                    {showEndPicker && (
                      <DateTimePicker
                        value={endTime}
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowEndPicker(false);
                          if (selectedDate) {
                            setEndTime(selectedDate);
                          }
                        }}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </View>
        )}
      </View>

      {/* App Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apps ({selectedApps.length} selected)</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search apps..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.appList}>
          {filteredApps.map(app => (
            <TouchableOpacity
              key={app.packageName}
              style={[
                styles.appItem,
                selectedApps.includes(app.packageName) && styles.selectedAppItem
              ]}
              onPress={() => toggleAppSelection(app.packageName)}
            >
              <View style={styles.appItemLeft}>
                {app.icon && (
                  <View style={styles.appIconContainer}>
                    <Text style={styles.appIconPlaceholder}>📱</Text>
                  </View>
                )}
                <Text style={styles.appLabel}>{app.label}</Text>
              </View>
              {selectedApps.includes(app.packageName) && (
                <MaterialIcons name="check-circle" size={24} color={selectedColor} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: selectedColor },
            !canSave && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={styles.saveButtonText}>
            {existingMode ? 'Update Mode' : 'Create Mode'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  previewCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  previewName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  previewAppCount: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    height: 48,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#333',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  selectedIcon: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  autoSwitchContent: {
    marginTop: 16,
  },
  premiumUpsell: {
    alignItems: 'center',
    padding: 24,
  },
  premiumUpsellText: {
    marginTop: 12,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
  timePickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  timeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  searchInput: {
    height: 40,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  appList: {
    maxHeight: 300,
  },
  appItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedAppItem: {
    backgroundColor: '#f0f8ff',
  },
  appItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  appIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconPlaceholder: {
    fontSize: 24,
  },
  appLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  saveButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    elevation: 0,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ModeEditorModal;
