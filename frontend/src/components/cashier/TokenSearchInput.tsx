/**
 * TokenSearchInput.tsx
 * Controlled number input for searching tokens by token number.
 * Shows "Clear" (×) button when value is set.
 */

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function TokenSearchInput({ value, onChange }: Props) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <span
        style={{
          position: 'absolute',
          left: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 16,
          color: '#6b7280',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
        aria-hidden="true"
      >
        🔍
      </span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        placeholder="Search token #..."
        aria-label="Search by token number"
        style={{
          width: '100%',
          padding: '10px 36px 10px 36px',
          fontSize: 15,
          fontFamily: 'Courier Prime, Courier New, monospace',
          fontWeight: 600,
          background: '#1d2723',
          color: '#fcfaf8',
          border: '1.5px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          outline: 'none',
          transition: 'border-color 0.15s',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => { e.target.style.borderColor = '#e8783c'; }}
        onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#9ca3af',
            borderRadius: 6,
            width: 24,
            height: 24,
            cursor: 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
