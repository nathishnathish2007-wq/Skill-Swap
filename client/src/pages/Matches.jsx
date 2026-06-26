import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import MatchCard from '../components/MatchCard';
import api from '../utils/api';

export default function Matches() {
  const [recommendations, setRecommendations] = useState([]);
  const [minScore, setMinScore] = useState(20);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState('');

  async function load() {
    setLoading(true);
    try {
      const { data } = await api.get('/matches/recommendations', { params: { minScore } });
      setRecommendations(data.recommendations);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [minScore]);

  async function connect(partnerId) {
    setConnecting(partnerId);
    try {
      await api.post('/matches', { partnerId });
      toast.success('Match request sent.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not connect.');
    } finally {
      setConnecting('');
    }
  }

  return (
    <main className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Find your perfect match</h1>
          <p className="mt-2 text-slate-600">Recommendations use two-way skill overlap, proficiency, ratings, online status, and badges.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={load}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <section className="panel mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <label className="flex min-w-64 flex-1 items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Minimum score</span>
          <input type="range" min="0" max="90" step="5" value={minScore} onChange={(event) => setMinScore(Number(event.target.value))} className="w-full" />
          <span className="w-12 text-right text-sm font-bold text-slate-950">{minScore}%</span>
        </label>
      </section>

      {loading ? <Loader label="Scoring matches" /> : (
        recommendations.length ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendations.map((recommendation) => (
              <MatchCard key={recommendation.user._id} recommendation={recommendation} onConnect={connect} connecting={connecting === recommendation.user._id} />
            ))}
          </section>
        ) : (
          <div className="mt-6">
            <EmptyState title="No strong matches yet" message="Add more skills to improve your recommendations." />
          </div>
        )
      )}
    </main>
  );
}
