export default function Leaderboard({ entries = [] }) {
  return (
    <div className="card">
      <h3>🏆 Leaderboard</h3>
      {entries.length === 0 ? (
        <p className="muted">No scores yet.</p>
      ) : (
        <ol className="leaderboard">
          {entries.map((e) => (
            <li key={e.nickname + e.rank}>
              <span className="rank">#{e.rank}</span>
              <span className="name">{e.nickname}</span>
              <span className="score">{e.score}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}