const QUIZ_KEY = "qb.quizzes";
const SESSION_KEY = "qb.sessions";

export function nanoid(len = 10) {
  return Math.random().toString(36).slice(2, 2 + len);
}

export function listQuizzes() {
  try {
    return JSON.parse(localStorage.getItem(QUIZ_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveQuizzes(quizzes) {
  localStorage.setItem(QUIZ_KEY, JSON.stringify(quizzes));
}

export function getQuiz(id) {
  return listQuizzes().find((q) => q.id === id);
}

export function upsertQuiz(quiz) {
  const all = listQuizzes();
  const idx = all.findIndex((q) => q.id === quiz.id);
  if (idx >= 0) all[idx] = quiz;
  else all.unshift(quiz);
  saveQuizzes(all);
  return quiz;
}

export function deleteQuiz(id) {
  saveQuizzes(listQuizzes().filter((q) => q.id !== id));
}

// ---- Sessions (live host state) ----
export function listSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
  } catch {
    return {};
  }
}

export function getSession(code) {
  return listSessions()[code?.toUpperCase()];
}

export function saveSession(session) {
  const all = listSessions();
  all[session.code] = session;
  localStorage.setItem(SESSION_KEY, JSON.stringify(all));
}

export function deleteSession(code) {
  const all = listSessions();
  delete all[code.toUpperCase()];
  localStorage.setItem(SESSION_KEY, JSON.stringify(all));
}