import { LogIn } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: 'arjun@demo.com', password: 'password123', remember: true });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from?.pathname || '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page grid min-h-[calc(100vh-4rem)] place-items-center">
      <form className="panel w-full max-w-md p-6" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold text-slate-950">Login</h1>
        <p className="mt-2 text-sm text-slate-500">Demo: arjun@demo.com / password123</p>
        <div className="mt-6 grid gap-4">
          <label>
            <span className="label">Email</span>
            <input className="field" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
          </label>
          <label>
            <span className="label">Password</span>
            <input className="field" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
          </label>
          <div className="flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={form.remember} onChange={(event) => setForm({ ...form, remember: event.target.checked })} />
              Remember me
            </label>
            <button type="button" className="text-sm font-semibold text-slate-700 hover:text-slate-950">Forgot password</button>
          </div>
        </div>
        <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
          <LogIn className="h-4 w-4" />
          {loading ? 'Signing in' : 'Sign in'}
        </button>
        <p className="mt-5 text-center text-sm text-slate-500">
          New to SkillSwap? <Link className="font-semibold text-slate-950" to="/register">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
