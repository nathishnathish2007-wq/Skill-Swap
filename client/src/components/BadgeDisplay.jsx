import { BadgeCheck, BookOpen, GraduationCap, Handshake, Medal, Star } from 'lucide-react';

const iconMap = {
  star: Star,
  'graduation-cap': GraduationCap,
  medal: Medal,
  'book-open': BookOpen,
  handshake: Handshake,
  'badge-check': BadgeCheck
};

export default function BadgeDisplay({ badges = [], limit, compact = false }) {
  const visible = limit ? badges.slice(0, limit) : badges;
  const hiddenCount = limit && badges.length > limit ? badges.length - limit : 0;

  if (!badges.length) {
    return <span className="text-sm text-slate-400">No badges yet</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((badge) => {
        const Icon = iconMap[badge.icon] || Star;
        return (
          <span
            key={`${badge.name}-${badge.earnedAt || ''}`}
            title={badge.description}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800"
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {compact ? badge.name.split(' ')[0] : badge.name}
          </span>
        );
      })}
      {hiddenCount ? (
        <span className="inline-flex min-h-8 items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}
