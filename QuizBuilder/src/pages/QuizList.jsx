import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listQuizzes, deleteQuiz, nanoid, saveSession } from "../store";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const navigate = useNavigate();

  const refresh = () => setQuizzes(listQuizzes());
  useEffect(refresh, []);

  const hostLive = (quiz) => {
    const code = nanoid(6).toUpperCase();
    saveSession({
      code,
      quizId: quiz.id,
      status: "lobby",
      currentIndex: -1,
      participants: {},
      createdAt: Date.now(),
    });
    navigate(`/host/${code}`);
  };

  const remove = (id) => {
    if (confirm("Delete this quiz?")) {
      deleteQuiz(id);
      refresh();
    }
  };

  return (
    <div>
      <h1>My Quizzes</h1>
      {quizzes.length === 0 && (
        <p className="muted">
          No quizzes yet. <Link to="/create">Create one</Link>.
        </p>
      )}
      <div className="grid">
        {quizzes.map((q) => (
          <div className="card" key={q.id}>
            <h3>{q.title}</h3>
            <p className="muted">{q.description}</p>
            <p className="small muted">{q.questions.length} questions</p>
            <div className="row gap">
              <Link to={`/take/${q.id}`} className="btn small">Take</Link>
              <button className="btn primary small" onClick={() => hostLive(q)}>
                Host Live
              </button>
              <Link to={`/edit/${q.id}`} className="btn small">Edit</Link>
              <button className="btn danger small" onClick={() => remove(q.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}