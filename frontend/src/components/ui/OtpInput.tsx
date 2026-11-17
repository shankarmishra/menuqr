import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import './premium.css';

interface Props {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  /** Seconds until the code expires; shows an hourglass countdown. */
  expiresInSeconds?: number;
  invalid?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Called once all cells are filled. */
  onComplete?: (value: string) => void;
}

/** Keeps only digits and cuts to length. Exported for tests. */
export function sanitizeOtp(raw: string, length: number): string {
  return String(raw || '').replace(/\D/g, '').slice(0, length);
}

export function formatCountdown(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** One box per digit; paste fills all boxes; Backspace walks back; phone keyboards get digits and SMS autofill. */
export default function OtpInput({
  value, onChange, length = 6, expiresInSeconds, invalid = false, disabled = false, autoFocus = false, onComplete,
}: Props) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const [left, setLeft] = useState(expiresInSeconds ?? 0);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (expiresInSeconds === undefined) return;
    setLeft(expiresInSeconds);
    const started = Date.now();
    const id = window.setInterval(() => {
      const remaining = expiresInSeconds - (Date.now() - started) / 1000;
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) window.clearInterval(id);
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresInSeconds]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
  }, [autoFocus]);

  function setAt(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    const joined = next.join('').slice(0, length);
    onChange(joined);
    if (joined.length === length && onComplete) onComplete(joined);
  }

  function handleInput(index: number, raw: string) {
    const clean = sanitizeOtp(raw, length);
    if (clean.length > 1) {
      const filled = (value.slice(0, index) + clean).slice(0, length);
      onChange(filled);
      refs.current[Math.min(filled.length, length - 1)]?.focus();
      if (filled.length === length && onComplete) onComplete(filled);
      return;
    }
    setAt(index, clean);
    if (clean && index < length - 1) refs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      e.preventDefault();
      setAt(index - 1, '');
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    const clean = sanitizeOtp(e.clipboardData.getData('text'), length);
    if (!clean) return;
    e.preventDefault();
    onChange(clean);
    refs.current[Math.min(clean.length, length - 1)]?.focus();
    if (clean.length === length && onComplete) onComplete(clean);
  }

  const total = expiresInSeconds ?? 0;
  const fraction = total > 0 ? left / total : 0;

  return (
    <div className="mq-otp" data-invalid={invalid}>
      <div className="mq-otp__cells" role="group" aria-label={`${length}-digit code`}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className="mq-otp__cell"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            pattern="[0-9]*"
            maxLength={i === 0 ? length : 1}
            aria-label={`Digit ${i + 1}`}
            aria-invalid={invalid || undefined}
            data-filled={Boolean(d)}
            value={d}
            disabled={disabled}
            onChange={(e) => handleInput(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      {expiresInSeconds !== undefined && (
        <div className="mq-otp__timer" aria-live="off">
          <svg className="mq-hourglass" viewBox="0 0 14 18" aria-hidden="true">
            <path d="M1 1h12M1 17h12M2 1c0 5 10 5 10 8s-10 3-10 8M12 1c0 5-10 5-10 8s10 3 10 8" fill="none" stroke="#849a90" strokeWidth="1.2" />
            <rect className="mq-hourglass__sand-top" x="4" y={2 + 5 * (1 - fraction)} width="6" height={5 * fraction} />
            <rect className="mq-hourglass__sand-bottom" x="4" y={16 - 5 * (1 - fraction)} width="6" height={5 * (1 - fraction)} />
          </svg>
          <span>{left > 0 ? `Code expires in ${formatCountdown(left)}` : 'Code expired. Ask for a new one.'}</span>
        </div>
      )}
    </div>
  );
}
