import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { getCommunityPosts, addCommunityPost, likePost, addComment } from '../lib/database';

export const useCommunity = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { isPremium, userId } = useAppContext();

  const loadPosts = async () => {
    setLoading(true);
    try {
      const fetchedPosts = await getCommunityPosts();
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    await loadPosts();
  };

  const createPost = async (postData: any) => {
    if (!isPremium) {
      throw new Error('Premium feature required');
    }

    try {
      const newPost = await addCommunityPost(postData);
      setPosts(prevPosts => [newPost, ...prevPosts]);
      return newPost;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  };

  const likePost = async (postId: string) => {
    if (!isPremium) {
      throw new Error('Premium feature required');
    }

    try {
      const newLikeCount = await likePost(postId, userId);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, likes: newLikeCount, liked: true }
            : post
        )
      );
      return newLikeCount;
    } catch (error) {
      console.error('Failed to like post:', error);
      throw error;
    }
  };

  const commentOnPost = async (postId: string, commentText: string) => {
    if (!isPremium) {
      throw new Error('Premium feature required');
    }

    try {
      const newComment = await addComment(postId, userId, commentText);
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                comments: [...(post.comments || []), newComment]
              }
            : post
        )
      );
      return newComment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  };

  return {
    posts,
    loading,
    loadPosts,
    refreshPosts,
    createPost,
    likePost,
    commentOnPost
  };
};
