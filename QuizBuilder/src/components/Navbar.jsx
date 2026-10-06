import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="brand">🧠 Quiz Builder</Link>
      <div className="nav-links">
        <Link to="/quizzes">My Quizzes</Link>
        <Link to="/create">Create</Link>
        <Link to="/join">Join Live</Link>
      </div>
    </nav>
  );
}