import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { SKILLS, ROLES } from '../constants/skills';
import { generateSkillRoadmap } from '../lib/roadmap-generator';
import { calculateAIResistanceScore } from '../lib/scoring';
import { isPremiumUser } from '../lib/database';
import { Roadmap } from '../types';

interface Scenario {
  id: string;
  targetRole: string;
  skillsToLearn: string[];
  experience: number;
}

export default function ScenarioPlannerScreen() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<Scenario>({
    id: Date.now().toString(),
    targetRole: '',
    skillsToLearn: [],
    experience: 0
  });
  const [roadmaps, setRoadmaps] = useState<Record<string, Roadmap>>({});
  const [isPremium, setIsPremium] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  async function checkPremiumStatus() {
    const premium = await isPremiumUser();
    setIsPremium(premium);
    if (!premium) {
      router.replace('/paywall');
    }
  }

  function addScenario() {
    if (!currentScenario.targetRole) return;

    setScenarios([...scenarios, currentScenario]);
    setCurrentScenario({
      id: Date.now().toString(),
      targetRole: '',
      skillsToLearn: [],
      experience: 0
    });
  }

  function generateRoadmaps() {
    const newRoadmaps: Record<string, Roadmap> = {};

    scenarios.forEach(scenario => {
      const roadmap = generateSkillRoadmap({
        currentRole: 'current-role', // In real app, get from user profile
        targetRole: scenario.targetRole,
        currentSkills: scenario.skillsToLearn,
        experience: scenario.experience
      });

      newRoadmaps[scenario.id] = roadmap;
    });

    setRoadmaps(newRoadmaps);
  }

  function calculateSalaryPotential(role: string): number {
    // Simplified salary calculation based on role
    const baseSalaries: Record<string, number> = {
      'software-engineer': 100000,
      'engineering-manager': 140000,
      'product-manager': 130000,
      'senior-engineer': 120000
    };
    return baseSalaries[role] || 110000;
  }

  function calculateJobSecurity(role: string): number {
    // Simplified job security calculation based on role
    const securityScores: Record<string, number> = {
      'software-engineer': 60,
      'engineering-manager': 85,
      'product-manager': 75,
      'senior-engineer': 70
    };
    return securityScores[role] || 65;
  }

  if (!isPremium) {
    return null; // Will be redirected by checkPremiumStatus
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Career Scenario Planner</Text>
      <Text style={styles.subtitle}>Compare multiple career paths side-by-side</Text>

      <View style={styles.scenarioBuilder}>
        <Text style={styles.sectionTitle}>Add Career Scenario</Text>

        <Text style={styles.label}>Target Role</Text>
        <View style={styles.picker}>
          {Object.entries(ROLES).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={[styles.pickerOption, currentScenario.targetRole === key && styles.selected]}
              onPress={() => setCurrentScenario({...currentScenario, targetRole: key})}
            >
              <Text>{value.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Skills to Learn (select 3-5)</Text>
        <View style={styles.skillsGrid}>
          {SKILLS.slice(0, 12).map(skill => (
            <TouchableOpacity
              key={skill.id}
              style={[styles.skillChip, currentScenario.skillsToLearn.includes(skill.id) && styles.selected]}
              onPress={() => {
                setCurrentScenario(prev => ({
                  ...prev,
                  skillsToLearn: prev.skillsToLearn.includes(skill.id)
                    ? prev.skillsToLearn.filter(s => s !== skill.id)
                    : [...prev.skillsToLearn, skill.id]
                }));
              }}
            >
              <Text style={styles.skillText}>{skill.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Years of Experience</Text>
        <View style={styles.experienceSlider}>
          {[0, 1, 2, 3, 4, 5].map(year => (
            <TouchableOpacity
              key={year}
              style={[styles.yearButton, currentScenario.experience === year && styles.selected]}
              onPress={() => setCurrentScenario({...currentScenario, experience: year})}
            >
              <Text>{year}+</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.addButton, !currentScenario.targetRole && styles.disabled]}
          onPress={addScenario}
          disabled={!currentScenario.targetRole}
        >
          <Text style={styles.addButtonText}>Add Scenario</Text>
        </TouchableOpacity>
      </View>

      {scenarios.length > 0 && (
        <View style={styles.comparisonSection}>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateRoadmaps}
          >
            <Text style={styles.generateButtonText}>Generate Comparison</Text>
          </TouchableOpacity>

          {Object.entries(roadmaps).map(([scenarioId, roadmap]) => {
            const scenario = scenarios.find(s => s.id === scenarioId);
            if (!scenario) return null;

            const salary = calculateSalaryPotential(scenario.targetRole);
            const security = calculateJobSecurity(scenario.targetRole);

            return (
              <View key={scenarioId} style={styles.scenarioCard}>
                <Text style={styles.scenarioTitle}>{ROLES[scenario.targetRole as keyof typeof ROLES]?.name}</Text>

                <View style={styles.metricsRow}>
                  <View style={styles.metricBox}>
                    <Text style={styles.metricValue}>{security}%</Text>
                    <Text style={styles.metricLabel}>Job Security</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricValue}>{roadmap.timeline} weeks</Text>
                    <Text style={styles.metricLabel}>Learning Time</Text>
                  </View>

                  <View style={styles.metricBox}>
                    <Text style={styles.metricValue}>${salary.toLocaleString()}</Text>
                    <Text style={styles.metricLabel}>Salary Potential</Text>
                  </View>
                </View>

                <Text style={styles.recommendedSkills}>Recommended Skills:</Text>
                <View style={styles.skillList}>
                  {roadmap.skills.map((skill, index) => (
                    <View key={index} style={styles.skillItem}>
                      <Text style={styles.skillName}>{skill.skill}</Text>
                      <Text style={styles.skillTime}>{skill.estimatedWeeks} weeks</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
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
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24
  },
  scenarioBuilder: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  pickerOption: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16
  },
  skillChip: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  skillText: {
    fontSize: 14
  },
  experienceSlider: {
    flexDirection: 'row',
    marginBottom: 16
  },
  yearButton: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginRight: 8
  },
  addButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  disabled: {
    backgroundColor: '#9ca3af'
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  comparisonSection: {
    marginBottom: 32
  },
  generateButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  scenarioCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16
  },
  scenarioTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  metricBox: {
    alignItems: 'center',
    flex: 1
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280'
  },
  recommendedSkills: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12
  },
  skillList: {
    marginTop: 8
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  skillName: {
    fontSize: 16
  },
  skillTime: {
    fontSize: 16,
    color: '#6b7280'
  },
  selected: {
    backgroundColor: '#e0f2fe',
    borderColor: '#3b82f6',
    borderWidth: 1
  }
});
