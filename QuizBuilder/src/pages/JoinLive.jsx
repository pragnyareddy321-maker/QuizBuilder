import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSession, getQuiz } from "../store";
import { publish, subscribe } from "../realtime";

export default function JoinLive() {
  const { code: paramCode } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(paramCode || "");
  const [nickname, setNickname] = useState("");
  const [joined, setJoined] = useState(false);
  const [question, setQuestion] = useState(null);
  const [result, setResult] = useState(null);
  const [ended, setEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const startRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!joined) return;
    const upperCode = code.toUpperCase();
    const unsub = subscribe((msg) => {
      if (!msg.payload || msg.payload.code !== upperCode) return;

      if (msg.type === "question:show") {
        setQuestion(msg.payload);
        setResult(null);
        startRef.current = Date.now();
        setTimeLeft(msg.payload.timeLimit);
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
      }

      if (msg.type === "session:ended") {
        setEnded(true);
        setQuestion(null);
        clearInterval(timerRef.current);
      }
    });
    return () => {
      unsub();
      clearInterval(timerRef.current);
    };
  }, [joined, code]);

  const join = () => {
    const c = code.trim().toUpperCase();
    if (!c || !nickname.trim()) return alert("Enter code and nickname");
    const s = getSession(c);
    if (!s) return alert("Session not found");
    setCode(c);
    setJoined(true);
    publish("player:join", { code: c, nickname: nickname.trim() });
    navigate(`/join/${c}`, { replace: true });
  };

  const answer = (idx) => {
    if (!question || result) return;
    const timeMs = Date.now() - startRef.current;
    publish("player:answer", {
      code: code.toUpperCase(),
      nickname,
      questionId: question.id,
      answerIndex: idx,
      timeMs,
    });

    // Local preview score
    const session = getSession(code.toUpperCase());
    const quiz = getQuiz(session.quizId);
    const q = quiz.questions.find((x) => x.id === question.id);
    const correct = q.correctIndex === idx;
    const speedBonus = Math.max(0, 1000 - Math.floor(timeMs / 20));
    const points = correct ? 500 + Math.floor(speedBonus / 2) : 0;
    setResult({ correct, points });
    setScore((s) => s + points);
    clearInterval(timerRef.current);
  };

  if (!joined) {
    return (
      <div className="card center">
        <h1>Join a Live Quiz</h1>
        <label>Game Code</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC123"
          maxLength={6}
        />
        <label>Nickname</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="Your name"
        />
        <button className="btn primary" onClick={join}>
          Join
        </button>
      </div>
    );
  }

  if (ended) {
    return (
      <div className="card center">
        <h1>Quiz Ended</h1>
        <p className="big">Your Score: {score}</p>
        <button
          className="btn primary"
          onClick={() => {
            setEnded(false);
            setJoined(false);
            setScore(0);
            setNickname("");
            setCode("");
            navigate("/join");
          }}
        >
          Join Another Quiz
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="card center">
        <h2>Waiting for host to start...</h2>
        <p className="muted">Nickname: {nickname}</p>
        <p className="big">Score: {score}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="row between">
        <span className="muted">
          Q {question.index + 1} / {question.total}
        </span>
        <span className={`timer ${timeLeft <= 5 ? "warn" : ""}`}>
          {timeLeft}s
        </span>
      </div>

      <div className="card">
        <h2>{question.prompt}</h2>
        <div className="options">
          {question.options.map((opt, i) => (
            <button
              key={i}
              className="option"
              disabled={result !== null}
              onClick={() => answer(i)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div className={`card center ${result.correct ? "success" : "fail"}`}>
          <h3>{result.correct ? "✅ Correct!" : "❌ Wrong"}</h3>
          <p>+{result.points} points</p>
          <p className="muted">Total: {score}</p>
          <p className="muted small">Waiting for next question...</p>
        </div>
      )}
    </div>
  );
}