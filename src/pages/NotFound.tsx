import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <main className="page-shell">
      <section className="quiz-card not-found-card" aria-label="Page not found">
        <span className="pill-label">
          <span className="pill-dot" aria-hidden="true" />
          <span>404</span>
        </span>
        <h1 className="card-heading">Page not found</h1>
        <p className="card-subtitle">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="error-actions">
          <Link to="/" className="btn-primary">
            <i className="fa-solid fa-house" aria-hidden="true" />
            <span>Back home</span>
          </Link>
          <Link to="/quiz" className="btn-secondary">
            <span>Go to quiz</span>
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
