import './premium.css';

interface Props {
  value: number;
  /** Text before the number, e.g. "₹". */
  prefix?: string;
  fractionDigits?: number;
  className?: string;
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/** Formats like en-IN money (₹1,23,456.00). Exported for tests. */
export function formatOdometerText(value: number, fractionDigits = 0): string {
  const safe = Number.isFinite(value) ? value : 0;
  return safe.toLocaleString('en-IN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits });
}

/**
 * A price whose digits roll like an odometer when the value changes. Screen readers get the plain
 * value once; the rolling reels are hidden from them.
 */
export default function OdometerNumber({ value, prefix = '', fractionDigits = 0, className = '' }: Props) {
  const text = formatOdometerText(value, fractionDigits);
  return (
    <span className={`mq-odo ${className}`}>
      <span className="mq-sr-only">{prefix}{text}</span>
      <span aria-hidden="true" style={{ display: 'inline-flex' }}>
        {prefix && <span>{prefix}</span>}
        {Array.from(text).map((ch, i) => {
          const digit = DIGITS.indexOf(ch);
          if (digit < 0) return <span key={`s${i}`}>{ch}</span>;
          return (
            <span key={`d${text.length - i}`} className="mq-odo__col">
              <span className="mq-odo__reel" style={{ transform: `translateY(-${digit}em)` }}>
                {DIGITS.map((d) => <span key={d}>{d}</span>)}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
