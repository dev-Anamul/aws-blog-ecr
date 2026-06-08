import { Link, Route, Routes } from 'react-router-dom';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import PostDetailPage from './pages/PostDetailPage';
import PostListPage from './pages/PostListPage';

function App() {
  return (
    <div className="container">
      <header className="app-header">
        <h1>Simple Blog</h1>
        <p>Create, read, update, and delete blog posts.</p>
        <div className="row" style={{ marginTop: '1rem' }}>
          <Link className="btn btn-primary" to="/">
            All Posts
          </Link>
          <Link className="btn btn-secondary" to="/posts/new">
            New Post
          </Link>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<PostListPage />} />
        <Route path="/posts/new" element={<CreatePostPage />} />
        <Route path="/posts/:id" element={<PostDetailPage />} />
        <Route path="/posts/:id/edit" element={<EditPostPage />} />
      </Routes>
    </div>
  );
}

export default App;
