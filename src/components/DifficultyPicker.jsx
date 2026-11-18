import { DIFFICULTIES } from '../utils/constants';

export function DifficultyPicker({ selected, onSelect, disabled = false }) {
  return (
    <div className="setup-field">
      <span className="field-label" id="difficulty-picker-label">
        Difficulty
      </span>
      <div
        className="segmented-control"
        role="radiogroup"
        aria-labelledby="difficulty-picker-label"
      >
        {DIFFICULTIES.map((item) => {
          const isActive = selected === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => onSelect(item.value)}
              className={`segment-btn ${isActive ? 'is-active' : ''}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
