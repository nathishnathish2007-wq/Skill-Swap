import { Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Browse from './pages/Browse';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';
import Landing from './pages/Landing';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Matches from './pages/Matches';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Sessions from './pages/Sessions';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="app-shell">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/matches" element={<Matches />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:matchId" element={<Chat />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </SocketProvider>
    </AuthProvider>
  );
}
