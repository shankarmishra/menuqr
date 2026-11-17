import './premium.css';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name, e.g. "Accept old table stickers". */
  label: string;
  disabled?: boolean;
}

/** On/off switch whose knob moves like a mercury drop. A real switch for screen readers. */
export default function MercurySwitch({ checked, onChange, label, disabled = false }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className="mq-switch"
      onClick={() => onChange(!checked)}
    >
      <span className="mq-switch__drop" aria-hidden="true" />
    </button>
  );
}
