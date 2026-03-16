import { useState } from 'react';

export const useCommunity = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    setPosts([
      {
        id: '1',
        userId: 'user1',
        plantId: 'plant1',
        photoUri: 'https://via.placeholder.com/300',
        caption: 'My monstera is thriving!',
        likes: 42,
        createdAt: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  };

  const likePost = async (id: string) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, likes: post.likes + 1 } : post
    ));
  };

  return { posts, loading, loadPosts, likePost };
};
