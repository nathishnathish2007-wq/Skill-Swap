function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function skillNames(skills) {
  return (skills || []).map((entry) => normalize(entry.skill || entry)).filter(Boolean);
}

function skillObjects(skills) {
  return (skills || []).map((entry) => ({
    skill: entry.skill || entry,
    proficiency: entry.proficiency || 'Beginner'
  }));
}

function proficiencyWeight(proficiency) {
  return { Beginner: 8, Intermediate: 14, Expert: 22 }[proficiency] || 8;
}

function findExchange(user, candidate) {
  const wantedByUser = skillNames(user.skillsWanted);
  const wantedByCandidate = skillNames(candidate.skillsWanted);
  const offeredByUser = skillObjects(user.skillsOffered);
  const offeredByCandidate = skillObjects(candidate.skillsOffered);

  const userCanTeach = offeredByUser.find((skill) => wantedByCandidate.includes(normalize(skill.skill)));
  const candidateCanTeach = offeredByCandidate.find((skill) => wantedByUser.includes(normalize(skill.skill)));

  return {
    userCanTeach,
    candidateCanTeach,
    isTwoWay: Boolean(userCanTeach && candidateCanTeach)
  };
}

function calculateMatchScore(user, candidate) {
  const exchange = findExchange(user, candidate);
  let score = 0;

  if (exchange.candidateCanTeach) {
    score += 38 + proficiencyWeight(exchange.candidateCanTeach.proficiency);
  }

  if (exchange.userCanTeach) {
    score += 28 + proficiencyWeight(exchange.userCanTeach.proficiency);
  }

  if (exchange.isTwoWay) score += 16;
  if (candidate.averageRating >= 4.5) score += 8;
  if (candidate.isOnline) score += 4;
  if (candidate.badges?.length) score += Math.min(candidate.badges.length * 2, 6);

  return Math.max(0, Math.min(score, 100));
}

function buildExchange(user, candidate) {
  const exchange = findExchange(user, candidate);
  return {
    userOffersSkill: exchange.userCanTeach?.skill || user.skillsOffered?.[0]?.skill || 'Skill swap',
    userWantsSkill: exchange.candidateCanTeach?.skill || user.skillsWanted?.[0] || 'Skill swap',
    candidateOffersSkill: exchange.candidateCanTeach?.skill || candidate.skillsOffered?.[0]?.skill || 'Skill swap',
    candidateWantsSkill: exchange.userCanTeach?.skill || candidate.skillsWanted?.[0] || 'Skill swap'
  };
}

module.exports = { calculateMatchScore, buildExchange };
