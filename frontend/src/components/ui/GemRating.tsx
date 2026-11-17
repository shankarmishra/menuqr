import { useRef, useState, type KeyboardEvent } from 'react';
import './premium.css';

interface Props {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
}

/** 1..max rating with gem icons. A radio group: arrows move, Enter/Space or click chooses. */
export default function GemRating({ value, onChange, max = 5, label = 'Rating' }: Props) {
  const [hover, setHover] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const shown = hover || value;

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, n: number) {
    let next = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(max, n + 1);
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(1, n - 1);
    if (!next) return;
    e.preventDefault();
    onChange(next);
    refs.current[next - 1]?.focus();
  }

  return (
    <div className="mq-gems" role="radiogroup" aria-label={label} onMouseLeave={() => setHover(0)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          ref={(el) => { refs.current[n - 1] = el; }}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} of ${max}`}
          tabIndex={value === n || (value === 0 && n === 1) ? 0 : -1}
          className="mq-gem"
          data-lit={n <= shown}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onKeyDown={(e) => onKeyDown(e, n)}
        >
          <svg viewBox="0 0 32 32" aria-hidden="true">
            <path className="mq-gem__face" strokeWidth="1.5" d="M8 4h16l6 8-14 17L2 12z" />
            <path className="mq-gem__shine" d="M8 4h8l-4 8H2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}
