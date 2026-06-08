import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiClientError, blogPostApi } from '../services/api';
import type { BlogPost } from '../types/blogPost';

function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPost() {
      if (!id) {
        setError('Invalid post id.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await blogPostApi.get(Number(id));
        setPost(data);
      } catch (err) {
        const message =
          err instanceof ApiClientError ? err.message : 'Failed to load blog post.';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    void loadPost();
  }, [id]);

  async function handleDelete() {
    if (!post) {
      return;
    }

    const confirmed = window.confirm('Delete this blog post?');
    if (!confirmed) {
      return;
    }

    try {
      await blogPostApi.remove(post.id);
      navigate('/');
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Failed to delete blog post.';
      setError(message);
    }
  }

  if (loading) {
    return <div className="card">Loading post...</div>;
  }

  if (error || !post) {
    return (
      <div className="stack">
        <div className="error-banner">{error ?? 'Post not found.'}</div>
        <Link className="btn btn-secondary" to="/">
          Back to posts
        </Link>
      </div>
    );
  }

  return (
    <article className="card stack">
      <h2>{post.title}</h2>
      <p className="post-meta">
        By {post.author} · Created {new Date(post.created_at).toLocaleString()} · Updated{' '}
        {new Date(post.updated_at).toLocaleString()}
      </p>
      <p className="post-content">{post.content}</p>
      <div className="row">
        <Link className="btn btn-secondary" to={`/posts/${post.id}/edit`}>
          Edit
        </Link>
        <button className="btn btn-danger" onClick={() => void handleDelete()}>
          Delete
        </button>
        <Link className="btn btn-secondary" to="/">
          Back
        </Link>
      </div>
    </article>
  );
}

export default PostDetailPage;
