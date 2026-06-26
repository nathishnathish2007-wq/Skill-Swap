import { cx } from '../utils/helpers';

const toneMap = {
  offered: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  wanted: 'border-amber-200 bg-amber-50 text-amber-800',
  neutral: 'border-slate-200 bg-slate-100 text-slate-700'
};

export default function SkillTag({ children, tone = 'neutral', suffix }) {
  return (
    <span className={cx('inline-flex min-h-7 items-center rounded-md border px-2.5 py-1 text-xs font-semibold', toneMap[tone])}>
      {children}
      {suffix ? <span className="ml-1 font-medium opacity-75">{suffix}</span> : null}
    </span>
  );
}
