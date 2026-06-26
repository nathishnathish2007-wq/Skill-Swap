import { SendHorizonal } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import { formatDateTime, initials } from '../utils/helpers';

export default function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [matches, setMatches] = useState([]);
  const [match, setMatch] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [typing, setTyping] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function loadMatches() {
      const { data } = await api.get('/matches/my-matches');
      setMatches(data.matches.filter((item) => item.status === 'accepted'));
      setLoading(false);
    }
    loadMatches().catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!matchId) return;
    async function loadChat() {
      setLoading(true);
      const [matchResponse, messageResponse] = await Promise.all([
        api.get(`/matches/${matchId}/details`),
        api.get(`/chat/${matchId}/messages`)
      ]);
      setMatch(matchResponse.data.match);
      setMessages(messageResponse.data.messages);
      setLoading(false);
    }
    loadChat().catch(() => setLoading(false));
  }, [matchId]);

  useEffect(() => {
    if (!socket || !matchId) return;
    socket.emit('joinMatch', matchId);
    const onReceive = (message) => {
      if (message.matchId === matchId) {
        setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
      }
    };
    const onTyping = (data) => {
      if (data.matchId === matchId && data.userId !== user._id) {
        setTyping(`${data.name || 'Peer'} is typing`);
        setTimeout(() => setTyping(''), 1600);
      }
    };
    socket.on('receiveMessage', onReceive);
    socket.on('userTyping', onTyping);
    return () => {
      socket.off('receiveMessage', onReceive);
      socket.off('userTyping', onTyping);
      socket.emit('leaveRoom', matchId);
    };
  }, [socket, matchId, user._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeMatches = useMemo(() => matches, [matches]);

  async function sendMessage(event) {
    event.preventDefault();
    const text = content.trim();
    if (!text || !matchId) return;
    setContent('');

    if (socket && connected) {
      socket.emit('sendMessage', { matchId, content: text }, (response) => {
        if (!response?.ok) toast.error(response?.message || 'Message failed.');
      });
      return;
    }

    try {
      const { data } = await api.post(`/chat/${matchId}/message`, { content: text });
      setMessages((current) => [...current, data.message]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Message failed.');
    }
  }

  if (loading) return <Loader label="Opening chat" />;

  return (
    <main className="page grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="panel h-fit p-3">
        <h1 className="px-2 py-2 text-lg font-bold text-slate-950">Chats</h1>
        <div className="mt-2 grid gap-1">
          {activeMatches.map((item) => (
            <button key={item._id} type="button" className={`flex items-center gap-3 rounded-md p-2 text-left hover:bg-slate-100 ${item._id === matchId ? 'bg-slate-100' : ''}`} onClick={() => navigate(`/chat/${item._id}`)}>
              <span className="grid h-10 w-10 place-items-center rounded-md bg-sky-100 text-sm font-bold text-sky-800">{initials(item.partner?.name)}</span>
              <span className="min-w-0">
                <span className="block truncate font-semibold text-slate-800">{item.partner?.name || 'SkillSwap peer'}</span>
                <span className="block truncate text-xs text-slate-500">{item.user1OffersSkill} / {item.user2OffersSkill}</span>
              </span>
            </button>
          ))}
          {!activeMatches.length ? <p className="px-2 py-4 text-sm text-slate-500">No accepted matches yet.</p> : null}
        </div>
      </aside>

      {!matchId ? (
        <EmptyState title="Select a chat" message="Accepted matches will appear on the left." />
      ) : (
        <section className="panel flex min-h-[70vh] flex-col overflow-hidden">
          <header className="flex items-center justify-between border-b border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-md bg-emerald-100 font-bold text-emerald-800">{initials(match?.partner?.name)}</span>
              <div>
                <h2 className="font-semibold text-slate-950">{match?.partner?.name || 'SkillSwap peer'}</h2>
                <p className="text-sm text-slate-500">{connected ? 'Real-time connected' : 'Using HTTP fallback'}</p>
              </div>
            </div>
            {match?.partner?._id ? <Link to={`/profile/${match.partner._id}`} className="btn-secondary">Profile</Link> : null}
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message) => {
              const mine = message.senderId === user._id;
              return (
                <div key={message._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] rounded-lg px-4 py-2 ${mine ? 'bg-slate-950 text-white' : 'border border-slate-200 bg-white text-slate-800'}`}>
                    <p className="text-sm">{message.content}</p>
                    <p className={`mt-1 text-[11px] ${mine ? 'text-slate-300' : 'text-slate-400'}`}>{formatDateTime(message.createdAt)}</p>
                  </div>
                </div>
              );
            })}
            {typing ? <p className="text-sm text-slate-500">{typing}</p> : null}
            <div ref={bottomRef} />
          </div>

          <form className="flex gap-2 border-t border-slate-200 bg-white p-4" onSubmit={sendMessage}>
            <input
              className="field"
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                socket?.emit('typing', { matchId });
              }}
              placeholder="Type a message"
            />
            <button type="submit" className="btn-primary px-3" aria-label="Send message">
              <SendHorizonal className="h-5 w-5" />
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
