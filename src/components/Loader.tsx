interface LoaderProps {
  message?: string;
}

export function Loader({ message = 'Loading questions...' }: LoaderProps) {
  return (
    <div className="loader-box" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p className="loader-text">{message}</p>
      <div className="skeleton-stack" aria-hidden="true">
        <div className="skeleton-line skeleton-line--lg" />
        <div className="skeleton-line skeleton-line--md" />
        <div className="skeleton-row" />
        <div className="skeleton-row" />
        <div className="skeleton-row" />
      </div>
    </div>
  );
}
