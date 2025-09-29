"use client";

type Props = {
  onAddScene: () => void;
  xRayEnabled: boolean;
  onToggleXRay: () => void;

  density: number;
  confidence: number;
  onChangeDensity: (v: number) => void;
  onChangeConfidence: (v: number) => void;
};

export default function Sidebar({
  onAddScene,
  xRayEnabled,
  onToggleXRay,
  density,
  confidence,
  onChangeDensity,
  onChangeConfidence,
}: Props) {

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1rem",
      }}
    >
      <div style={{ fontWeight: 600 }}>Sidebar</div>
      <button
  onClick={onToggleXRay}
  style={{
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #d4d4d8",
    background: xRayEnabled ? "#111827" : "#fff",
    color: xRayEnabled ? "#fff" : "#111827",
    cursor: "pointer",
    marginRight: 8,
  }}
>
  {xRayEnabled ? "X-Ray Mode" : "Underground Mode"}
</button>

<button
  onClick={onAddScene}
  style={{
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #d4d4d8",
    background: "#fff",
    cursor: "pointer",
  }}
>
  Add Scene
</button>

<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  {/* Density */}
  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ fontSize: 12, color: "#374151" }}>Density</span>
    <input
      type="number"
      min={0}
      max={100}
      step={1}
      value={density}
      onChange={(e) => onChangeDensity(Number(e.target.value))}
      onWheel={(e) => {
        e.preventDefault();
        const dir = e.deltaY > 0 ? -1 : 1; // wheel up increases
        onChangeDensity(density + dir);
      }}
      style={{
        width: 72,
        padding: "6px 8px",
        border: "1px solid #d4d4d8",
        borderRadius: 6,
        textAlign: "right",
        color: "black"
      }}
    />
  </label>

  {/* Confidence */}
  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ fontSize: 12, color: "#374151" }}>Confidence</span>
    <input
      type="number"
      min={0}
      max={100}
      step={1}
      value={confidence}
      onChange={(e) => onChangeConfidence(Number(e.target.value))}
      onWheel={(e) => {
        e.preventDefault();
        const dir = e.deltaY > 0 ? -1 : 1;
        onChangeConfidence(confidence + dir);
      }}
      style={{
        width: 92,
        padding: "6px 8px",
        border: "1px solid #d4d4d8",
        borderRadius: 6,
        textAlign: "right",
        color: "black"
      }}
    />
  </label>
</div>


    </div>
  );
}
