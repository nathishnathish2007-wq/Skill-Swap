import { Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import SkillCard from '../components/SkillCard';
import api from '../utils/api';
import { proficiencyOptions } from '../utils/helpers';

export default function Browse() {
  const [filters, setFilters] = useState({ search: '', skill: '', proficiency: '', minRating: '', online: false });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/users/browse', { params: filters });
        setUsers(data.users);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [filters]);

  return (
    <main className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Browse peers</h1>
          <p className="mt-2 text-slate-600">Search by name, skill, rating, or availability.</p>
        </div>
      </div>

      <section className="panel mt-6 p-4">
        <div className="grid gap-3 lg:grid-cols-[1.3fr_1fr_180px_160px_120px]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className="field pl-9" placeholder="Search name, college, skill" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
          </label>
          <input className="field" placeholder="Skill" value={filters.skill} onChange={(event) => setFilters({ ...filters, skill: event.target.value })} />
          <select className="field" value={filters.proficiency} onChange={(event) => setFilters({ ...filters, proficiency: event.target.value })}>
            <option value="">Any level</option>
            {proficiencyOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <select className="field" value={filters.minRating} onChange={(event) => setFilters({ ...filters, minRating: event.target.value })}>
            <option value="">Any rating</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
            <option value="4.8">4.8+</option>
          </select>
          <label className="btn-secondary justify-start">
            <input type="checkbox" className="h-4 w-4" checked={filters.online} onChange={(event) => setFilters({ ...filters, online: event.target.checked })} />
            Online
          </label>
        </div>
      </section>

      <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
        <SlidersHorizontal className="h-4 w-4" />
        {users.length} result{users.length === 1 ? '' : 's'}
      </div>

      {loading ? <Loader label="Finding peers" /> : (
        users.length ? (
          <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => <SkillCard key={user._id} user={user} />)}
          </section>
        ) : (
          <div className="mt-4">
            <EmptyState title="No peers found" message="Adjust the search or clear a filter to widen the pool." />
          </div>
        )
      )}
    </main>
  );
}
