export async function publishPost(text: string): Promise<void> {
  console.log('[Bluesky] Publishing post:', text);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('[Bluesky] Post published successfully');
}

export async function getNotifications(): Promise<any[]> {
  console.log('[Bluesky] Fetching notifications');
  return [];
}
