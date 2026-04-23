import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

// Mock data for community posts
const mockPosts = [
  {
    id: '1',
    userId: 'plantlover123',
    plantId: 'p1',
    photoUri: 'https://images.unsplash.com/photo-1525382455947-f319bc05fb35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'My Monstera is growing so big! 🌿 #PlantPulse',
    likes: 42,
    liked: false,
    comments: [
      { userId: 'greenthumb', text: 'Wow, that looks amazing!' },
      { userId: 'plantmom', text: 'When did you get it?' }
    ],
    createdAt: '2023-05-15T10:30:00Z'
  },
  {
    id: '2',
    userId: 'urbanfarmer',
    plantId: 'p2',
    photoUri: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'First time growing herbs! 🌱 #ApartmentGarden',
    likes: 18,
    liked: false,
    comments: [],
    createdAt: '2023-05-14T08:15:00Z'
  },
  {
    id: '3',
    userId: 'succulentfan',
    plantId: 'p3',
    photoUri: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'My collection is growing! 🌵 #SucculentLife',
    likes: 35,
    liked: false,
    comments: [
      { userId: 'plantcollector', text: 'Which ones are your favorites?' }
    ],
    createdAt: '2023-05-13T14:20:00Z'
  },
  {
    id: '4',
    userId: 'plantmom',
    plantId: 'p4',
    photoUri: 'https://images.unsplash.com/photo-1525382455947-f319bc05fb35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'Teaching my kids to care for plants! 👨‍👩‍👧‍👦 #PlantParent',
    likes: 67,
    liked: false,
    comments: [
      { userId: 'plantlover123', text: 'That looks so cute!' },
      { userId: 'urbanfarmer', text: 'Great initiative!' }
    ],
    createdAt: '2023-05-12T09:45:00Z'
  }
];

export const useCommunity = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { isPremium } = useAppContext();

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(mockPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    await loadPosts();
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
