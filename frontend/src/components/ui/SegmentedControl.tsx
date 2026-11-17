import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import './premium.css';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
}

interface Props<T extends string> {
  options: Array<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/** Liquid segmented control: a radio group whose highlight slides to the chosen option. */
export default function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel }: Props<T>) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const width = `calc((100% - 8px) / ${options.length})`;

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % options.length;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + options.length) % options.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = options.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  }

  return (
    <div className="mq-seg" role="radiogroup" aria-label={ariaLabel}>
      <span className="mq-seg__blob" aria-hidden="true" style={{ width, transform: `translateX(${index * 100}%)` }} />
      {options.map((option, i) => (
        <button
          key={option.value}
          ref={(el) => { refs.current[i] = el; }}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          tabIndex={option.value === value ? 0 : -1}
          className="mq-seg__btn"
          onClick={() => onChange(option.value)}
          onKeyDown={(e) => onKeyDown(e, i)}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
