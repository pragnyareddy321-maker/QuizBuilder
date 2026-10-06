import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuiz } from "../store";

export default function TakeQuiz() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  useEffect(() => setQuiz(getQuiz(id)), [id]);

  const score = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correctIndex ? 1 : 0),
      0
    );
  }, [answers, quiz]);

  if (!quiz) return <p>Quiz not found.</p>;

  if (done) {
    return (
      <div className="card center">
        <h1>Quiz Complete 🎉</h1>
        <p className="big">
          {score} / {quiz.questions.length} correct
        </p>
        <Link to="/quizzes" className="btn primary">Back to Quizzes</Link>
      </div>
    );
  }

  const q = quiz.questions[current];
  const select = (idx) => setAnswers({ ...answers, [current]: idx });
  const next = () => {
    if (current + 1 >= quiz.questions.length) setDone(true);
    else setCurrent(current + 1);
  };

  return (
    <div>
      <h1>{quiz.title}</h1>
      <p className="muted">
        Question {current + 1} of {quiz.questions.length}
      </p>
      <div className="card">
        <h2>{q.prompt}</h2>
        <div className="options">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`option ${answers[current] === i ? "selected" : ""}`}
              onClick={() => select(i)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
      <button
        className="btn primary"
        onClick={next}
        disabled={answers[current] === undefined}
      >
        {current + 1 >= quiz.questions.length ? "Finish" : "Next"}
      </button>
    </div>
  );
}