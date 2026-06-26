import { MessageCircle, UserRoundPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { initials } from '../utils/helpers';
import BadgeDisplay from './BadgeDisplay';
import SkillTag from './SkillTag';
import StarRating from './StarRating';

export default function MatchCard({ recommendation, onConnect, connecting }) {
  const user = recommendation.user;
  const exchange = recommendation.exchange || {};

  return (
    <article className="panel relative flex h-full flex-col overflow-hidden p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="absolute right-4 top-4 rounded-md bg-rose-50 px-2.5 py-1 text-sm font-bold text-rose-700">{recommendation.score}%</div>
      <div className="flex items-start gap-3 pr-16">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-sky-100 font-bold text-sky-800">{initials(user.name)}</div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-950">{user.name}</h3>
          <p className="truncate text-sm text-slate-500">{user.college || 'Independent learner'}</p>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <StarRating value={user.averageRating || 0} />
            <span>{Number(user.averageRating || 0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">You teach</p>
          <SkillTag tone="offered">{exchange.candidateWantsSkill || 'Shared skill'}</SkillTag>
        </div>
        <div>
          <p className="mb-1 text-xs font-bold uppercase text-slate-400">You learn</p>
          <SkillTag tone="wanted">{exchange.candidateOffersSkill || 'Shared skill'}</SkillTag>
        </div>
      </div>

      <div className="mt-4">
        <BadgeDisplay badges={user.badges || []} limit={2} compact />
      </div>

      <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
        <Link to={`/profile/${user._id}`} className="btn-secondary">
          Profile
        </Link>
        <button type="button" className="btn-primary" onClick={() => onConnect(user._id)} disabled={connecting}>
          {connecting ? <MessageCircle className="h-4 w-4 animate-pulse" /> : <UserRoundPlus className="h-4 w-4" />}
          Connect
        </button>
      </div>
    </article>
  );
}
