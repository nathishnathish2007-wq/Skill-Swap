import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import { CalendarDays, List, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import ReviewModal from '../components/ReviewModal';
import ScheduleModal from '../components/ScheduleModal';
import SessionCard from '../components/SessionCard';
import api from '../utils/api';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [view, setView] = useState('list');
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [reviewSession, setReviewSession] = useState(null);

  async function load() {
    setLoading(true);
    const [sessionResponse, matchResponse] = await Promise.all([
      api.get('/sessions/my-sessions'),
      api.get('/matches/my-matches')
    ]);
    setSessions(sessionResponse.data.sessions);
    setMatches(matchResponse.data.matches.filter((match) => match.status === 'accepted'));
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  async function scheduleSession(payload) {
    try {
      await api.post('/sessions', payload);
      toast.success('Session scheduled.');
      setScheduleOpen(false);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not schedule session.');
    }
  }

  async function completeSession(session) {
    try {
      await api.put(`/sessions/${session._id}/complete`);
      toast.success('Session marked complete.');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not complete session.');
    }
  }

  async function cancelSession(session) {
    try {
      await api.delete(`/sessions/${session._id}`);
      toast.success('Session cancelled.');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not cancel session.');
    }
  }

  async function submitReview(payload) {
    try {
      await api.post('/reviews', payload);
      toast.success('Review submitted.');
      setReviewSession(null);
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit review.');
    }
  }

  const calendarEvents = sessions.map((session) => ({
    id: session._id,
    title: session.skillFocus,
    start: `${String(session.scheduledDate).slice(0, 10)}T${session.scheduledTime || '09:00'}`,
    extendedProps: { status: session.status }
  }));

  return (
    <main className="page">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">Sessions</h1>
          <p className="mt-2 text-slate-600">Schedule, join, complete, and review your skill exchanges.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-md border border-slate-300 bg-white p-1">
            <button type="button" className={`btn px-3 ${view === 'list' ? 'bg-slate-950 text-white' : 'text-slate-700'}`} onClick={() => setView('list')}>
              <List className="h-4 w-4" /> List
            </button>
            <button type="button" className={`btn px-3 ${view === 'calendar' ? 'bg-slate-950 text-white' : 'text-slate-700'}`} onClick={() => setView('calendar')}>
              <CalendarDays className="h-4 w-4" /> Calendar
            </button>
          </div>
          <button type="button" className="btn-primary" onClick={() => setScheduleOpen(true)}>
            <Plus className="h-4 w-4" /> Schedule
          </button>
        </div>
      </div>

      {loading ? <Loader label="Loading sessions" /> : view === 'calendar' ? (
        <section className="panel mt-6 p-4">
          <FullCalendar plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]} initialView="dayGridMonth" headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }} height="auto" events={calendarEvents} />
        </section>
      ) : (
        <section className="mt-6 grid gap-3">
          {sessions.map((session) => (
            <SessionCard key={session._id} session={session} onComplete={completeSession} onReview={setReviewSession} onCancel={cancelSession} />
          ))}
          {!sessions.length ? <EmptyState title="No sessions scheduled" message="Accept a match, then schedule your first session." /> : null}
        </section>
      )}

      <ScheduleModal open={scheduleOpen} matches={matches} onClose={() => setScheduleOpen(false)} onSubmit={scheduleSession} />
      <ReviewModal open={Boolean(reviewSession)} session={reviewSession} onClose={() => setReviewSession(null)} onSubmit={submitReview} />
    </main>
  );
}
