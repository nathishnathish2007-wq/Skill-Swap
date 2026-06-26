import { X } from 'lucide-react';
import { useState } from 'react';
import StarRating from './StarRating';

export default function ReviewModal({ open, session, onClose, onSubmit }) {
  const [form, setForm] = useState({
    rating: 5,
    skillQuality: 5,
    communication: 5,
    punctuality: 5,
    wouldRecommend: true,
    comment: ''
  });

  if (!open || !session) return null;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({ ...form, sessionId: session._id, skillTaught: session.skillFocus });
    setForm({ rating: 5, skillQuality: 5, communication: 5, punctuality: 5, wouldRecommend: true, comment: '' });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 py-8">
      <form className="w-full max-w-xl rounded-lg bg-white p-5 shadow-soft" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="section-title">Review session</h2>
            <p className="text-sm text-slate-500">{session.partner?.name || 'SkillSwap peer'} - {session.skillFocus}</p>
          </div>
          <button type="button" className="btn-quiet px-3" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <span className="font-semibold text-slate-700">Overall rating</span>
            <StarRating value={form.rating} onChange={(value) => update('rating', value)} size="lg" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['skillQuality', 'Skill quality'],
              ['communication', 'Communication'],
              ['punctuality', 'Punctuality']
            ].map(([field, label]) => (
              <label key={field}>
                <span className="label">{label}</span>
                <select className="field" value={form[field]} onChange={(event) => update(field, Number(event.target.value))}>
                  {[5, 4, 3, 2, 1].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
          <label>
            <span className="label">Comment</span>
            <textarea className="field min-h-28" value={form.comment} onChange={(event) => update('comment', event.target.value)} placeholder="What went well?" />
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={form.wouldRecommend} onChange={(event) => update('wouldRecommend', event.target.checked)} />
            Would recommend this peer
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Submit review
          </button>
        </div>
      </form>
    </div>
  );
}
