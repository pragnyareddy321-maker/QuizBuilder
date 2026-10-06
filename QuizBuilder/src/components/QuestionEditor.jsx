export default function QuestionEditor({ question, index, onChange, onRemove }) {
  const update = (patch) => onChange({ ...question, ...patch });

  const updateOption = (i, value) => {
    const options = [...question.options];
    options[i] = value;
    update({ options });
  };

  const addOption = () => update({ options: [...question.options, ""] });

  const removeOption = (i) => {
    const options = question.options.filter((_, idx) => idx !== i);
    let correctIndex = question.correctIndex;
    if (i === correctIndex) correctIndex = 0;
    else if (i < correctIndex) correctIndex -= 1;
    update({ options, correctIndex });
  };

  return (
    <div className="card question-editor">
      <div className="row between">
        <h3>Question {index + 1}</h3>
        <button className="btn danger small" onClick={onRemove}>
          Remove
        </button>
      </div>

      <label>Type</label>
      <select
        value={question.type}
        onChange={(e) => {
          const type = e.target.value;
          if (type === "tf")
            update({ type, options: ["True", "False"], correctIndex: 0 });
          else update({ type });
        }}
      >
        <option value="mc">Multiple Choice</option>
        <option value="tf">True / False</option>
      </select>

      <label>Prompt</label>
      <input
        type="text"
        value={question.prompt}
        onChange={(e) => update({ prompt: e.target.value })}
        placeholder="Enter your question..."
      />

      <label>Options (select the correct one)</label>
      {question.options.map((opt, i) => (
        <div key={i} className="row gap">
          <input
            type="radio"
            name={`correct-${question.id}`}
            checked={question.correctIndex === i}
            onChange={() => update({ correctIndex: i })}
            title="Mark as correct"
          />
          <input
            type="text"
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            disabled={question.type === "tf"}
          />
          {question.type !== "tf" && question.options.length > 2 && (
            <button className="btn small" onClick={() => removeOption(i)}>
              ✕
            </button>
          )}
        </div>
      ))}

      {question.type !== "tf" && (
        <button className="btn small" onClick={addOption}>
          + Add Option
        </button>
      )}

      <label>Time Limit (seconds)</label>
      <input
        type="number"
        min="5"
        max="120"
        value={question.timeLimit || 20}
        onChange={(e) => update({ timeLimit: Number(e.target.value) })}
      />
    </div>
  );
}