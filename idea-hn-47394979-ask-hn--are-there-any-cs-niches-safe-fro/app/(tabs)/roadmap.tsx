import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ROLES } from '../../constants/roles';
import { generateSkillRoadmap } from '../../lib/roadmap-generator';
import { getLatestScore, isPremiumUser, initDatabase } from '../../lib/database';
import { Roadmap } from '../../types';

export default function RoadmapScreen() {
  const [targetRole, setTargetRole] = useState('');
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [currentRole, setCurrentRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState(0);
  const router = useRouter();
  
  useEffect(() => {
    loadUserData();
  }, []);
  
  async function loadUserData() {
    await initDatabase();
    const latest = await getLatestScore();
    const premium = await isPremiumUser();
    setIsPremium(premium);
    
    if (latest) {
      setCurrentRole(latest.role);
      setCurrentSkills(latest.skills);
      setExperience(latest.experience);
    }
  }
  
  function handleGenerateRoadmap(role: string) {
    if (!currentRole) {
      router.push('/assessment');
      return;
    }
    
    setTargetRole(role);
    const generatedRoadmap = generateSkillRoadmap({
      currentRole,
      targetRole: role,
      currentSkills,
      experience
    });
    setRoadmap(generatedRoadmap);
  }
  
  function handleStartLearning(skillName: string) {
    const searchQuery = encodeURIComponent(`learn ${skillName} tutorial`);
    Linking.openURL(`https://www.google.com/search?q=${searchQuery}`);
  }
  
  if (!currentRole) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Build Your Skill Roadmap</Text>
        <Text style={styles.emptySubtitle}>
          Complete your career assessment first to get personalized skill recommendations
        </Text>
        <TouchableOpacity 
          style={styles.startButton}
          onPress={() => router.push('/assessment')}
        >
          <Text style={styles.startButtonText}>Start Assessment</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!roadmap) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Choose Your Target Role</Text>
        <Text style={styles.subtitle}>
          Select where you want to go, and we'll show you the skills to get there
        </Text>
        
        <View style={styles.rolesContainer}>
          {Object.entries(ROLES)
            .filter(([key]) => key !== currentRole)
            .map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={styles.roleCard}
                onPress={() => handleGenerateRoadmap(key)}
              >
                <Text style={styles.roleName}>{value.name}</Text>
                <Text style={styles.roleArrow}>→</Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    );
  }
  
  const visibleSkills = isPremium ? roadmap.skills : roadmap.skills.slice(0, 3);
  const hiddenCount = roadmap.skills.length - visibleSkills.length;
  
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => setRoadmap(null)}
      >
        <Text style={styles.backText}>← Change Target Role</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>Your Roadmap to {ROLES[targetRole]?.name}</Text>
      
      <View style={styles.timelineCard}>
        <Text style={styles.timelineLabel}>Total Learning Time</Text>
        <Text style={styles.timelineValue}>{roadmap.timeline} weeks</Text>
        <Text style={styles.timelineSubtext}>
          ~{Math.round(roadmap.timeline / 4)} months at 10 hours/week
        </Text>
      </View>
      
      <Text style={styles.sectionTitle}>Recommended Skills</Text>
      
      {visibleSkills.map((skill, index) => (
        <View key={index} style={styles.skillCard}>
          <View style={styles.skillHeader}>
            <Text style={styles.skillName}>{skill.skill}</Text>
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>{skill.priority}</Text>
            </View>
          </View>
          
          <View style={styles.skillMeta}>
            <Text style={styles.metaItem}>⏱️ {skill.estimatedWeeks} weeks</Text>
            <Text style={styles.metaItem}>🎯 Priority: {skill.priority}/100</Text>
          </View>
          
          <Text style={styles.skillReason}>{skill.reason}</Text>
          
          <TouchableOpacity 
            style={styles.learnButton}
            onPress={() => handleStartLearning(skill.skill)}
          >
            <Text style={styles.learnButtonText}>Start Learning</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      {!isPremium && hiddenCount > 0 && (
        <View style={styles.paywallCard}>
          <Text style={styles.paywallTitle}>Unlock {hiddenCount} More Skills</Text>
          <Text style={styles.paywallText}>
            Get your complete personalized roadmap with all recommended skills and learning resources
          </Text>
          <TouchableOpacity 
            style={styles.upgradeButton}
            onPress={() => router.push('/paywall')}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
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
  emptyContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#111827'
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600'
  },
  backButton: {
    marginBottom: 16
  },
  backText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827'
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24
  },
  rolesContainer: {
    gap: 12
  },
  roleCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  roleName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  roleArrow: {
    fontSize: 24,
    color: '#3b82f6'
  },
  timelineCard: {
    backgroundColor: '#3b82f6',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  timelineLabel: {
    fontSize: 14,
    color: '#bfdbfe',
    marginBottom: 8
  },
  timelineValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff'
  },
  timelineSubtext: {
    fontSize: 14,
    color: '#bfdbfe',
    marginTop: 4
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827'
  },
  skillCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  skillName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1
  },
  priorityBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  priorityText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  skillMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12
  },
  metaItem: {
    fontSize: 14,
    color: '#6b7280'
  },
  skillReason: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16
  },
  learnButton: {
    backgroundColor: '#3b82f6',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  learnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  paywallCard: {
    backgroundColor: '#8b5cf6',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40
  },
  paywallTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  paywallText: {
    fontSize: 14,
    color: '#e9d5ff',
    textAlign: 'center',
    marginBottom: 16
  },
  upgradeButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8
  },
  upgradeButtonText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600'
  }
});
