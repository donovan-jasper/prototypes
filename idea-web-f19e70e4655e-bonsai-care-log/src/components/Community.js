import React, { useState, useEffect } from 'react';

function Community() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    // Fetch community posts from the server
    fetch('/api/community-posts')
      .then(response => response.json())
      .then(data => setPosts(data));
  }, []);

  return (
    <div>
      <h1>Community</h1>
      <div>
        {posts.map(post => (
          <div key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <p>Posted by: {post.author}</p>
            <p>Date: {new Date(post.date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Community;
