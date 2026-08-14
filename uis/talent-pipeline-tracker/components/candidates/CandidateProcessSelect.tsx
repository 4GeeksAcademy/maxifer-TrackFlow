type CandidateProcessSelectProps = {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
};

export function CandidateProcessSelect({
  label,
  value,
  options,
  onChange,
  disabled,
  compact,
}: CandidateProcessSelectProps) {
  return (
    <label className="block text-sm font-bold text-[#1b1b1d]">
      {label}
      <select
        className={`mt-1.5 w-full rounded-lg border border-[#c6c6cd] bg-[#fcf8fa] px-3 text-sm font-medium text-[#1b1b1d] disabled:opacity-60 ${compact ? "py-2" : "py-2.5"}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
