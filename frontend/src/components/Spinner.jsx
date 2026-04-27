export default function Spinner({ text = 'Loading...' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span className="text-muted text-small">{text}</span>
    </div>
  );
}
