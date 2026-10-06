import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="home">
      <h1>Create and Host Interactive Quizzes</h1>
      <p className="muted">
        Build quizzes, share a link, or run a live game with friends and students.
      </p>
      <div className="row gap">
        <Link to="/create" className="btn primary">Create a Quiz</Link>
        <Link to="/join" className="btn">Join Live</Link>
      </div>
      <p className="muted small" style={{ marginTop: 24 }}>
        💡 Live mode works across browser tabs — open <b>/join</b> in another tab.
      </p>
    </div>
  );
}