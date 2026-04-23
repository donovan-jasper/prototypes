import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SKILLS, ROLES } from '../constants/skills';
import { generateSkillRoadmap } from '../lib/roadmap-generator';
import { calculateAIResistanceScore } from '../lib/scoring';
import { isPremiumUser } from '../lib/database';
import { Roadmap } from '../types';
import { LineChart } from 'react-native-chart-kit';

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
        currentRole: 'current-role',
        targetRole: scenario.targetRole,
        currentSkills: scenario.skillsToLearn,
        experience: scenario.experience
      });

      newRoadmaps[scenario.id] = roadmap;
    });

    setRoadmaps(newRoadmaps);
  }

  function calculateSalaryPotential(role: string): number {
    const baseSalaries: Record<string, number> = {
      'software-engineer': 100000,
      'engineering-manager': 140000,
      'product-manager': 130000,
      'senior-engineer': 120000,
      'designer': 110000,
      'data-scientist': 125000,
      'devops-engineer': 130000,
      'frontend-developer': 105000,
      'backend-developer': 115000,
      'tech-lead': 150000,
      'qa-engineer': 95000
    };
    return baseSalaries[role] || 110000;
  }

  function calculateJobSecurity(role: string): number {
    const securityScores: Record<string, number> = {
      'software-engineer': 60,
      'engineering-manager': 85,
      'product-manager': 75,
      'senior-engineer': 70,
      'designer': 70,
      'data-scientist': 65,
      'devops-engineer': 65,
      'frontend-developer': 55,
      'backend-developer': 60,
      'tech-lead': 80,
      'qa-engineer': 50
    };
    return securityScores[role] || 65;
  }

  function renderScenarioCard(scenario: Scenario) {
    const roadmap = roadmaps[scenario.id];
    const score = calculateAIResistanceScore({
      role: scenario.targetRole as any,
      skills: scenario.skillsToLearn,
      experience: scenario.experience,
      timestamp: Date.now()
    });

    return (
      <View key={scenario.id} style={styles.scenarioCard}>
        <Text style={styles.cardTitle}>{ROLES[scenario.targetRole]?.name || scenario.targetRole}</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{score}</Text>
            <Text style={styles.metricLabel}>AI Resistance</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>${calculateSalaryPotential(scenario.targetRole).toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Salary Potential</Text>
          </View>

          <View style={styles.metricBox}>
            <Text style={styles.metricValue}>{calculateJobSecurity(scenario.targetRole)}%</Text>
            <Text style={styles.metricLabel}>Job Security</Text>
          </View>
        </View>

        {roadmap && (
          <>
            <Text style={styles.sectionTitle}>Recommended Skills</Text>
            <View style={styles.skillsList}>
              {roadmap.skills.slice(0, 5).map((skill, index) => (
                <View key={index} style={styles.skillItem}>
                  <Text style={styles.skillName}>{skill.skill}</Text>
                  <Text style={styles.skillTime}>{skill.estimatedWeeks} weeks</Text>
                </View>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Learning Timeline</Text>
            <LineChart
              data={{
                labels: roadmap.skills.map(s => s.skill.substring(0, 3)),
                datasets: [{
                  data: roadmap.skills.map(s => s.estimatedWeeks),
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  strokeWidth: 2
                }]
              }}
              width={Dimensions.get('window').width - 40}
              height={220}
              yAxisLabel=""
              yAxisSuffix="w"
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#3b82f6'
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </>
        )}
      </View>
    );
  }

  if (!isPremium) {
    return null;
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
        <TouchableOpacity
          style={styles.generateButton}
          onPress={generateRoadmaps}
        >
          <Text style={styles.generateButtonText}>Generate Comparison</Text>
        </TouchableOpacity>
      )}

      {scenarios.map(renderScenarioCard)}
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
  scenarioBuilder: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1f2937'
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#374151'
  },
  picker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  pickerOption: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  selected: {
    backgroundColor: '#e0f2fe',
    borderColor: '#3b82f6'
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20
  },
  skillChip: {
    padding: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  skillText: {
    fontSize: 14
  },
  experienceSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  yearButton: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    width: '15%'
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
  generateButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20
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
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937'
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'
  },
  skillsList: {
    marginBottom: 20
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  skillName: {
    fontSize: 16,
    fontWeight: '500'
  },
  skillTime: {
    fontSize: 14,
    color: '#6b7280'
  }
});
