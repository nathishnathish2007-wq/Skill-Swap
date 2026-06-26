import { ArrowLeft, ArrowRight, Check, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { proficiencyOptions, skillSuggestions } from '../utils/helpers';

const emptySkill = { skill: '', proficiency: 'Beginner' };

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    bio: '',
    skillsOffered: [{ ...emptySkill }],
    skillsWanted: ['']
  });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateOffered(index, field, value) {
    const skills = [...form.skillsOffered];
    skills[index] = { ...skills[index], [field]: value };
    update('skillsOffered', skills);
  }

  function updateWanted(index, value) {
    const skills = [...form.skillsWanted];
    skills[index] = value;
    update('skillsWanted', skills);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (step < 4) {
      setStep((value) => value + 1);
      return;
    }

    setLoading(true);
    try {
      await register({
        ...form,
        skillsOffered: form.skillsOffered.filter((skill) => skill.skill),
        skillsWanted: form.skillsWanted.filter(Boolean)
      });
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page grid min-h-[calc(100vh-4rem)] place-items-center">
      <form className="panel w-full max-w-2xl p-6" onSubmit={handleSubmit}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">Create SkillSwap profile</h1>
            <p className="mt-1 text-sm text-slate-500">Step {step} of 4</p>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((item) => (
              <span key={item} className={`h-2 w-8 rounded-full sm:w-9 ${item <= step ? 'bg-slate-950' : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>

        {step === 1 ? (
          <div className="grid gap-4">
            <label>
              <span className="label">Name</span>
              <input className="field" value={form.name} onChange={(event) => update('name', event.target.value)} required />
            </label>
            <label>
              <span className="label">Email</span>
              <input className="field" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
            </label>
            <label>
              <span className="label">Password</span>
              <input className="field" type="password" minLength={6} value={form.password} onChange={(event) => update('password', event.target.value)} required />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-4">
            <label>
              <span className="label">College</span>
              <input className="field" value={form.college} onChange={(event) => update('college', event.target.value)} />
            </label>
            <label>
              <span className="label">Bio</span>
              <textarea className="field min-h-28" maxLength={300} value={form.bio} onChange={(event) => update('bio', event.target.value)} />
            </label>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-3">
            {form.skillsOffered.map((skill, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_180px_44px]">
                <input className="field" list="skill-suggestions" placeholder="Skill offered" value={skill.skill} onChange={(event) => updateOffered(index, 'skill', event.target.value)} required />
                <select className="field" value={skill.proficiency} onChange={(event) => updateOffered(index, 'proficiency', event.target.value)}>
                  {proficiencyOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
                <button type="button" className="btn-secondary px-3" onClick={() => update('skillsOffered', form.skillsOffered.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove skill">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" className="btn-secondary w-fit" onClick={() => update('skillsOffered', [...form.skillsOffered, { ...emptySkill }])}>
              <Plus className="h-4 w-4" />
              Add skill
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="grid gap-3">
            {form.skillsWanted.map((skill, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_44px]">
                <input className="field" list="skill-suggestions" placeholder="Skill wanted" value={skill} onChange={(event) => updateWanted(index, event.target.value)} required />
                <button type="button" className="btn-secondary px-3" onClick={() => update('skillsWanted', form.skillsWanted.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove wanted skill">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" className="btn-secondary w-fit" onClick={() => update('skillsWanted', [...form.skillsWanted, ''])}>
              <Plus className="h-4 w-4" />
              Add wanted skill
            </button>
          </div>
        ) : null}

        <datalist id="skill-suggestions">
          {skillSuggestions.map((skill) => <option key={skill} value={skill} />)}
        </datalist>

        <div className="mt-6 flex justify-between gap-3">
          <button type="button" className="btn-secondary" disabled={step === 1} onClick={() => setStep((value) => value - 1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button type="submit" className="btn-primary" disabled={loading}>
            {step === 4 ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {step === 4 ? (loading ? 'Creating' : 'Create profile') : 'Continue'}
          </button>
        </div>
      </form>
    </main>
  );
}
