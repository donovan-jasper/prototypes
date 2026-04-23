import { useState } from 'react';

export const useCommunity = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    // Simulate API call with mock data
    setTimeout(() => {
      setPosts([
        {
          id: '1',
          userId: 'plantlover123',
          plantId: 'plant1',
          photoUri: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          caption: 'My monstera is thriving after 3 months! 🌿',
          likes: 42,
          liked: false,
          comments: [
            { userId: 'greenthumb', text: 'Beautiful growth!' },
            { userId: 'plantmom', text: 'Congratulations!' }
          ],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '2',
          userId: 'urbanfarmer',
          plantId: 'plant2',
          photoUri: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          caption: 'First time growing a snake plant. It survived!',
          likes: 15,
          liked: false,
          comments: [],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
        {
          id: '3',
          userId: 'leafygreen',
          plantId: 'plant3',
          photoUri: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          caption: 'My pothos is finally happy in its new home!',
          likes: 28,
          liked: false,
          comments: [
            { userId: 'plantparent', text: 'So cute!' }
          ],
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ]);
      setLoading(false);
    }, 1000);
  };

  const refreshPosts = async () => {
    // Simulate refreshing with new mock data
    return new Promise(resolve => {
      setTimeout(() => {
        const newPost = {
          id: '4',
          userId: 'newplantowner',
          plantId: 'plant4',
          photoUri: 'https://images.unsplash.com/photo-1587440871875-191322ee64b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
          caption: 'Just adopted this sweet little succulent!',
          likes: 0,
          liked: false,
          comments: [],
          createdAt: new Date().toISOString(),
        };

        setPosts([newPost, ...posts]);
        resolve(true);
      }, 1000);
    });
  };

  const likePost = async (id: string) => {
    setPosts(posts.map(post =>
      post.id === id ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked } : post
    ));
  };

  const commentOnPost = async (id: string, text: string) => {
    setPosts(posts.map(post =>
      post.id === id ? {
        ...post,
        comments: [...(post.comments || []), { userId: 'currentUser', text }]
      } : post
    ));
  };

  return { posts, loading, loadPosts, refreshPosts, likePost, commentOnPost };
};
