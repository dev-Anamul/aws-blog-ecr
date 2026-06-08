import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiClientError, blogPostApi } from '../services/api';
import type { BlogPost } from '../types/blogPost';

function PostListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true);
        setError(null);
        const data = await blogPostApi.list();
        setPosts(data);
      } catch (err) {
        const message =
          err instanceof ApiClientError ? err.message : 'Failed to load blog posts.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadPosts();
  }, []);

  async function handleDelete(id: number) {
    const confirmed = window.confirm('Delete this blog post?');
    if (!confirmed) {
      return;
    }

    try {
      await blogPostApi.remove(id);
      setPosts((current) => current.filter((post) => post.id !== id));
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Failed to delete blog post.';
      setError(message);
    }
  }

  if (loading) {
    return <div className="card">Loading posts...</div>;
  }

  return (
    <div className="stack">
      {error && <div className="error-banner">{error}</div>}

      {posts.length === 0 ? (
        <div className="card empty-state">
          No posts yet. <Link className="link-button" to="/posts/new">Create your first post</Link>.
        </div>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <article className="card post-card" key={post.id}>
              <h2>
                <Link className="link-button" to={`/posts/${post.id}`}>
                  {post.title}
                </Link>
              </h2>
              <p className="post-meta">
                By {post.author} · {new Date(post.created_at).toLocaleString()}
              </p>
              <p className="post-content">
                {post.content.length > 240 ? `${post.content.slice(0, 240)}...` : post.content}
              </p>
              <div className="row">
                <Link className="btn btn-secondary" to={`/posts/${post.id}/edit`}>
                  Edit
                </Link>
                <button className="btn btn-danger" onClick={() => void handleDelete(post.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostListPage;
