import { CATEGORIES } from '../utils/constants';

export function CategoryPicker({ selectedId, onSelect, disabled = false }) {
  return (
    <div className="setup-field">
      <span className="field-label" id="category-picker-label">
        Category
      </span>
      <div
        className="category-grid"
        role="group"
        aria-labelledby="category-picker-label"
      >
        {CATEGORIES.map((category) => {
          const isActive = selectedId === category.id;
          return (
            <button
              key={category.id ?? 'any'}
              type="button"
              disabled={disabled}
              aria-pressed={isActive}
              onClick={() => onSelect(category.id)}
              className={`chip-btn ${isActive ? 'is-active' : ''}`}
            >
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
