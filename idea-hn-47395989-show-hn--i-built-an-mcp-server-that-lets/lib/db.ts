import { ScheduledPost } from '@/types';

const scheduledPosts: ScheduledPost[] = [];

export async function saveScheduledPost(post: {
  content: string;
  platform: 'threads' | 'bluesky' | 'both';
  scheduledFor: Date;
}): Promise<void> {
  const newPost: ScheduledPost = {
    id: Date.now().toString(),
    content: post.content,
    platform: post.platform,
    scheduledFor: post.scheduledFor,
    status: 'pending',
  };
  
  scheduledPosts.push(newPost);
  console.log('[DB] Scheduled post saved:', newPost);
}

export async function getScheduledPosts(): Promise<ScheduledPost[]> {
  return scheduledPosts.filter(post => post.status === 'pending');
}

export async function updatePostStatus(id: string, status: 'published' | 'failed'): Promise<void> {
  const post = scheduledPosts.find(p => p.id === id);
  if (post) {
    post.status = status;
    console.log('[DB] Post status updated:', id, status);
  }
}
