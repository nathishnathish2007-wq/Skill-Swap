import { Star } from 'lucide-react';
import { cx } from '../utils/helpers';

export default function StarRating({ value = 0, onChange, size = 'sm', label }) {
  const interactive = typeof onChange === 'function';
  const iconSize = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';

  return (
    <div className="flex items-center gap-1" aria-label={label || `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= Math.round(value);
        const content = (
          <Star
            className={cx(iconSize, active ? 'fill-amber-400 text-amber-400' : 'text-slate-300')}
            aria-hidden="true"
          />
        );

        return interactive ? (
          <button key={star} type="button" className="rounded-sm p-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400" onClick={() => onChange(star)}>
            {content}
          </button>
        ) : (
          <span key={star}>{content}</span>
        );
      })}
    </div>
  );
}
