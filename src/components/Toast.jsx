export function Toast({ message }) {
  if (!message) return null;

  return (
    <div className="toast" role="status" aria-live="polite">
      <i className="fa-solid fa-check" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
