import { CalendarCheck, CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import { formatDateTime } from '../utils/helpers';

export default function SessionCard({ session, onComplete, onReview, onCancel }) {
  const partnerName = session.partner?.name || 'SkillSwap peer';
  const meetingLink = session.meetingLink || session.googleMeetLink || session.zoomLink;
  const completed = session.status === 'completed';
  const cancelled = session.status === 'cancelled';

  return (
    <article className="panel p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <CalendarCheck className="h-5 w-5 text-slate-500" aria-hidden="true" />
            <h3 className="font-semibold text-slate-950">{session.skillFocus}</h3>
          </div>
          <p className="text-sm text-slate-600">{formatDateTime(session.scheduledDate, session.scheduledTime)} with {partnerName}</p>
          <p className="mt-1 text-sm text-slate-500">{session.duration} min{session.notes ? ` - ${session.notes}` : ''}</p>
        </div>
        <span className="inline-flex w-fit items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
          {session.status}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {meetingLink && !cancelled ? (
          <a href={meetingLink} target="_blank" rel="noreferrer" className="btn-secondary">
            <ExternalLink className="h-4 w-4" />
            Join
          </a>
        ) : null}
        {!completed && !cancelled && onComplete ? (
          <button type="button" className="btn-primary" onClick={() => onComplete(session)}>
            <CheckCircle2 className="h-4 w-4" />
            Complete
          </button>
        ) : null}
        {completed && onReview ? (
          <button type="button" className="btn-secondary" onClick={() => onReview(session)}>
            Review
          </button>
        ) : null}
        {!cancelled && !completed && onCancel ? (
          <button type="button" className="btn-quiet" onClick={() => onCancel(session)}>
            <XCircle className="h-4 w-4" />
            Cancel
          </button>
        ) : null}
      </div>
    </article>
  );
}
