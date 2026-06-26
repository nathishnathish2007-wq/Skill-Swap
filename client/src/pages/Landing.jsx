import { ArrowRight, CalendarCheck, MessageCircle, Network, ShieldCheck, Sparkles, Star } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: Network, label: 'Smart skill matching', detail: 'Find peers whose offered and wanted skills line up with yours.' },
  { icon: MessageCircle, label: 'Real-time chat', detail: 'Coordinate the swap without leaving the platform.' },
  { icon: CalendarCheck, label: 'Session scheduling', detail: 'Set time, duration, focus, and meeting links in one place.' },
  { icon: ShieldCheck, label: 'Reputation loop', detail: 'Reviews, badges, and leaderboards reward helpful contributors.' }
];

export default function Landing() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="page grid min-h-[calc(100vh-4rem)] items-center gap-10 py-10 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
              <Sparkles className="h-4 w-4" />
              Peer learning, no payments
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">SkillSwap</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Exchange what you know for what you want to learn. Match with classmates and peers, chat live, schedule sessions, and build a reputation for helpful teaching.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary">
                Start swapping
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="btn-secondary">
                Try demo login
              </Link>
            </div>
            <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
              {[
                ['120+', 'skills'],
                ['4.8', 'avg rating'],
                ['0', 'fees']
              ].map(([value, label]) => (
                <div key={label} className="metric">
                  <div className="text-2xl font-bold text-slate-950">{value}</div>
                  <div className="text-sm text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white shadow-soft">
            <div className="grid gap-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-semibold">Live match board</span>
                <span className="rounded-md bg-emerald-400/15 px-2 py-1 text-xs font-bold text-emerald-200">87% match</span>
              </div>
              {[
                ['You teach', 'Python', 'Expert'],
                ['You learn', 'UI Design', 'Expert'],
                ['Next step', 'Schedule 60 min', 'Tomorrow']
              ].map(([label, title, meta]) => (
                <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <span className="text-lg font-semibold">{title}</span>
                    <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-slate-200">{meta}</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 rounded-lg bg-white p-3 text-slate-950">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-amber-100 font-bold text-amber-800">PR</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">Priya Raman</p>
                  <p className="truncate text-sm text-slate-500">Design mentor looking for Python help</p>
                </div>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page py-10">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.label} className="panel p-5">
                <Icon className="h-6 w-6 text-slate-700" />
                <h2 className="mt-4 font-semibold text-slate-950">{feature.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.detail}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
