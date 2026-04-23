import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Chip, Avatar, Divider, Switch, Portal, Dialog, Provider } from 'react-native-paper';
import { getUserProfile, updateUserProfile, addSkill, removeSkill, addPreference, removePreference } from '../../lib/profile';
import { useAuth } from '../../context/auth';
import { Skill, Preference } from '../../lib/types';

const ProfileScreen = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState(3);
  const [newPreference, setNewPreference] = useState('');
  const [collabOptIn, setCollabOptIn] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogType, setDialogType] = useState<'skill' | 'preference'>('skill');

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const userProfile = await getUserProfile(user.id);
          setProfile(userProfile);
          setCollabOptIn(userProfile.preferences.some(p => p.preference_type === 'collab_opt_in'));
          setLoading(false);
        } catch (error) {
          console.error('Error fetching profile:', error);
          Alert.alert('Error', 'Failed to load profile');
        }
      }
    };

    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      await updateUserProfile(profile.user);
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;

    try {
      const skill: Skill = {
        id: Date.now(), // Temporary ID
        user_id: user.id,
        skill_name: newSkill.trim(),
        proficiency: newSkillProficiency
      };

      await addSkill(skill);
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setNewSkill('');
      setNewSkillProficiency(3);
      setDialogVisible(false);
    } catch (error) {
      console.error('Error adding skill:', error);
      Alert.alert('Error', 'Failed to add skill');
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    try {
      await removeSkill(skillId);
      setProfile(prev => ({
        ...prev,
        skills: prev.skills.filter(s => s.id !== skillId)
      }));
    } catch (error) {
      console.error('Error removing skill:', error);
      Alert.alert('Error', 'Failed to remove skill');
    }
  };

  const handleAddPreference = async () => {
    if (!newPreference.trim()) return;

    try {
      const preference: Preference = {
        id: Date.now(), // Temporary ID
        user_id: user.id,
        preference_type: 'interest',
        preference_value: newPreference.trim()
      };

      await addPreference(preference);
      setProfile(prev => ({
        ...prev,
        preferences: [...prev.preferences, preference]
      }));
      setNewPreference('');
      setDialogVisible(false);
    } catch (error) {
      console.error('Error adding preference:', error);
      Alert.alert('Error', 'Failed to add preference');
    }
  };

  const handleRemovePreference = async (preferenceId: number) => {
    try {
      await removePreference(preferenceId);
      setProfile(prev => ({
        ...prev,
        preferences: prev.preferences.filter(p => p.id !== preferenceId)
      }));
    } catch (error) {
      console.error('Error removing preference:', error);
      Alert.alert('Error', 'Failed to remove preference');
    }
  };

  const handleCollabOptInChange = async (value: boolean) => {
    setCollabOptIn(value);

    try {
      if (value) {
        const preference: Preference = {
          id: Date.now(),
          user_id: user.id,
          preference_type: 'collab_opt_in',
          preference_value: 'true'
        };
        await addPreference(preference);
      } else {
        const collabPref = profile.preferences.find(p => p.preference_type === 'collab_opt_in');
        if (collabPref) {
          await removePreference(collabPref.id);
        }
      }

      setProfile(prev => ({
        ...prev,
        preferences: value
          ? [...prev.preferences, { id: Date.now(), user_id: user.id, preference_type: 'collab_opt_in', preference_value: 'true' }]
          : prev.preferences.filter(p => p.preference_type !== 'collab_opt_in')
      }));
    } catch (error) {
      console.error('Error updating collaboration preference:', error);
      Alert.alert('Error', 'Failed to update collaboration preference');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No profile data available</Text>
      </View>
    );
  }

  return (
    <Provider>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Avatar.Text size={64} label={profile.user.username.substring(0, 2).toUpperCase()} />
          <View style={styles.headerText}>
            <Text variant="headlineMedium">{profile.user.username}</Text>
            <Text variant="bodyMedium">Spark Score: {profile.sparkScore}</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">About Me</Text>
            {editMode ? (
              <Button mode="text" onPress={handleSaveProfile}>
                Save
              </Button>
            ) : (
              <Button mode="text" onPress={() => setEditMode(true)}>
                Edit
              </Button>
            )}
          </View>

          {editMode ? (
            <TextInput
              label="Location"
              value={profile.user.location || ''}
              onChangeText={(text) => setProfile(prev => ({
                ...prev,
                user: { ...prev.user, location: text }
              }))}
              style={styles.input}
            />
          ) : (
            <Text variant="bodyMedium">{profile.user.location || 'No location set'}</Text>
          )}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">Skills</Text>
            <Button mode="text" onPress={() => {
              setDialogType('skill');
              setDialogVisible(true);
            }}>
              Add
            </Button>
          </View>

          <View style={styles.chipContainer}>
            {profile.skills.map(skill => (
              <Chip
                key={skill.id}
                onClose={() => handleRemoveSkill(skill.id)}
                style={styles.chip}
              >
                {skill.skill_name} ({skill.proficiency}/5)
              </Chip>
            ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">Interests</Text>
            <Button mode="text" onPress={() => {
              setDialogType('preference');
              setDialogVisible(true);
            }}>
              Add
            </Button>
          </View>

          <View style={styles.chipContainer}>
            {profile.preferences
              .filter(p => p.preference_type === 'interest')
              .map(preference => (
                <Chip
                  key={preference.id}
                  onClose={() => handleRemovePreference(preference.id)}
                  style={styles.chip}
                >
                  {preference.preference_value}
                </Chip>
              ))}
          </View>
        </View>

        <Divider style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium">Collaboration Preferences</Text>
          </View>

          <View style={styles.switchContainer}>
            <Text>Opt-in to find collaborators</Text>
            <Switch
              value={collabOptIn}
              onValueChange={handleCollabOptInChange}
            />
          </View>
        </View>

        <Portal>
          <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
            <Dialog.Title>
              {dialogType === 'skill' ? 'Add Skill' : 'Add Interest'}
            </Dialog.Title>
            <Dialog.Content>
              {dialogType === 'skill' ? (
                <>
                  <TextInput
                    label="Skill Name"
                    value={newSkill}
                    onChangeText={setNewSkill}
                    style={styles.input}
                  />
                  <TextInput
                    label="Proficiency (1-5)"
                    value={newSkillProficiency.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text);
                      if (!isNaN(num) && num >= 1 && num <= 5) {
                        setNewSkillProficiency(num);
                      }
                    }}
                    keyboardType="numeric"
                    style={styles.input}
                  />
                </>
              ) : (
                <TextInput
                  label="Interest"
                  value={newPreference}
                  onChangeText={setNewPreference}
                  style={styles.input}
                />
              )}
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
              <Button onPress={dialogType === 'skill' ? handleAddSkill : handleAddPreference}>
                Add
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </ScrollView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    marginLeft: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

export default ProfileScreen;
