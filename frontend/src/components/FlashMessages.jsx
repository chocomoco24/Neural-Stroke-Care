import { useFlash } from '../context/FlashContext';

export default function FlashMessages() {
  const { messages, dismiss } = useFlash();
  if (!messages.length) return null;

  return (
    <div className="flash-stack">
      {messages.map(m => (
        <div key={m.id} className={`alert alert-${m.type}`}>
          <span>{m.text}</span>
          <button className="alert-close" onClick={() => dismiss(m.id)}>
            <i className="fas fa-times" />
          </button>
        </div>
      ))}
    </div>
  );
}
