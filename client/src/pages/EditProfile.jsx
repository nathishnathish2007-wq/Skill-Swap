import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { proficiencyOptions, skillSuggestions } from '../utils/helpers';

export default function EditProfile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user.name || '',
    college: user.college || '',
    bio: user.bio || '',
    avatar: user.avatar || '',
    skillsOffered: user.skillsOffered?.length ? user.skillsOffered : [{ skill: '', proficiency: 'Beginner' }],
    skillsWanted: user.skillsWanted?.length ? user.skillsWanted : ['']
  });

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateOffered(index, field, value) {
    const skills = [...form.skillsOffered];
    skills[index] = { ...skills[index], [field]: value };
    update('skillsOffered', skills);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await updateProfile({
        ...form,
        skillsOffered: form.skillsOffered.filter((skill) => skill.skill),
        skillsWanted: form.skillsWanted.filter(Boolean)
      });
      navigate(`/profile/${user._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <form className="panel p-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Edit profile</h1>
            <p className="mt-2 text-slate-600">Keep your offered and wanted skills fresh for better matches.</p>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <Save className="h-4 w-4" />
            {loading ? 'Saving' : 'Save'}
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <label>
            <span className="label">Name</span>
            <input className="field" value={form.name} onChange={(event) => update('name', event.target.value)} required />
          </label>
          <label>
            <span className="label">College</span>
            <input className="field" value={form.college} onChange={(event) => update('college', event.target.value)} />
          </label>
          <label className="lg:col-span-2">
            <span className="label">Bio</span>
            <textarea className="field min-h-28" maxLength={300} value={form.bio} onChange={(event) => update('bio', event.target.value)} />
          </label>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section>
            <h2 className="section-title">Skills offered</h2>
            <div className="mt-3 grid gap-3">
              {form.skillsOffered.map((skill, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_170px_44px]">
                  <input className="field" list="skill-suggestions" value={skill.skill} onChange={(event) => updateOffered(index, 'skill', event.target.value)} />
                  <select className="field" value={skill.proficiency} onChange={(event) => updateOffered(index, 'proficiency', event.target.value)}>
                    {proficiencyOptions.map((option) => <option key={option}>{option}</option>)}
                  </select>
                  <button type="button" className="btn-secondary px-3" onClick={() => update('skillsOffered', form.skillsOffered.filter((_, itemIndex) => itemIndex !== index))}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" className="btn-secondary w-fit" onClick={() => update('skillsOffered', [...form.skillsOffered, { skill: '', proficiency: 'Beginner' }])}>
                <Plus className="h-4 w-4" /> Add skill
              </button>
            </div>
          </section>

          <section>
            <h2 className="section-title">Skills wanted</h2>
            <div className="mt-3 grid gap-3">
              {form.skillsWanted.map((skill, index) => (
                <div key={index} className="grid gap-2 sm:grid-cols-[1fr_44px]">
                  <input className="field" list="skill-suggestions" value={skill} onChange={(event) => {
                    const skills = [...form.skillsWanted];
                    skills[index] = event.target.value;
                    update('skillsWanted', skills);
                  }} />
                  <button type="button" className="btn-secondary px-3" onClick={() => update('skillsWanted', form.skillsWanted.filter((_, itemIndex) => itemIndex !== index))}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" className="btn-secondary w-fit" onClick={() => update('skillsWanted', [...form.skillsWanted, ''])}>
                <Plus className="h-4 w-4" /> Add wanted skill
              </button>
            </div>
          </section>
        </div>

        <datalist id="skill-suggestions">
          {skillSuggestions.map((skill) => <option key={skill} value={skill} />)}
        </datalist>
      </form>
    </main>
  );
}
