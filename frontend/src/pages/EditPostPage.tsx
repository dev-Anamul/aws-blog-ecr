import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiClientError, blogPostApi } from '../services/api';

function EditPostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        const post = await blogPostApi.get(Number(id));
        setTitle(post.title);
        setAuthor(post.author);
        setContent(post.content);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!id) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const post = await blogPostApi.update(Number(id), { title, author, content });
      navigate(`/posts/${post.id}`);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Failed to update blog post.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="card">Loading post...</div>;
  }

  return (
    <div className="card stack">
      <h2>Edit Post</h2>
      {error && <div className="error-banner">{error}</div>}

      <form className="stack" onSubmit={(event) => void handleSubmit(event)}>
        <div className="field">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={200}
          />
        </div>

        <div className="field">
          <label htmlFor="author">Author</label>
          <input
            id="author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className="field">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            required
          />
        </div>

        <div className="row">
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link className="btn btn-secondary" to={id ? `/posts/${id}` : '/'}>
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default EditPostPage;
