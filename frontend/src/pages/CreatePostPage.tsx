import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClientError, blogPostApi } from '../services/api';

function CreatePostPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Anonymous');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const post = await blogPostApi.create({ title, author, content });
      navigate(`/posts/${post.id}`);
    } catch (err) {
      const message =
        err instanceof ApiClientError ? err.message : 'Failed to create blog post.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card stack">
      <h2>Create Post</h2>
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
            {submitting ? 'Creating...' : 'Create Post'}
          </button>
          <Link className="btn btn-secondary" to="/">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default CreatePostPage;
