import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { generateSkillRoadmap } from '../lib/roadmap-generator';
import { calculateAIResistanceScore, getScoreCategory } from '../lib/scoring';
import { isPremiumUser } from '../lib/database';
import { ROLES, SKILLS } from '../constants/skills';
import { Roadmap } from '../types';

interface Scenario {
  id: string;
  role: string;
  skills: string[];
  experience: number;
  roadmap?: Roadmap;
}

export default function ScenarioPlannerScreen() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isPremium, setIsPremium] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<Scenario>({
    id: Date.now().toString(),
    role: '',
    skills: [],
    experience: 0
  });
  const router = useRouter();

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  async function checkPremiumStatus() {
    const premium = await isPremiumUser();
    setIsPremium(premium);
  }

  function addScenario() {
    if (scenarios.length >= 2 && !isPremium) {
      router.push('/paywall');
      return;
    }

    const newScenario = {
      ...currentScenario,
      roadmap: generateSkillRoadmap({
        currentRole: currentScenario.role,
        targetRole: currentScenario.role,
        currentSkills: currentScenario.skills,
        experience: currentScenario.experience
      })
    };

    setScenarios([...scenarios, newScenario]);
    setCurrentScenario({
      id: Date.now().toString(),
      role: '',
      skills: [],
      experience: 0
    });
  }

  function removeScenario(id: string) {
    setScenarios(scenarios.filter(s => s.id !== id));
  }

  function toggleSkill(skillId: string) {
    setCurrentScenario(prev => {
      const skills = prev.skills.includes(skillId)
        ? prev.skills.filter(id => id !== skillId)
        : [...prev.skills, skillId];
      return { ...prev, skills };
    });
  }

  function renderScenario(scenario: Scenario) {
    if (!scenario.roadmap) return null;

    const score = calculateAIResistanceScore({
      role: scenario.role as any,
      skills: scenario.skills,
      experience: scenario.experience,
      timestamp: Date.now()
    });
    const category = getScoreCategory(score);

    return (
      <View style={styles.scenarioCard}>
        <View style={styles.scenarioHeader}>
          <Text style={styles.scenarioTitle}>{ROLES[scenario.role]?.name || scenario.role}</Text>
          <TouchableOpacity onPress={() => removeScenario(scenario.id)}>
            <Text style={styles.removeButton}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsContainer}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{score}</Text>
            <Text style={styles.metricLabel}>AI Resistance</Text>
            <Text style={[styles.metricCategory, { color: category === 'high' ? '#10b981' : category === 'medium' ? '#f59e0b' : '#ef4444' }]}>
              {category}
            </Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{scenario.roadmap.timeline} weeks</Text>
            <Text style={styles.metricLabel}>Learning Time</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>Moderate</Text>
            <Text style={styles.metricLabel}>Career Outlook</Text>
          </View>
        </View>

        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Key Skills to Develop</Text>
          {scenario.roadmap.skills.map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <Text style={styles.skillName}>{skill.skill}</Text>
              <Text style={styles.skillTime}>{skill.estimatedWeeks} weeks</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Career Scenario Planner</Text>
      <Text style={styles.subtitle}>Compare multiple career paths side-by-side</Text>

      {scenarios.length > 0 && (
        <View style={styles.comparisonContainer}>
          {scenarios.map(scenario => (
            <View key={scenario.id} style={styles.scenarioColumn}>
              {renderScenario(scenario)}
            </View>
          ))}
        </View>
      )}

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Add New Scenario</Text>

        <Text style={styles.label}>Target Role</Text>
        <View style={styles.roleSelector}>
          {Object.entries(ROLES).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={[styles.roleOption, currentScenario.role === key && styles.selectedRole]}
              onPress={() => setCurrentScenario({...currentScenario, role: key})}
            >
              <Text>{value.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Current Skills</Text>
        <View style={styles.skillsSelector}>
          {SKILLS.map(skill => (
            <TouchableOpacity
              key={skill.id}
              style={[styles.skillOption, currentScenario.skills.includes(skill.id) && styles.selectedSkill]}
              onPress={() => toggleSkill(skill.id)}
            >
              <Text>{skill.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Years of Experience</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={currentScenario.experience.toString()}
          onChangeText={(text) => setCurrentScenario({...currentScenario, experience: parseInt(text) || 0})}
        />

        <TouchableOpacity
          style={[styles.addButton, (!currentScenario.role || currentScenario.skills.length === 0) && styles.disabledButton]}
          onPress={addScenario}
          disabled={!currentScenario.role || currentScenario.skills.length === 0}
        >
          <Text style={styles.addButtonText}>Add Scenario</Text>
        </TouchableOpacity>
      </View>

      {!isPremium && scenarios.length >= 2 && (
        <View style={styles.premiumNotice}>
          <Text style={styles.premiumText}>Add unlimited scenarios with Premium</Text>
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.premiumButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      )}
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
    color: '#1f2937'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24
  },
  comparisonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32
  },
  scenarioColumn: {
    flex: 1,
    marginHorizontal: 4
  },
  scenarioCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  scenarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  scenarioTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937'
  },
  removeButton: {
    fontSize: 20,
    color: '#ef4444',
    fontWeight: 'bold'
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  metricBox: {
    alignItems: 'center',
    flex: 1
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4
  },
  metricCategory: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  },
  skillsSection: {
    marginTop: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937'
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  skillName: {
    fontSize: 14,
    color: '#374151'
  },
  skillTime: {
    fontSize: 14,
    color: '#6b7280'
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937'
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    color: '#374151'
  },
  roleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  roleOption: {
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8
  },
  selectedRole: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 1
  },
  skillsSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  skillOption: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 6
  },
  selectedSkill: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    borderWidth: 1
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#9ca3af'
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  premiumNotice: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center'
  },
  premiumText: {
    fontSize: 16,
    color: '#92400e',
    marginBottom: 12,
    textAlign: 'center'
  },
  premiumButton: {
    backgroundColor: '#f59e0b',
    padding: 12,
    borderRadius: 8,
    width: '100%'
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  }
});
