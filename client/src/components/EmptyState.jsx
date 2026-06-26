import { Search } from 'lucide-react';

export default function EmptyState({ title = 'Nothing here yet', message = 'Try changing your filters or check back later.', action }) {
  return (
    <div className="panel flex flex-col items-center justify-center px-6 py-12 text-center">
      <Search className="mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-slate-500">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
