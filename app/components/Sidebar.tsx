"use client";

const keyStyle: React.CSSProperties = {
  border: "1px solid #d4d4d8",
  borderRadius: 4,
  padding: "4px 8px",
  textAlign: "center",
  background: "#f9fafb",
  fontSize: 12,
  fontWeight: 500,
};


type Props = {
  onAddScene: () => void;
  xRayEnabled: boolean;
  onToggleXRay: () => void;
  density: number;
  confidence: number;
  onChangeDensity: (v: number) => void;
  onChangeConfidence: (v: number) => void;
  onAddTimeSliders: () => void;   // <-- add this
};

export default function Sidebar({
  onAddScene,
  xRayEnabled,
  onToggleXRay,
  density,
  confidence,
  onChangeDensity,
  onChangeConfidence,
  onAddTimeSliders
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
<div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    marginTop: 12,
    gap: 24, // space between WASD and Shift/Space
    fontSize: 12,
    color: "#374151",
  }}
>

    {/* Instruction text */}
  <div style={{ fontWeight: 500, color: "#111827" }}>
    Click on the ores (yellow boxes)
  </div>
  {/* WASD cluster */}
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
      <div style={keyStyle}>W</div>
    </div>
    <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
      <div style={keyStyle}>A</div>
      <div style={keyStyle}>S</div>
      <div style={keyStyle}>D</div>
    </div>
    <div style={{ marginTop: 4 }}>Move</div>
  </div>

  {/* Shift + Space cluster */}
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
    <div style={{ display: "flex", gap: 6 }}>
      <div style={{ ...keyStyle, width: 50 }}>Shift</div>
      <div style={{ ...keyStyle, width: 60 }}>Space</div>
    </div>
    <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 4 }}>
      <span>Down</span>
      <span>Up</span>
    </div>
  </div>
</div>

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
  onClick={onAddTimeSliders}
  style={{
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #d4d4d8",
    background: "#fff",
    cursor: "pointer",
    marginLeft: 8,
    backgroundColor: "#111827"
  }}
>
  Temporal Comparison
</button>

{/* <button
  onClick={onAddScene}
  style={{
    padding: "8px 12px",
    borderRadius: 6,
    border: "1px solid #d4d4d8",
    background: "#111827",
    cursor: "pointer",
  }}
>
  Add Scene
</button> */}


<div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  {/* Density */}
  <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <span style={{ fontSize: 12, color: "#374151" }}>Density Threshold</span>
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
    <span style={{ fontSize: 12, color: "#374151" }}>Confidence Threshold</span>
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
