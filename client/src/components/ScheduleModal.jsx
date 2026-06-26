import { X } from 'lucide-react';
import { useState } from 'react';

export default function ScheduleModal({ open, matches = [], onClose, onSubmit }) {
  const [form, setForm] = useState({
    matchId: '',
    scheduledDate: '',
    scheduledTime: '17:00',
    duration: 60,
    skillFocus: '',
    meetingLink: '',
    notes: ''
  });

  if (!open) return null;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit(form);
    setForm({ matchId: '', scheduledDate: '', scheduledTime: '17:00', duration: 60, skillFocus: '', meetingLink: '', notes: '' });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 py-8">
      <form className="w-full max-w-2xl rounded-lg bg-white p-5 shadow-soft" onSubmit={handleSubmit}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="section-title">Schedule session</h2>
          <button type="button" className="btn-quiet px-3" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">Match partner</span>
            <select className="field" value={form.matchId} onChange={(event) => update('matchId', event.target.value)} required>
              <option value="">Select a match</option>
              {matches.map((match) => (
                <option key={match._id} value={match._id}>
                  {match.partner?.name || 'SkillSwap peer'}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Skill focus</span>
            <input className="field" value={form.skillFocus} onChange={(event) => update('skillFocus', event.target.value)} required />
          </label>
          <label>
            <span className="label">Date</span>
            <input className="field" type="date" value={form.scheduledDate} onChange={(event) => update('scheduledDate', event.target.value)} required />
          </label>
          <label>
            <span className="label">Time</span>
            <input className="field" type="time" step="900" value={form.scheduledTime} onChange={(event) => update('scheduledTime', event.target.value)} required />
          </label>
          <label>
            <span className="label">Duration</span>
            <select className="field" value={form.duration} onChange={(event) => update('duration', Number(event.target.value))}>
              {[30, 60, 90, 120].map((duration) => (
                <option key={duration} value={duration}>
                  {duration} minutes
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="label">Meeting link</span>
            <input className="field" value={form.meetingLink} onChange={(event) => update('meetingLink', event.target.value)} placeholder="https://meet.google.com/..." />
          </label>
        </div>

        <label className="mt-4 block">
          <span className="label">Notes</span>
          <textarea className="field min-h-24" value={form.notes} onChange={(event) => update('notes', event.target.value)} />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            Schedule
          </button>
        </div>
      </form>
    </div>
  );
}
