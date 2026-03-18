import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SKILLS, ROLES } from '../constants/skills';
import { saveAssessment, initDatabase } from '../lib/database';
import { calculateAIResistanceScore } from '../lib/scoring';

export default function AssessmentScreen() {
  const [role, setRole] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState('0');
  const router = useRouter();
  
  async function submitAssessment() {
    const experienceNum = parseInt(experience) || 0;
    const score = calculateAIResistanceScore({
      role: role as any,
      skills: selectedSkills,
      experience: experienceNum,
      timestamp: Date.now()
    });
    
    await initDatabase();
    await saveAssessment({
      role: role as any,
      skills: selectedSkills,
      experience: experienceNum,
      score,
      timestamp: Date.now()
    });
    
    router.replace('/(tabs)/score');
  }
  
  const isValid = role && selectedSkills.length >= 5 && selectedSkills.length <= 10 && parseInt(experience) >= 0;
  
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Career Assessment</Text>
      <Text style={styles.subtitle}>Help us understand your current position</Text>
      
      <Text style={styles.label}>Current Role</Text>
      <View style={styles.optionsContainer}>
        {Object.entries(ROLES).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[styles.option, role === key && styles.selected]}
            onPress={() => setRole(key)}
          >
            <Text style={[styles.optionText, role === key && styles.selectedText]}>
              {value.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.label}>Your Skills (select 5-10)</Text>
      <Text style={styles.helperText}>
        Selected: {selectedSkills.length}/10
      </Text>
      <View style={styles.optionsContainer}>
        {SKILLS.map(skill => (
          <TouchableOpacity
            key={skill.id}
            style={[styles.skillOption, selectedSkills.includes(skill.id) && styles.selected]}
            onPress={() => {
              setSelectedSkills(prev => {
                if (prev.includes(skill.id)) {
                  return prev.filter(s => s !== skill.id);
                } else if (prev.length < 10) {
                  return [...prev, skill.id];
                }
                return prev;
              });
            }}
          >
            <Text style={[styles.optionText, selectedSkills.includes(skill.id) && styles.selectedText]}>
              {skill.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <Text style={styles.label}>Years of Experience</Text>
      <TextInput
        style={styles.input}
        value={experience}
        onChangeText={setExperience}
        keyboardType="number-pad"
        placeholder="Enter years"
        placeholderTextColor="#9ca3af"
      />
      
      <TouchableOpacity
        style={[styles.button, !isValid && styles.disabled]}
        onPress={submitAssessment}
        disabled={!isValid}
      >
        <Text style={styles.buttonText}>Get My Score</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    color: '#111827'
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8
  },
  optionsContainer: {
    gap: 8
  },
  option: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  skillOption: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  selected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff'
  },
  optionText: {
    fontSize: 16,
    color: '#374151'
  },
  selectedText: {
    color: '#3b82f6',
    fontWeight: '600'
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#111827'
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40
  },
  disabled: {
    backgroundColor: '#9ca3af'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  }
});
