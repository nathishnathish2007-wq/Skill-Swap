import { ArrowRight, Circle, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { initials } from '../utils/helpers';
import BadgeDisplay from './BadgeDisplay';
import SkillTag from './SkillTag';
import StarRating from './StarRating';

export default function SkillCard({ user }) {
  return (
    <article className="panel flex h-full flex-col p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-emerald-100 font-bold text-emerald-800">{initials(user.name)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-slate-950">{user.name}</h3>
            {user.isOnline ? <Circle className="h-2.5 w-2.5 fill-emerald-500 text-emerald-500" aria-label="Online" /> : null}
          </div>
          <p className="truncate text-sm text-slate-500">{user.college || 'Independent learner'}</p>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <StarRating value={user.averageRating || 0} />
            <span>{Number(user.averageRating || 0).toFixed(1)}</span>
            <span className="text-slate-400">({user.ratingCount || 0})</span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-slate-400">Teaches</p>
          <div className="flex flex-wrap gap-2">
            {(user.skillsOffered || []).slice(0, 4).map((skill) => (
              <SkillTag key={skill._id || skill.skill} tone="offered" suffix={skill.proficiency}>
                {skill.skill}
              </SkillTag>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-slate-400">Learning</p>
          <div className="flex flex-wrap gap-2">
            {(user.skillsWanted || []).slice(0, 4).map((skill) => (
              <SkillTag key={skill} tone="wanted">
                {skill}
              </SkillTag>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <BadgeDisplay badges={user.badges || []} limit={3} compact />
      </div>

      <div className="mt-auto pt-5">
        <Link to={`/profile/${user._id}`} className="btn-secondary w-full">
          View profile
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
