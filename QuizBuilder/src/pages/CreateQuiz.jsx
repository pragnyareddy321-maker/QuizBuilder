import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QuestionEditor from "../components/QuestionEditor.jsx";
import { getQuiz, nanoid, upsertQuiz } from "../store";

const blankQuestion = () => ({
  id: nanoid(),
  type: "mc",
  prompt: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  timeLimit: 20,
});

export default function CreateQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([blankQuestion()]);
  const [quizId, setQuizId] = useState(id || nanoid());

  useEffect(() => {
    if (id) {
      const q = getQuiz(id);
      if (q) {
        setTitle(q.title);
        setDescription(q.description);
        setQuestions(q.questions);
        setQuizId(q.id);
      }
    }
  }, [id]);

  const updateQuestion = (i, q) => {
    const copy = [...questions];
    copy[i] = q;
    setQuestions(copy);
  };

  const addQuestion = () => setQuestions([...questions, blankQuestion()]);
  const removeQuestion = (i) =>
    setQuestions(questions.filter((_, idx) => idx !== i));

  const save = () => {
    if (!title.trim()) return alert("Please enter a title");
    const invalid = questions.some(
      (q) => !q.prompt.trim() || q.options.some((o) => !o.trim())
    );
    if (invalid) return alert("Please fill in all prompts and options");

    upsertQuiz({
      id: quizId,
      title,
      description,
      questions,
      updatedAt: Date.now(),
    });
    navigate("/quizzes");
  };

  return (
    <div>
      <h1>{id ? "Edit Quiz" : "Create Quiz"}</h1>
      <div className="card">
        <label>Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Quiz"
        />
        <label>Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </div>

      {questions.map((q, i) => (
        <QuestionEditor
          key={q.id}
          question={q}
          index={i}
          onChange={(nq) => updateQuestion(i, nq)}
          onRemove={() => removeQuestion(i)}
        />
      ))}

      <div className="row gap">
        <button className="btn" onClick={addQuestion}>+ Add Question</button>
        <button className="btn primary" onClick={save}>Save Quiz</button>
      </div>
    </div>
  );
}