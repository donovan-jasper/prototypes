import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import CategoryBadge from './CategoryBadge';
import { upvoteIdea, downvoteIdea, getUserVote } from '../lib/votes';

export default function SparkCard({ idea }) {
  const router = useRouter();
  const [upvotes, setUpvotes] = useState(idea.upvotes || 0);
  const [downvotes, setDownvotes] = useState(idea.downvotes || 0);
  const [userVote, setUserVote] = useState(null);
  const userId = 1; // Mock user ID

  useEffect(() => {
    const fetchUserVote = async () => {
      const vote = await getUserVote(idea.id, userId);
      setUserVote(vote);
    };
    fetchUserVote();
  }, [idea.id]);

  const handleUpvote = async (e) => {
    e.stopPropagation();
    
    // Optimistic update
    if (userVote === 'upvote') {
      setUpvotes(upvotes - 1);
      setUserVote(null);
    } else if (userVote === 'downvote') {
      setUpvotes(upvotes + 1);
      setDownvotes(downvotes - 1);
      setUserVote('upvote');
    } else {
      setUpvotes(upvotes + 1);
      setUserVote('upvote');
    }

    try {
      await upvoteIdea(idea.id, userId);
    } catch (error) {
      // Revert on error
      setUpvotes(idea.upvotes || 0);
      setDownvotes(idea.downvotes || 0);
      const vote = await getUserVote(idea.id, userId);
      setUserVote(vote);
    }
  };

  const handleDownvote = async (e) => {
    e.stopPropagation();
    
    // Optimistic update
    if (userVote === 'downvote') {
      setDownvotes(downvotes - 1);
      setUserVote(null);
    } else if (userVote === 'upvote') {
      setDownvotes(downvotes + 1);
      setUpvotes(upvotes - 1);
      setUserVote('downvote');
    } else {
      setDownvotes(downvotes + 1);
      setUserVote('downvote');
    }

    try {
      await downvoteIdea(idea.id, userId);
    } catch (error) {
      // Revert on error
      setUpvotes(idea.upvotes || 0);
      setDownvotes(idea.downvotes || 0);
      const vote = await getUserVote(idea.id, userId);
      setUserVote(vote);
    }
  };

  return (
    <TouchableOpacity onPress={() => router.push(`/idea/${idea.id}`)}>
      <View style={styles.card}>
        <Text style={styles.title}>{idea.title}</Text>
        <Text style={styles.description} numberOfLines={3}>{idea.description}</Text>
        <View style={styles.footer}>
          <CategoryBadge category={idea.category} />
          <View style={styles.voteContainer}>
            <TouchableOpacity onPress={handleUpvote} style={styles.voteButton}>
              <MaterialIcons 
                name="thumb-up" 
                size={20} 
                color={userVote === 'upvote' ? '#4285F4' : '#666'} 
              />
              <Text style={[styles.voteText, userVote === 'upvote' && styles.activeVote]}>
                {upvotes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDownvote} style={styles.voteButton}>
              <MaterialIcons 
                name="thumb-down" 
                size={20} 
                color={userVote === 'downvote' ? '#EA4335' : '#666'} 
              />
              <Text style={[styles.voteText, userVote === 'downvote' && styles.activeVote]}>
                {downvotes}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    marginVertical: 5,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  voteText: {
    fontSize: 14,
    color: '#666',
  },
  activeVote: {
    fontWeight: 'bold',
    color: '#000',
  },
});
