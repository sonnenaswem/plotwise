"use client";

export default function BoroughFilter({
  boroughs,
  value,
  onChange,
}: {
  boroughs: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) =>
        onChange(e.target.value)
      }
      className="border rounded-lg px-3 py-2"
    >
      <option value="">
        All Boroughs
      </option>

      {boroughs.map((borough) => (
        <option
          key={borough}
          value={borough}
        >
          {borough}
        </option>
      ))}
    </select>
  );
}