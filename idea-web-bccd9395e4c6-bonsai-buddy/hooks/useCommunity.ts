import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

// Mock data for community posts
const mockPosts = [
  {
    id: '1',
    userId: 'plantlover123',
    plantId: '1',
    photoUri: 'https://images.unsplash.com/photo-1520412099551-62b6baf36e71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'My monstera is growing so big! #PlantPulse',
    likes: 42,
    liked: false,
    comments: [
      { userId: 'greenthumb', text: 'Wow, that looks amazing!' },
      { userId: 'leafy', text: 'When did you get it?' }
    ],
    createdAt: '2023-05-15T10:30:00Z'
  },
  {
    id: '2',
    userId: 'succulentfan',
    plantId: '2',
    photoUri: 'https://images.unsplash.com/photo-1587402092301-725e37c70fd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'My snake plant is thriving! #PlantCare',
    likes: 28,
    liked: false,
    comments: [
      { userId: 'plantmom', text: 'So happy for you!' }
    ],
    createdAt: '2023-05-14T08:15:00Z'
  },
  {
    id: '3',
    userId: 'herblover',
    plantId: '3',
    photoUri: 'https://images.unsplash.com/photo-1587402092301-725e37c70fd8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'First time growing basil! It\'s doing great!',
    likes: 15,
    liked: false,
    comments: [],
    createdAt: '2023-05-13T14:45:00Z'
  }
];

export const useCommunity = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { isPremium } = useAppContext();

  const loadPosts = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPosts(mockPosts);
    setLoading(false);
  };

  const refreshPosts = async () => {
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPosts(mockPosts);
  };

  const likePost = (postId: string) => {
    if (!isPremium) return;

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked
            }
          : post
      )
    );
  };

  const commentOnPost = (postId: string, commentText: string) => {
    if (!isPremium) return;

    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...(post.comments || []),
                { userId: 'currentUser', text: commentText }
              ]
            }
          : post
      )
    );
  };

  return {
    posts,
    loading,
    loadPosts,
    refreshPosts,
    likePost,
    commentOnPost
  };
};
