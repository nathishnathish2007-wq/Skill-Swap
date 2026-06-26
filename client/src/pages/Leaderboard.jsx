import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BadgeDisplay from '../components/BadgeDisplay';
import Loader from '../components/Loader';
import StarRating from '../components/StarRating';
import api from '../utils/api';
import { initials, topSkill } from '../utils/helpers';

export default function Leaderboard() {
  const [sort, setSort] = useState('sessions');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await api.get('/leaderboard', { params: { sort } });
      setUsers(data.users);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, [sort]);

  if (loading) return <Loader label="Ranking contributors" />;

  const podium = users.slice(0, 3);

  return (
    <main className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-950"><Trophy className="h-8 w-8 text-amber-500" /> SkillSwap leaderboard</h1>
          <p className="mt-2 text-slate-600">Top contributors by sessions, rating, and badges.</p>
        </div>
        <select className="field w-full sm:w-48" value={sort} onChange={(event) => setSort(event.target.value)}>
          <option value="sessions">Sessions</option>
          <option value="rating">Rating</option>
          <option value="badges">Badges</option>
        </select>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {podium.map((user) => (
          <Link key={user._id} to={`/profile/${user._id}`} className="panel p-5 text-center transition hover:-translate-y-0.5 hover:shadow-soft">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-amber-100 text-xl font-bold text-amber-800">{initials(user.name)}</div>
            <div className="mt-3 text-sm font-bold text-slate-500">Rank {user.rank}</div>
            <h2 className="mt-1 text-lg font-semibold text-slate-950">{user.name}</h2>
            <p className="text-sm text-slate-500">{topSkill(user)}</p>
            <div className="mt-3 flex justify-center"><StarRating value={user.averageRating || 0} /></div>
          </Link>
        ))}
      </section>

      <section className="panel mt-6 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">College</th>
                <th className="px-4 py-3">Sessions</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Top skill</th>
                <th className="px-4 py-3">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-slate-950">{user.rank}</td>
                  <td className="px-4 py-3">
                    <Link to={`/profile/${user._id}`} className="font-semibold text-slate-950 hover:underline">{user.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.college || 'Independent learner'}</td>
                  <td className="px-4 py-3 text-slate-600">{user.totalSessions || 0}</td>
                  <td className="px-4 py-3 text-slate-600">{Number(user.averageRating || 0).toFixed(1)}</td>
                  <td className="px-4 py-3 text-slate-600">{topSkill(user)}</td>
                  <td className="px-4 py-3"><BadgeDisplay badges={user.badges || []} limit={2} compact /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
