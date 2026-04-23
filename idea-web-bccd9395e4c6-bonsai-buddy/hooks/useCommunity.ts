import { useState, useEffect } from 'react';
import { plantData } from '../lib/plantData';

// Mock data for community posts
const mockPosts = [
  {
    id: '1',
    userId: 'plantlover123',
    plantId: '1',
    photoUri: 'https://images.unsplash.com/photo-1520974332770-37f6623f4696?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'My Monstera is finally growing those beautiful splits! 🌿',
    likes: 42,
    liked: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    comments: [
      { userId: 'greenthumb', text: 'Wow, that looks amazing!' },
      { userId: 'plantmom', text: 'When did you get it?' }
    ]
  },
  {
    id: '2',
    userId: 'urbanfarmer',
    plantId: '2',
    photoUri: 'https://images.unsplash.com/photo-1585192346574-7b2d7f77e95c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'Pothos is doing great in my tiny apartment! 🏙️🌿',
    likes: 18,
    liked: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    comments: [
      { userId: 'houseplantmom', text: 'Love the trailing effect!' }
    ]
  },
  {
    id: '3',
    userId: 'snakeplantfan',
    plantId: '3',
    photoUri: 'https://images.unsplash.com/photo-1585192346574-7b2d7f77e95c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'My snake plant is thriving in low light! 🐍🌿',
    likes: 37,
    liked: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    comments: [
      { userId: 'plantmom', text: 'That looks so healthy!' },
      { userId: 'greenthumb', text: 'How long have you had it?' }
    ]
  },
  {
    id: '4',
    userId: 'fiddleleaflover',
    plantId: '4',
    photoUri: 'https://images.unsplash.com/photo-1520974332770-37f6623f4696?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'My fiddle leaf fig is growing so tall! 🌿🌳',
    likes: 65,
    liked: false,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    comments: [
      { userId: 'plantlover123', text: 'That's amazing!' },
      { userId: 'urbanfarmer', text: 'How often do you water it?' }
    ]
  },
  {
    id: '5',
    userId: 'zzplantfan',
    plantId: '5',
    photoUri: 'https://images.unsplash.com/photo-1585192346574-7b2d7f77e95c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    caption: 'My ZZ plant is doing great with minimal care! 🌿💪',
    likes: 29,
    liked: false,
    createdAt: new Date(Date.now() - 432000000).toISOString(),
    comments: [
      { userId: 'snakeplantfan', text: 'Love the texture!' }
    ]
  }
];

export function useCommunity() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPosts(mockPosts);
    setLoading(false);
  };

  const refreshPosts = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPosts(mockPosts);
  };

  const likePost = (postId: string) => {
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
}
