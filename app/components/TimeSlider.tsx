"use client";

type Props = {
  value: number;
  onChange: (v: number) => void;
};

export default function TimeSlider({ value, onChange }: Props) {
  return (
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", maxWidth: 500 }}
    />
  );
}
