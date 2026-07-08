type CandidateProcessSelectProps = {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function CandidateProcessSelect({
  label,
  value,
  options,
  onChange,
  disabled,
}: CandidateProcessSelectProps) {
  return (
    <label className="text-sm text-zinc-700">
      {label}
      <select
        className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2"
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
