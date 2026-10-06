import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuiz, getSession, saveSession } from "../store";
import { publish, subscribe } from "../realtime";
import Leaderboard from "../components/Leaderboard.jsx";

export default function HostLive() {
  const { code } = useParams();
  const [session, setSession] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [question, setQuestion] = useState(null);
  const [board, setBoard] = useState([]);
  const [feed, setFeed] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const s = getSession(code);
    if (!s) return;
    const q = getQuiz(s.quizId);
    setSession(s);
    setQuiz(q);
  }, [code]);

  useEffect(() => {
    const unsub = subscribe((msg) => {
      if (!msg.payload || msg.payload.code !== code) return;

      if (msg.type === "player:join") {
        const { nickname } = msg.payload;
        const cur = getSession(code);
        if (!cur) return;
        cur.participants[nickname] =
          cur.participants[nickname] || { nickname, score: 0 };
        saveSession(cur);
        setSession({ ...cur });
      }

      if (msg.type === "player:answer") {
        const { nickname, questionId, answerIndex, timeMs } = msg.payload;
        const cur = getSession(code);
        if (!cur) return;
        const qz = getQuiz(cur.quizId);
        const q = qz.questions.find((x) => x.id === questionId);
        if (!q) return;
        const correct = q.correctIndex === answerIndex;
        let points = 0;
        if (correct) {
          const speedBonus = Math.max(0, 1000 - Math.floor(timeMs / 20));
          points = 500 + Math.floor(speedBonus / 2);
        }
        cur.participants[nickname] =
          cur.participants[nickname] || { nickname, score: 0 };
        cur.participants[nickname].score += points;
        saveSession(cur);
        setSession({ ...cur });
        setBoard(
          Object.values(cur.participants)
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((p, i) => ({
              rank: i + 1,
              nickname: p.nickname,
              score: p.score,
            }))
        );
        setFeed((f) =>
          [{ nickname, correct, points, id: Math.random() }, ...f].slice(0, 8)
        );
      }
    });
    return unsub;
  }, [code]);

  const pushQuestion = (index) => {
    const cur = getSession(code);
    const qz = getQuiz(cur.quizId);
    if (index >= qz.questions.length) return endSession();
    const q = qz.questions[index];
    const payload = {
      code,
      index,
      total: qz.questions.length,
      id: q.id,
      prompt: q.prompt,
      options: q.options,
      timeLimit: q.timeLimit || 20,
    };
    setQuestion(payload);
    setTimeLeft(payload.timeLimit);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    publish("question:show", payload);
  };

  const start = () => {
    const cur = getSession(code);
    cur.status = "active";
    cur.currentIndex = 0;
    saveSession(cur);
    setSession({ ...cur });
    pushQuestion(0);
  };

  const next = () => {
    const cur = getSession(code);
    cur.currentIndex += 1;
    saveSession(cur);
    setSession({ ...cur });
    pushQuestion(cur.currentIndex);
  };

  const endSession = () => {
    const cur = getSession(code);
    if (!cur) return;
    cur.status = "ended";
    saveSession(cur);
    setSession({ ...cur });
    setQuestion(null);
    clearInterval(timerRef.current);
    publish("session:ended", { code });
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  if (!session || !quiz)
    return (
      <p>
        Session not found. <Link to="/quizzes">Back</Link>
      </p>
    );

  const players = Object.values(session.participants || {});

  return (
    <div>
      <h1>Hosting Live</h1>
      <div className="card">
        <p>Share this code with players:</p>
        <div className="code">{code}</div>
        <p className="muted">
          Players join at <code>/join/{code}</code> (open in another tab)
        </p>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <h3>Players ({players.length})</h3>
            <ul className="players">
              {players.map((p) => (
                <li key={p.nickname}>{p.nickname}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3>Live Feed</h3>
            {feed.length === 0 && <p className="muted">Waiting for answers...</p>}
            <ul className="feed">
              {feed.map((f) => (
                <li key={f.id}>
                  <b>{f.nickname}</b> {f.correct ? "✅" : "❌"} +{f.points}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          {session.status === "lobby" && (
            <div className="card center">
              <h2>Lobby</h2>
              <p className="muted">Waiting to start...</p>
              <button
                className="btn primary"
                onClick={start}
                disabled={players.length === 0}
              >
                Start Quiz
              </button>
            </div>
          )}

          {session.status === "active" && question && (
            <div className="card">
              <div className="row between">
                <p className="muted">
                  Question {question.index + 1} / {question.total}
                </p>
                <span className={`timer ${timeLeft <= 5 ? "warn" : ""}`}>
                  {timeLeft}s
                </span>
              </div>
              <h2>{question.prompt}</h2>
              <ul className="options-readonly">
                {question.options.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
              <div className="row gap">
                <button className="btn primary" onClick={next}>
                  Next Question →
                </button>
                <button className="btn danger" onClick={endSession}>
                  End
                </button>
              </div>
            </div>
          )}

          {session.status === "ended" && (
            <div className="card center">
              <h2>Quiz Ended 🎉</h2>
              <Link to="/quizzes" className="btn primary">
                Back to Quizzes
              </Link>
            </div>
          )}

          <Leaderboard entries={board} />
        </div>
      </div>
    </div>
  );
}