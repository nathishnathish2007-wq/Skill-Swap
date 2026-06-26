import { ArrowRight, CalendarDays, Compass, Medal, MessageCircle, Star, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import BadgeDisplay from '../components/BadgeDisplay';
import Loader from '../components/Loader';
import SessionCard from '../components/SessionCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({ sessions: [], matches: [], loading: true });

  useEffect(() => {
    async function load() {
      const [sessions, matches] = await Promise.all([
        api.get('/sessions/upcoming'),
        api.get('/matches/my-matches')
      ]);
      setData({ sessions: sessions.data.sessions, matches: matches.data.matches, loading: false });
    }
    load().catch(() => setData((current) => ({ ...current, loading: false })));
  }, []);

  if (data.loading) return <Loader label="Loading dashboard" />;

  const metrics = [
    { label: 'Sessions', value: user.totalSessions || 0, icon: CalendarDays, tone: 'text-emerald-700 bg-emerald-50' },
    { label: 'Rating', value: Number(user.averageRating || 0).toFixed(1), icon: Star, tone: 'text-amber-700 bg-amber-50' },
    { label: 'Badges', value: user.badges?.length || 0, icon: Medal, tone: 'text-violet-700 bg-violet-50' },
    { label: 'Matches', value: data.matches.length, icon: Users, tone: 'text-sky-700 bg-sky-50' }
  ];

  return (
    <main className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="mt-2 text-slate-600">Your next useful skill exchange is a few clicks away.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/browse" className="btn-secondary"><Compass className="h-4 w-4" /> Browse</Link>
          <Link to="/matches" className="btn-primary"><Users className="h-4 w-4" /> Find matches</Link>
        </div>
      </div>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="metric">
              <div className={`mb-4 grid h-10 w-10 place-items-center rounded-md ${metric.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-bold text-slate-950">{metric.value}</div>
              <div className="text-sm text-slate-500">{metric.label}</div>
            </article>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="section-title">Upcoming sessions</h2>
            <Link to="/sessions" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-950">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3">
            {data.sessions.slice(0, 3).map((session) => <SessionCard key={session._id} session={session} />)}
            {!data.sessions.length ? (
              <div className="panel p-6 text-sm text-slate-500">No upcoming sessions yet. Find a match and schedule one.</div>
            ) : null}
          </div>
        </div>

        <aside className="grid gap-4">
          <div className="panel p-5">
            <h2 className="section-title">Your badges</h2>
            <div className="mt-4">
              <BadgeDisplay badges={user.badges || []} />
            </div>
          </div>
          <div className="panel p-5">
            <h2 className="section-title">Quick actions</h2>
            <div className="mt-4 grid gap-2">
              <Link to={`/profile/${user._id}`} className="btn-secondary justify-start">View profile</Link>
              <Link to="/chat" className="btn-secondary justify-start"><MessageCircle className="h-4 w-4" /> Open chat</Link>
              <Link to="/leaderboard" className="btn-secondary justify-start">Leaderboard</Link>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
