import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import QuizList from "./pages/QuizList.jsx";
import CreateQuiz from "./pages/CreateQuiz.jsx";
import TakeQuiz from "./pages/TakeQuiz.jsx";
import HostLive from "./pages/HostLive.jsx";
import JoinLive from "./pages/JoinLive.jsx";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quizzes" element={<QuizList />} />
          <Route path="/create" element={<CreateQuiz />} />
          <Route path="/edit/:id" element={<CreateQuiz />} />
          <Route path="/take/:id" element={<TakeQuiz />} />
          <Route path="/host/:code" element={<HostLive />} />
          <Route path="/join" element={<JoinLive />} />
          <Route path="/join/:code" element={<JoinLive />} />
        </Routes>
      </main>
    </div>
  );
}