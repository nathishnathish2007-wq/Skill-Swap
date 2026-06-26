import { format, parseISO } from 'date-fns';

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function formatDate(value) {
  if (!value) return '';
  try {
    return format(typeof value === 'string' ? parseISO(value) : new Date(value), 'MMM d, yyyy');
  } catch {
    return String(value);
  }
}

export function formatDateTime(value, time) {
  const date = formatDate(value);
  return [date, time].filter(Boolean).join(' at ');
}

export function topSkill(user) {
  return user?.skillsOffered?.[0]?.skill || 'SkillSwap';
}

export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const proficiencyOptions = ['Beginner', 'Intermediate', 'Expert'];

export const skillSuggestions = [
  'Python',
  'React',
  'UI Design',
  'Figma',
  'Public Speaking',
  'Data Structures',
  'AWS',
  'JavaScript',
  'System Design',
  'Storytelling'
];
