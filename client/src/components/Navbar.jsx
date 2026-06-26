import { Bell, CalendarDays, Compass, Home, LogOut, Menu, MessageCircle, Trophy, User, Users, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cx, initials } from '../utils/helpers';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/browse', label: 'Browse', icon: Compass },
  { to: '/matches', label: 'Matches', icon: Users },
  { to: '/sessions', label: 'Sessions', icon: CalendarDays },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy }
];

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        cx(
          'inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition',
          isActive ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
        )
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {item.label}
    </NavLink>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 font-bold text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-slate-950 text-sm text-white">SS</span>
          <span>SkillSwap</span>
        </Link>

        {isAuthenticated ? (
          <>
            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </nav>

            <div className="hidden items-center gap-2 lg:flex">
              <button type="button" className="btn-quiet px-3" title="Notifications">
                <Bell className="h-4 w-4" aria-hidden="true" />
              </button>
              <Link to={`/profile/${user?._id}`} className="btn-secondary px-3" title="Profile">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-emerald-100 text-xs font-bold text-emerald-800">{initials(user?.name)}</span>
                <span>{user?.name?.split(' ')[0]}</span>
              </Link>
              <button type="button" className="btn-quiet px-3" onClick={handleLogout} title="Log out">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <button type="button" className="btn-secondary px-3 lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Open navigation">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-quiet">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Sign up
            </Link>
          </div>
        )}
      </div>

      {open && isAuthenticated ? (
        <div className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
          <nav className="grid gap-1">
            {navItems.map((item) => (
              <NavItem key={item.to} item={item} onClick={() => setOpen(false)} />
            ))}
            <NavLink to={`/profile/${user?._id}`} onClick={() => setOpen(false)} className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              <User className="h-4 w-4" aria-hidden="true" />
              Profile
            </NavLink>
            <NavLink to="/chat" onClick={() => setOpen(false)} className="inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Chat
            </NavLink>
            <button type="button" className="btn-quiet justify-start" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
