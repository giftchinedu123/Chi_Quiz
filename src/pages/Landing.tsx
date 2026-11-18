import { useNavigate } from 'react-router-dom';

export function Landing() {
  const navigate = useNavigate();

  return (
    <main className="landing-page">
      <div className="landing-center">
        <button
          type="button"
          onClick={() => navigate('/quiz')}
          className="landing-cta"
        >
          <span>Quiz me</span>
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
        <p className="landing-byline">Quiz by Gift</p>
      </div>
    </main>
  );
}
