const BADGES = [
  {
    name: 'Rising Star',
    icon: 'star',
    description: 'Completed at least 3 sessions with a 4.5+ average rating.',
    requirements: { minSessions: 3, minRating: 4.5 }
  },
  {
    name: 'Expert Mentor',
    icon: 'graduation-cap',
    description: 'Completed 10 teaching sessions with a 4.7+ average rating.',
    requirements: { minSessionsAsTeacher: 10, minRating: 4.7 }
  },
  {
    name: 'Skill Master',
    icon: 'medal',
    description: 'Completed 20 sessions with a 4.8+ average rating.',
    requirements: { minSessions: 20, minRating: 4.8 }
  },
  {
    name: 'Learner Pro',
    icon: 'book-open',
    description: 'Completed 15 learning sessions.',
    requirements: { minSessionsAsLearner: 15 }
  },
  {
    name: 'Community Helper',
    icon: 'handshake',
    description: 'Completed 5 sessions with a 4.5+ average rating.',
    requirements: { minSessions: 5, minRating: 4.5 }
  },
  {
    name: 'Verified Expert',
    icon: 'badge-check',
    description: 'Verified expert with 10 sessions and a 4.8+ average rating.',
    requirements: { minSessions: 10, minRating: 4.8, isVerified: true }
  }
];

function meetsRequirement(user, requirements) {
  return Object.entries(requirements).every(([key, value]) => {
    if (key === 'isVerified') return Boolean(user.isVerified) === value;
    return Number(user[key] || 0) >= value;
  });
}

function evaluateBadges(user) {
  const existingNames = new Set((user.badges || []).map((badge) => badge.name));
  const newBadges = BADGES.filter((badge) => !existingNames.has(badge.name) && meetsRequirement(user, badge.requirements))
    .map((badge) => ({
      name: badge.name,
      icon: badge.icon,
      description: badge.description,
      earnedAt: new Date()
    }));

  return [...(user.badges || []), ...newBadges];
}

module.exports = { BADGES, evaluateBadges };
