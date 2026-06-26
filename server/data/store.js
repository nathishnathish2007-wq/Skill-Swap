const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { isMongoReady } = require('../config/db');
const User = require('../models/User');
const Match = require('../models/Match');
const Message = require('../models/Message');
const Session = require('../models/Session');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const { calculateMatchScore, buildExchange } = require('../utils/matchAlgorithm');
const { evaluateBadges } = require('../utils/badgeEngine');

const memory = {
  users: [],
  matches: [],
  messages: [],
  sessions: [],
  reviews: [],
  notifications: []
};

function appError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function id() {
  return crypto.randomUUID();
}

function toId(value) {
  if (!value) return '';
  if (typeof value === 'object' && value._id) return String(value._id);
  return String(value);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function publicUser(user) {
  if (!user) return null;
  const obj = user.toPublicJSON ? user.toPublicJSON() : clone(user);
  delete obj.password;
  obj._id = toId(obj._id);
  obj.skillsOffered = obj.skillsOffered || [];
  obj.skillsWanted = obj.skillsWanted || [];
  obj.badges = obj.badges || [];
  return obj;
}

function publicUsers(users) {
  return users.map(publicUser).filter(Boolean);
}

function serializeMatch(match, currentUserId) {
  if (!match) return null;
  const obj = match.toObject ? match.toObject() : clone(match);
  const user1Profile = typeof obj.user1 === 'object' ? publicUser(obj.user1) : getMemoryUserPublic(obj.user1);
  const user2Profile = typeof obj.user2 === 'object' ? publicUser(obj.user2) : getMemoryUserPublic(obj.user2);
  obj.user1 = toId(obj.user1);
  obj.user2 = toId(obj.user2);
  obj._id = toId(obj._id);
  obj.user1Profile = user1Profile;
  obj.user2Profile = user2Profile;

  if (currentUserId) {
    obj.partner = obj.user1 === String(currentUserId) ? user2Profile : user1Profile;
  }

  return obj;
}

function serializeMessage(message) {
  const obj = message.toObject ? message.toObject() : clone(message);
  obj._id = toId(obj._id);
  obj.matchId = toId(obj.matchId);
  obj.senderId = toId(obj.senderId);
  obj.receiverId = toId(obj.receiverId);
  obj.sender = typeof message.senderId === 'object' ? publicUser(message.senderId) : getMemoryUserPublic(obj.senderId);
  return obj;
}

function serializeSession(session, currentUserId) {
  const obj = session.toObject ? session.toObject() : clone(session);
  const user1Profile = typeof obj.user1 === 'object' ? publicUser(obj.user1) : getMemoryUserPublic(obj.user1);
  const user2Profile = typeof obj.user2 === 'object' ? publicUser(obj.user2) : getMemoryUserPublic(obj.user2);
  obj._id = toId(obj._id);
  obj.matchId = toId(obj.matchId);
  obj.user1 = toId(obj.user1);
  obj.user2 = toId(obj.user2);
  obj.user1Profile = user1Profile;
  obj.user2Profile = user2Profile;
  obj.partner = obj.user1 === String(currentUserId) ? user2Profile : user1Profile;
  return obj;
}

function serializeReview(review) {
  const obj = review.toObject ? review.toObject() : clone(review);
  obj._id = toId(obj._id);
  obj.sessionId = toId(obj.sessionId);
  obj.reviewerId = toId(obj.reviewerId);
  obj.revieweeId = toId(obj.revieweeId);
  obj.reviewer = typeof review.reviewerId === 'object' ? publicUser(review.reviewerId) : getMemoryUserPublic(obj.reviewerId);
  obj.reviewee = typeof review.revieweeId === 'object' ? publicUser(review.revieweeId) : getMemoryUserPublic(obj.revieweeId);
  return obj;
}

function getMemoryUserRaw(userId) {
  return memory.users.find((user) => user._id === String(userId));
}

function getMemoryUserPublic(userId) {
  return publicUser(getMemoryUserRaw(userId));
}

function normalizeSkills(skills) {
  return (skills || [])
    .filter((entry) => entry && (entry.skill || entry))
    .map((entry) => ({
      _id: entry._id || id(),
      skill: String(entry.skill || entry).trim(),
      proficiency: entry.proficiency || 'Beginner'
    }));
}

function normalizeWanted(skills) {
  return [...new Set((skills || []).map((skill) => String(skill).trim()).filter(Boolean))];
}

function filterUsers(users, filters = {}) {
  const search = String(filters.search || '').trim().toLowerCase();
  const skill = String(filters.skill || '').trim().toLowerCase();
  const proficiency = String(filters.proficiency || '').trim();
  const minRating = Number(filters.minRating || 0);
  const online = filters.online === 'true' || filters.online === true;

  return users.filter((user) => {
    const offered = user.skillsOffered || [];
    const wanted = user.skillsWanted || [];
    const searchable = [user.name, user.college, user.bio, ...offered.map((item) => item.skill), ...wanted]
      .join(' ')
      .toLowerCase();

    if (search && !searchable.includes(search)) return false;
    if (skill && !offered.some((item) => item.skill.toLowerCase().includes(skill)) && !wanted.some((item) => item.toLowerCase().includes(skill))) return false;
    if (proficiency && !offered.some((item) => item.proficiency === proficiency)) return false;
    if (minRating && Number(user.averageRating || 0) < minRating) return false;
    if (online && !user.isOnline) return false;
    return true;
  });
}

async function createNotification(userId, type, message, meta = {}) {
  if (isMongoReady()) {
    const notification = await Notification.create({ userId, type, message, meta });
    return clone(notification);
  }

  const notification = {
    _id: id(),
    userId: String(userId),
    type,
    message,
    meta,
    read: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  memory.notifications.push(notification);
  return clone(notification);
}

async function createUser(input) {
  const email = String(input.email || '').trim().toLowerCase();
  if (!email || !input.password || !input.name) throw appError('Name, email, and password are required.');

  const payload = {
    name: String(input.name).trim(),
    email,
    password: input.password,
    college: input.college || '',
    bio: input.bio || '',
    avatar: input.avatar || null,
    skillsOffered: normalizeSkills(input.skillsOffered),
    skillsWanted: normalizeWanted(input.skillsWanted),
    badges: input.badges || [],
    isOnline: Boolean(input.isOnline),
    isVerified: Boolean(input.isVerified),
    totalSessions: input.totalSessions || 0,
    totalSessionsAsTeacher: input.totalSessionsAsTeacher || 0,
    totalSessionsAsLearner: input.totalSessionsAsLearner || 0,
    averageRating: input.averageRating || 0,
    ratingCount: input.ratingCount || 0
  };

  if (isMongoReady()) {
    const existing = await User.findOne({ email });
    if (existing) throw appError('An account with this email already exists.', 409);
    const user = await User.create(payload);
    return publicUser(user);
  }

  if (memory.users.some((user) => user.email === email)) {
    throw appError('An account with this email already exists.', 409);
  }

  const now = new Date();
  const user = {
    _id: id(),
    ...payload,
    password: await bcrypt.hash(payload.password, 12),
    lastSeen: now,
    createdAt: now,
    updatedAt: now
  };
  memory.users.push(user);
  return publicUser(user);
}

async function authenticateUser(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  let user;

  if (isMongoReady()) {
    user = await User.findOne({ email: normalizedEmail });
    if (!user || !(await user.comparePassword(password))) throw appError('Invalid email or password.', 401);
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();
    return publicUser(user);
  }

  user = memory.users.find((entry) => entry.email === normalizedEmail);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw appError('Invalid email or password.', 401);
  }
  user.isOnline = true;
  user.lastSeen = new Date();
  user.updatedAt = new Date();
  return publicUser(user);
}

async function getUserById(userId) {
  if (isMongoReady()) {
    return publicUser(await User.findById(userId));
  }
  return getMemoryUserPublic(userId);
}

async function updateUser(userId, updates) {
  const allowed = ['name', 'college', 'bio', 'avatar', 'skillsOffered', 'skillsWanted', 'isOnline', 'isVerified'];
  const payload = {};

  allowed.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(updates, key)) payload[key] = updates[key];
  });

  if (payload.skillsOffered) payload.skillsOffered = normalizeSkills(payload.skillsOffered);
  if (payload.skillsWanted) payload.skillsWanted = normalizeWanted(payload.skillsWanted);

  if (isMongoReady()) {
    const user = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true });
    return publicUser(user);
  }

  const user = getMemoryUserRaw(userId);
  if (!user) throw appError('User not found.', 404);
  Object.assign(user, payload, { updatedAt: new Date() });
  return publicUser(user);
}

async function deleteUser(userId) {
  if (isMongoReady()) {
    await User.findByIdAndDelete(userId);
    return true;
  }
  memory.users = memory.users.filter((user) => user._id !== String(userId));
  return true;
}

async function listUsers(filters = {}) {
  const users = isMongoReady() ? await User.find({}).sort({ averageRating: -1, totalSessions: -1 }) : memory.users;
  const currentUserId = filters.excludeUserId ? String(filters.excludeUserId) : null;
  return publicUsers(filterUsers(users.map((user) => (user.toObject ? user.toObject() : user)), filters).filter((user) => String(user._id) !== currentUserId));
}

async function addSkill(userId, skill) {
  const user = await getUserById(userId);
  if (!user) throw appError('User not found.', 404);
  const skillsOffered = [...(user.skillsOffered || []), ...normalizeSkills([skill])];
  return updateUser(userId, { skillsOffered });
}

async function removeSkill(userId, skillId) {
  const user = await getUserById(userId);
  if (!user) throw appError('User not found.', 404);
  const skillsOffered = (user.skillsOffered || []).filter((skill) => String(skill._id) !== String(skillId));
  return updateUser(userId, { skillsOffered });
}

async function getRecommendations(userId, filters = {}) {
  const user = await getUserById(userId);
  if (!user) throw appError('User not found.', 404);
  const candidates = await listUsers({ ...filters, excludeUserId: userId });

  return candidates
    .map((candidate) => ({
      user: candidate,
      score: calculateMatchScore(user, candidate),
      exchange: buildExchange(user, candidate)
    }))
    .filter((match) => match.score >= Number(filters.minScore || 20))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

async function findExistingMatch(user1, user2) {
  if (isMongoReady()) {
    return Match.findOne({
      $or: [
        { user1, user2 },
        { user1: user2, user2: user1 }
      ]
    }).populate('user1 user2');
  }

  return memory.matches.find(
    (match) =>
      (match.user1 === String(user1) && match.user2 === String(user2)) ||
      (match.user1 === String(user2) && match.user2 === String(user1))
  );
}

async function createMatch(userId, partnerId) {
  if (String(userId) === String(partnerId)) throw appError('You cannot match with yourself.');
  const user = await getUserById(userId);
  const partner = await getUserById(partnerId);
  if (!user || !partner) throw appError('User not found.', 404);

  const existing = await findExistingMatch(userId, partnerId);
  if (existing) return serializeMatch(existing, userId);

  const exchange = buildExchange(user, partner);
  const payload = {
    user1: userId,
    user2: partnerId,
    user1OffersSkill: exchange.userOffersSkill,
    user1WantsSkill: exchange.userWantsSkill,
    user2OffersSkill: exchange.candidateOffersSkill,
    user2WantsSkill: exchange.candidateWantsSkill,
    matchScore: calculateMatchScore(user, partner),
    status: 'pending'
  };

  if (isMongoReady()) {
    const match = await Match.create(payload);
    await createNotification(partnerId, 'MATCH_REQUEST', `${user.name} sent you a skill swap request.`, { matchId: match._id });
    return serializeMatch(await Match.findById(match._id).populate('user1 user2'), userId);
  }

  const now = new Date();
  const match = { _id: id(), ...payload, user1: String(userId), user2: String(partnerId), createdAt: now, updatedAt: now };
  memory.matches.push(match);
  await createNotification(partnerId, 'MATCH_REQUEST', `${user.name} sent you a skill swap request.`, { matchId: match._id });
  return serializeMatch(match, userId);
}

async function getMatchById(matchId, currentUserId) {
  if (isMongoReady()) {
    return serializeMatch(await Match.findById(matchId).populate('user1 user2'), currentUserId);
  }
  return serializeMatch(memory.matches.find((match) => match._id === String(matchId)), currentUserId);
}

async function listUserMatches(userId, filters = {}) {
  let matches;
  if (isMongoReady()) {
    matches = await Match.find({ $or: [{ user1: userId }, { user2: userId }] })
      .populate('user1 user2')
      .sort({ updatedAt: -1 });
  } else {
    matches = memory.matches
      .filter((match) => match.user1 === String(userId) || match.user2 === String(userId))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  return matches
    .filter((match) => !filters.status || match.status === filters.status)
    .map((match) => serializeMatch(match, userId));
}

async function updateMatchStatus(matchId, userId, status) {
  const match = await getMatchById(matchId, userId);
  if (!match) throw appError('Match not found.', 404);
  if (!['accepted', 'rejected', 'completed'].includes(status)) throw appError('Invalid match status.');
  if (match.user1 !== String(userId) && match.user2 !== String(userId)) throw appError('You are not part of this match.', 403);

  const update = { status };
  if (status === 'accepted') update.acceptedAt = new Date();
  if (status === 'completed') update.completedAt = new Date();

  if (isMongoReady()) {
    await Match.findByIdAndUpdate(matchId, update);
  } else {
    const raw = memory.matches.find((item) => item._id === String(matchId));
    Object.assign(raw, update, { updatedAt: new Date() });
  }

  const partnerId = match.user1 === String(userId) ? match.user2 : match.user1;
  if (status === 'accepted') {
    await createNotification(partnerId, 'MATCH_ACCEPTED', `${match.partner?.name || 'A peer'} accepted your skill swap request.`, { matchId });
  }

  return getMatchById(matchId, userId);
}

async function deleteMatch(matchId, userId) {
  const match = await getMatchById(matchId, userId);
  if (!match) throw appError('Match not found.', 404);
  if (match.user1 !== String(userId) && match.user2 !== String(userId)) throw appError('You are not part of this match.', 403);

  if (isMongoReady()) await Match.findByIdAndDelete(matchId);
  else memory.matches = memory.matches.filter((item) => item._id !== String(matchId));
  return true;
}

async function createMessage(matchId, senderId, content, attachments = []) {
  const match = await getMatchById(matchId, senderId);
  if (!match) throw appError('Match not found.', 404);
  if (match.user1 !== String(senderId) && match.user2 !== String(senderId)) throw appError('You are not part of this match.', 403);
  const receiverId = match.user1 === String(senderId) ? match.user2 : match.user1;

  if (isMongoReady()) {
    const message = await Message.create({ matchId, senderId, receiverId, content, attachments });
    await createNotification(receiverId, 'MESSAGE', `${match.partner?.name || 'A peer'} sent you a message.`, { matchId });
    return serializeMessage(await Message.findById(message._id).populate('senderId'));
  }

  const now = new Date();
  const message = {
    _id: id(),
    matchId: String(matchId),
    senderId: String(senderId),
    receiverId,
    content,
    attachments,
    isRead: false,
    createdAt: now,
    updatedAt: now
  };
  memory.messages.push(message);
  await createNotification(receiverId, 'MESSAGE', `${match.partner?.name || 'A peer'} sent you a message.`, { matchId });
  return serializeMessage(message);
}

async function listMessages(matchId, userId, { limit = 50, before } = {}) {
  const match = await getMatchById(matchId, userId);
  if (!match) throw appError('Match not found.', 404);
  if (match.user1 !== String(userId) && match.user2 !== String(userId)) throw appError('You are not part of this match.', 403);

  if (isMongoReady()) {
    const query = { matchId };
    if (before) query.createdAt = { $lt: new Date(before) };
    const messages = await Message.find(query).populate('senderId').sort({ createdAt: -1 }).limit(Number(limit));
    return messages.reverse().map(serializeMessage);
  }

  return memory.messages
    .filter((message) => message.matchId === String(matchId) && (!before || new Date(message.createdAt) < new Date(before)))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-Number(limit))
    .map(serializeMessage);
}

async function markMessageRead(messageId, userId) {
  if (isMongoReady()) {
    const message = await Message.findById(messageId);
    if (!message) throw appError('Message not found.', 404);
    if (String(message.receiverId) !== String(userId)) throw appError('You cannot mark this message.', 403);
    message.isRead = true;
    message.readAt = new Date();
    await message.save();
    return serializeMessage(message);
  }

  const message = memory.messages.find((item) => item._id === String(messageId));
  if (!message) throw appError('Message not found.', 404);
  if (message.receiverId !== String(userId)) throw appError('You cannot mark this message.', 403);
  message.isRead = true;
  message.readAt = new Date();
  message.updatedAt = new Date();
  return serializeMessage(message);
}

async function getUnreadCount(userId) {
  if (isMongoReady()) return Message.countDocuments({ receiverId: userId, isRead: false });
  return memory.messages.filter((message) => message.receiverId === String(userId) && !message.isRead).length;
}

async function deleteMessage(messageId, userId) {
  if (isMongoReady()) {
    const message = await Message.findById(messageId);
    if (!message) throw appError('Message not found.', 404);
    if (String(message.senderId) !== String(userId)) throw appError('Only the sender can delete this message.', 403);
    await message.deleteOne();
    return true;
  }

  const message = memory.messages.find((item) => item._id === String(messageId));
  if (!message) throw appError('Message not found.', 404);
  if (message.senderId !== String(userId)) throw appError('Only the sender can delete this message.', 403);
  memory.messages = memory.messages.filter((item) => item._id !== String(messageId));
  return true;
}

async function createSession(userId, input) {
  const match = await getMatchById(input.matchId, userId);
  if (!match) throw appError('Match not found.', 404);
  if (match.user1 !== String(userId) && match.user2 !== String(userId)) throw appError('You are not part of this match.', 403);
  if (match.status !== 'accepted') throw appError('Accept the match before scheduling a session.', 409);

  const payload = {
    matchId: input.matchId,
    user1: match.user1,
    user2: match.user2,
    skillFocus: input.skillFocus,
    duration: Number(input.duration || 60),
    notes: input.notes || '',
    scheduledDate: new Date(input.scheduledDate),
    scheduledTime: input.scheduledTime,
    googleMeetLink: input.googleMeetLink || '',
    zoomLink: input.zoomLink || '',
    meetingLink: input.meetingLink || input.googleMeetLink || input.zoomLink || '',
    status: 'scheduled'
  };

  if (!payload.skillFocus || !payload.scheduledTime || Number.isNaN(payload.scheduledDate.getTime())) {
    throw appError('Skill focus, date, and time are required.');
  }

  if (isMongoReady()) {
    const session = await Session.create(payload);
    const partnerId = match.user1 === String(userId) ? match.user2 : match.user1;
    await createNotification(partnerId, 'SESSION', 'A new SkillSwap session was scheduled.', { sessionId: session._id });
    return serializeSession(session, userId);
  }

  const now = new Date();
  const session = { _id: id(), ...payload, matchId: String(input.matchId), createdAt: now, updatedAt: now };
  memory.sessions.push(session);
  const partnerId = match.user1 === String(userId) ? match.user2 : match.user1;
  await createNotification(partnerId, 'SESSION', 'A new SkillSwap session was scheduled.', { sessionId: session._id });
  return serializeSession(session, userId);
}

async function getSessionById(sessionId, userId) {
  const session = isMongoReady() ? await Session.findById(sessionId).populate('user1 user2') : memory.sessions.find((item) => item._id === String(sessionId));
  if (!session) return null;
  const serialized = serializeSession(session, userId);
  if (userId && serialized.user1 !== String(userId) && serialized.user2 !== String(userId)) throw appError('You are not part of this session.', 403);
  return serialized;
}

function filterSessions(sessions, type) {
  const today = new Date();
  return sessions.filter((session) => {
    const date = new Date(session.scheduledDate);
    if (type === 'upcoming') return session.status !== 'cancelled' && session.status !== 'completed' && date >= new Date(today.toDateString());
    if (type === 'past') return session.status === 'completed' || date < new Date(today.toDateString());
    if (type === 'cancelled') return session.status === 'cancelled';
    return true;
  });
}

async function listSessions(userId, type) {
  let sessions;
  if (isMongoReady()) {
    sessions = await Session.find({ $or: [{ user1: userId }, { user2: userId }] })
      .populate('user1 user2')
      .sort({ scheduledDate: 1, scheduledTime: 1 });
  } else {
    sessions = memory.sessions
      .filter((session) => session.user1 === String(userId) || session.user2 === String(userId))
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  }

  return filterSessions(sessions.map((session) => serializeSession(session, userId)), type);
}

async function updateSession(sessionId, userId, updates) {
  const session = await getSessionById(sessionId, userId);
  if (!session) throw appError('Session not found.', 404);
  const allowed = ['skillFocus', 'duration', 'notes', 'scheduledDate', 'scheduledTime', 'googleMeetLink', 'zoomLink', 'meetingLink', 'status'];
  const payload = {};
  allowed.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(updates, key)) payload[key] = updates[key];
  });

  if (isMongoReady()) {
    await Session.findByIdAndUpdate(sessionId, payload, { runValidators: true });
  } else {
    const raw = memory.sessions.find((item) => item._id === String(sessionId));
    Object.assign(raw, payload, { updatedAt: new Date() });
  }
  return getSessionById(sessionId, userId);
}

async function completeSession(sessionId, userId) {
  const session = await getSessionById(sessionId, userId);
  if (!session) throw appError('Session not found.', 404);

  if (isMongoReady()) {
    const existing = await Session.findById(sessionId);
    const firstCompletion = existing.status !== 'completed';
    existing.status = 'completed';
    existing.completedAt = new Date();
    await existing.save();
    if (firstCompletion) {
      await User.updateMany({ _id: { $in: [existing.user1, existing.user2] } }, { $inc: { totalSessions: 1, totalSessionsAsTeacher: 1, totalSessionsAsLearner: 1 } });
      for (const participantId of [existing.user1, existing.user2]) {
        const user = await User.findById(participantId);
        user.badges = evaluateBadges(user.toObject());
        await user.save();
      }
    }
    return getSessionById(sessionId, userId);
  }

  const raw = memory.sessions.find((item) => item._id === String(sessionId));
  const firstCompletion = raw.status !== 'completed';
  raw.status = 'completed';
  raw.completedAt = new Date();
  raw.updatedAt = new Date();

  if (firstCompletion) {
    [raw.user1, raw.user2].forEach((participantId) => {
      const user = getMemoryUserRaw(participantId);
      user.totalSessions += 1;
      user.totalSessionsAsTeacher += 1;
      user.totalSessionsAsLearner += 1;
      user.badges = evaluateBadges(user);
      user.updatedAt = new Date();
    });
  }

  return getSessionById(sessionId, userId);
}

async function cancelSession(sessionId, userId, cancellationReason = '') {
  const session = await getSessionById(sessionId, userId);
  if (!session) throw appError('Session not found.', 404);

  const payload = {
    status: 'cancelled',
    cancelledAt: new Date(),
    cancelledBy: userId,
    cancellationReason
  };

  if (isMongoReady()) await Session.findByIdAndUpdate(sessionId, payload);
  else Object.assign(memory.sessions.find((item) => item._id === String(sessionId)), payload, { updatedAt: new Date() });
  return getSessionById(sessionId, userId);
}

async function updateUserRatingAndBadges(userId) {
  if (isMongoReady()) {
    const reviews = await Review.find({ revieweeId: userId });
    const ratingCount = reviews.length;
    const averageRating = ratingCount ? reviews.reduce((sum, review) => sum + review.rating, 0) / ratingCount : 0;
    const user = await User.findById(userId);
    user.ratingCount = ratingCount;
    user.averageRating = Number(averageRating.toFixed(2));
    user.badges = evaluateBadges(user.toObject());
    await user.save();
    return publicUser(user);
  }

  const reviews = memory.reviews.filter((review) => review.revieweeId === String(userId));
  const user = getMemoryUserRaw(userId);
  user.ratingCount = reviews.length;
  user.averageRating = reviews.length ? Number((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(2)) : 0;
  user.badges = evaluateBadges(user);
  user.updatedAt = new Date();
  return publicUser(user);
}

async function createReview(userId, input) {
  const session = await getSessionById(input.sessionId, userId);
  if (!session) throw appError('Session not found.', 404);
  if (session.status !== 'completed') throw appError('Mark the session complete before reviewing.', 409);
  const revieweeId = session.user1 === String(userId) ? session.user2 : session.user1;

  if (isMongoReady()) {
    const existing = await Review.findOne({ sessionId: input.sessionId, reviewerId: userId });
    if (existing) throw appError('You already reviewed this session.', 409);
    const review = await Review.create({
      sessionId: input.sessionId,
      reviewerId: userId,
      revieweeId,
      rating: Number(input.rating),
      skillQuality: Number(input.skillQuality || input.rating),
      communication: Number(input.communication || input.rating),
      punctuality: Number(input.punctuality || input.rating),
      comment: input.comment || '',
      wouldRecommend: input.wouldRecommend !== false,
      skillTaught: input.skillTaught || session.skillFocus
    });
    await updateUserRatingAndBadges(revieweeId);
    await createNotification(revieweeId, 'REVIEW', 'You received a new SkillSwap review.', { reviewId: review._id });
    return serializeReview(await Review.findById(review._id).populate('reviewerId revieweeId'));
  }

  if (memory.reviews.some((review) => review.sessionId === String(input.sessionId) && review.reviewerId === String(userId))) {
    throw appError('You already reviewed this session.', 409);
  }
  const now = new Date();
  const review = {
    _id: id(),
    sessionId: String(input.sessionId),
    reviewerId: String(userId),
    revieweeId,
    rating: Number(input.rating),
    skillQuality: Number(input.skillQuality || input.rating),
    communication: Number(input.communication || input.rating),
    punctuality: Number(input.punctuality || input.rating),
    comment: input.comment || '',
    wouldRecommend: input.wouldRecommend !== false,
    skillTaught: input.skillTaught || session.skillFocus,
    createdAt: now,
    updatedAt: now
  };
  memory.reviews.push(review);
  await updateUserRatingAndBadges(revieweeId);
  await createNotification(revieweeId, 'REVIEW', 'You received a new SkillSwap review.', { reviewId: review._id });
  return serializeReview(review);
}

async function listSessionReviews(sessionId) {
  if (isMongoReady()) {
    return (await Review.find({ sessionId }).populate('reviewerId revieweeId').sort({ createdAt: -1 })).map(serializeReview);
  }
  return memory.reviews.filter((review) => review.sessionId === String(sessionId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(serializeReview);
}

async function listUserReviews(userId) {
  if (isMongoReady()) {
    return (await Review.find({ revieweeId: userId }).populate('reviewerId revieweeId').sort({ createdAt: -1 })).map(serializeReview);
  }
  return memory.reviews.filter((review) => review.revieweeId === String(userId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(serializeReview);
}

async function updateReview(reviewId, userId, updates) {
  if (isMongoReady()) {
    const review = await Review.findById(reviewId);
    if (!review) throw appError('Review not found.', 404);
    if (String(review.reviewerId) !== String(userId)) throw appError('Only the reviewer can edit this review.', 403);
    Object.assign(review, updates);
    await review.save();
    await updateUserRatingAndBadges(review.revieweeId);
    return serializeReview(await Review.findById(review._id).populate('reviewerId revieweeId'));
  }

  const review = memory.reviews.find((item) => item._id === String(reviewId));
  if (!review) throw appError('Review not found.', 404);
  if (review.reviewerId !== String(userId)) throw appError('Only the reviewer can edit this review.', 403);
  Object.assign(review, updates, { updatedAt: new Date() });
  await updateUserRatingAndBadges(review.revieweeId);
  return serializeReview(review);
}

async function deleteReview(reviewId, userId) {
  if (isMongoReady()) {
    const review = await Review.findById(reviewId);
    if (!review) throw appError('Review not found.', 404);
    if (String(review.reviewerId) !== String(userId)) throw appError('Only the reviewer can delete this review.', 403);
    const revieweeId = review.revieweeId;
    await review.deleteOne();
    await updateUserRatingAndBadges(revieweeId);
    return true;
  }

  const review = memory.reviews.find((item) => item._id === String(reviewId));
  if (!review) throw appError('Review not found.', 404);
  if (review.reviewerId !== String(userId)) throw appError('Only the reviewer can delete this review.', 403);
  memory.reviews = memory.reviews.filter((item) => item._id !== String(reviewId));
  await updateUserRatingAndBadges(review.revieweeId);
  return true;
}

async function getLeaderboard(sort = 'sessions') {
  const users = await listUsers();
  const sorted = users.sort((a, b) => {
    if (sort === 'rating') return (b.averageRating || 0) - (a.averageRating || 0);
    if (sort === 'badges') return (b.badges?.length || 0) - (a.badges?.length || 0);
    return (b.totalSessions || 0) - (a.totalSessions || 0);
  });
  return sorted.map((user, index) => ({ ...user, rank: index + 1 }));
}

async function listNotifications(userId) {
  if (isMongoReady()) {
    return clone(await Notification.find({ userId }).sort({ createdAt: -1 }).limit(30));
  }
  return memory.notifications.filter((notification) => notification.userId === String(userId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function markNotificationRead(notificationId, userId) {
  if (isMongoReady()) {
    return clone(await Notification.findOneAndUpdate({ _id: notificationId, userId }, { read: true }, { new: true }));
  }
  const notification = memory.notifications.find((item) => item._id === String(notificationId) && item.userId === String(userId));
  if (notification) notification.read = true;
  return clone(notification);
}

async function resetDemoData() {
  if (isMongoReady()) {
    await Promise.all([
      User.deleteMany({}),
      Match.deleteMany({}),
      Message.deleteMany({}),
      Session.deleteMany({}),
      Review.deleteMany({}),
      Notification.deleteMany({})
    ]);
  } else {
    memory.users = [];
    memory.matches = [];
    memory.messages = [];
    memory.sessions = [];
    memory.reviews = [];
    memory.notifications = [];
  }
}

async function ensureDemoData() {
  const userCount = isMongoReady() ? await User.countDocuments() : memory.users.length;
  if (userCount > 0) return;

  const arjun = await createUser({
    name: 'Arjun Mehta',
    email: 'arjun@demo.com',
    password: 'password123',
    college: 'National Institute of Technology',
    bio: 'Backend developer who likes making data structures feel less scary.',
    skillsOffered: [{ skill: 'Python', proficiency: 'Expert' }, { skill: 'Data Structures', proficiency: 'Expert' }],
    skillsWanted: ['UI Design', 'Public Speaking'],
    totalSessions: 8,
    totalSessionsAsTeacher: 5,
    totalSessionsAsLearner: 3,
    averageRating: 4.8,
    ratingCount: 6,
    isOnline: true
  });

  const priya = await createUser({
    name: 'Priya Raman',
    email: 'priya@demo.com',
    password: 'password123',
    college: 'Design School of Bangalore',
    bio: 'Product designer who teaches usable interfaces and wants to level up in Python.',
    skillsOffered: [{ skill: 'UI Design', proficiency: 'Expert' }, { skill: 'Figma', proficiency: 'Expert' }],
    skillsWanted: ['Python', 'Data Structures'],
    totalSessions: 12,
    totalSessionsAsTeacher: 7,
    totalSessionsAsLearner: 5,
    averageRating: 4.9,
    ratingCount: 9,
    isOnline: true,
    isVerified: true
  });

  await createUser({
    name: 'Rahul Nair',
    email: 'rahul@demo.com',
    password: 'password123',
    college: 'City Engineering College',
    bio: 'Frontend tinkerer learning cloud fundamentals.',
    skillsOffered: [{ skill: 'React', proficiency: 'Intermediate' }, { skill: 'JavaScript', proficiency: 'Expert' }],
    skillsWanted: ['AWS', 'System Design'],
    totalSessions: 5,
    totalSessionsAsTeacher: 3,
    totalSessionsAsLearner: 2,
    averageRating: 4.5,
    ratingCount: 4
  });

  await createUser({
    name: 'Aisha Khan',
    email: 'aisha@demo.com',
    password: 'password123',
    college: 'Metro Arts University',
    bio: 'Communications coach trading presentation practice for React help.',
    skillsOffered: [{ skill: 'Public Speaking', proficiency: 'Expert' }, { skill: 'Storytelling', proficiency: 'Intermediate' }],
    skillsWanted: ['React', 'JavaScript'],
    totalSessions: 6,
    totalSessionsAsTeacher: 4,
    totalSessionsAsLearner: 2,
    averageRating: 4.7,
    ratingCount: 5
  });

  const match = await createMatch(arjun._id, priya._id);
  await updateMatchStatus(match._id, priya._id, 'accepted');
  await createMessage(match._id, arjun._id, 'Hey Priya, I can help with Python basics this week.');
  await createMessage(match._id, priya._id, 'Perfect. I can review your dashboard layout in return.');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await createSession(arjun._id, {
    matchId: match._id,
    skillFocus: 'Python fundamentals and dashboard critique',
    duration: 60,
    scheduledDate: tomorrow,
    scheduledTime: '17:00',
    meetingLink: 'https://meet.google.com/demo-skill-swap',
    notes: 'Bring one Python exercise and one screen you want design feedback on.'
  });
}

module.exports = {
  appError,
  ensureDemoData,
  resetDemoData,
  createUser,
  authenticateUser,
  getUserById,
  updateUser,
  deleteUser,
  listUsers,
  addSkill,
  removeSkill,
  getRecommendations,
  createMatch,
  getMatchById,
  listUserMatches,
  updateMatchStatus,
  deleteMatch,
  createMessage,
  listMessages,
  markMessageRead,
  getUnreadCount,
  deleteMessage,
  createSession,
  getSessionById,
  listSessions,
  updateSession,
  completeSession,
  cancelSession,
  createReview,
  listSessionReviews,
  listUserReviews,
  updateReview,
  deleteReview,
  getLeaderboard,
  listNotifications,
  markNotificationRead
};
