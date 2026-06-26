import { Edit, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import BadgeDisplay from '../components/BadgeDisplay';
import Loader from '../components/Loader';
import ReviewCard from '../components/ReviewCard';
import SkillTag from '../components/SkillTag';
import StarRating from '../components/StarRating';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { initials } from '../utils/helpers';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [profileResponse, reviewsResponse] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/users/${userId}/reviews`)
      ]);
      setProfile(profileResponse.data.user);
      setReviews(reviewsResponse.data.reviews);
      setLoading(false);
    }
    load().catch(() => setLoading(false));
  }, [userId]);

  if (loading) return <Loader label="Loading profile" />;
  if (!profile) return <main className="page"><div className="panel p-6">Profile not found.</div></main>;

  return (
    <main className="page">
      <section className="panel overflow-hidden">
        <div className="border-b border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-emerald-100 text-2xl font-bold text-emerald-800">{initials(profile.name)}</div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold text-slate-950">{profile.name}</h1>
                  {profile.isOnline ? <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">Online</span> : null}
                </div>
                <p className="mt-1 text-slate-500">{profile.college || 'Independent learner'}</p>
                <div className="mt-3 flex items-center gap-2">
                  <StarRating value={profile.averageRating || 0} />
                  <span className="text-sm font-semibold text-slate-700">{Number(profile.averageRating || 0).toFixed(1)}</span>
                  <span className="text-sm text-slate-400">({profile.ratingCount || 0} reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Link to="/edit-profile" className="btn-primary"><Edit className="h-4 w-4" /> Edit</Link>
              ) : (
                <Link to="/matches" className="btn-primary"><MessageCircle className="h-4 w-4" /> Connect</Link>
              )}
            </div>
          </div>
          {profile.bio ? <p className="mt-5 max-w-3xl leading-7 text-slate-600">{profile.bio}</p> : null}
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <div>
            <h2 className="section-title">Skills offered</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(profile.skillsOffered || []).map((skill) => (
                <SkillTag key={skill._id || skill.skill} tone="offered" suffix={skill.proficiency}>{skill.skill}</SkillTag>
              ))}
            </div>
          </div>
          <div>
            <h2 className="section-title">Skills wanted</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {(profile.skillsWanted || []).map((skill) => <SkillTag key={skill} tone="wanted">{skill}</SkillTag>)}
            </div>
          </div>
          <div>
            <h2 className="section-title">Badges</h2>
            <div className="mt-3"><BadgeDisplay badges={profile.badges || []} /></div>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="section-title">Recent reviews</h2>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {reviews.map((review) => <ReviewCard key={review._id} review={review} />)}
          {!reviews.length ? <div className="panel p-6 text-sm text-slate-500">No reviews yet.</div> : null}
        </div>
      </section>
    </main>
  );
}
