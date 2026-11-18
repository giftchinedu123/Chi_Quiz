import type { CategoryOption } from '../types/quiz';
import { CATEGORIES } from '../utils/constants';

interface CategoryPickerProps {
  selectedId: number | null;
  onSelect: (id: number | null) => void;
  disabled?: boolean;
}

export function CategoryPicker({
  selectedId,
  onSelect,
  disabled = false,
}: CategoryPickerProps) {
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
        {CATEGORIES.map((category: CategoryOption) => {
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
