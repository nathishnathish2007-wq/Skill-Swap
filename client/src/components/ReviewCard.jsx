import { formatDate } from '../utils/helpers';
import StarRating from './StarRating';

export default function ReviewCard({ review }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950">{review.reviewer?.name || 'SkillSwap peer'}</h3>
          <p className="text-sm text-slate-500">{formatDate(review.createdAt)}</p>
        </div>
        <StarRating value={review.rating} />
      </div>
      {review.comment ? <p className="mt-3 text-sm text-slate-600">{review.comment}</p> : null}
    </article>
  );
}
